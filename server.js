// FFmpresto Server - Uses native FFmpeg for fast compression
const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn, execSync } = require('child_process');
const os = require('os');

const PORT = 8888;
const TEMP_DIR = path.join(os.tmpdir(), 'ffmpresto');

// Check FFmpeg at startup
function checkFFmpeg() {
  try {
    execSync('ffmpeg -version', { stdio: 'pipe' });
    return true;
  } catch (e) {
    return false;
  }
}

if (!checkFFmpeg()) {
  console.error(`
  ❌ FFmpeg n'est pas installé!
  
  Pour l'installer sur macOS:
    brew install ffmpeg
  
  Pour l'installer sur Ubuntu/Debian:
    sudo apt install ffmpeg
  
  Pour l'installer sur Windows:
    Télécharge depuis https://ffmpeg.org/download.html
  `);
  process.exit(1);
}

// Ensure temp directory exists
if (!fs.existsSync(TEMP_DIR)) {
  fs.mkdirSync(TEMP_DIR, { recursive: true });
}

const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.wasm': 'application/wasm',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.mov': 'video/quicktime',
  '.avi': 'video/x-msvideo',
  '.mkv': 'video/x-matroska',
};

// Track active compressions
const activeCompressions = new Map();

const server = http.createServer((req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Filename, X-Settings');
  
  // Required headers for SharedArrayBuffer (fallback)
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // API: Upload and compress (streaming)
  if (req.method === 'POST' && req.url === '/api/compress') {
    handleCompressStream(req, res);
    return;
  }

  // API: Check progress
  if (req.method === 'GET' && req.url.startsWith('/api/progress/')) {
    const id = req.url.split('/').pop();
    handleProgress(id, res);
    return;
  }

  // API: Download result
  if (req.method === 'GET' && req.url.startsWith('/api/download/')) {
    const id = req.url.split('/').pop();
    handleDownload(id, res);
    return;
  }

  // Static files
  let filePath = req.url === '/' ? '/index.html' : req.url.split('?')[0];
  filePath = path.join(__dirname, filePath);
  
  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';
  
  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        res.writeHead(404);
        res.end('404 - File Not Found');
      } else {
        res.writeHead(500);
        res.end('500 - Server Error');
      }
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    }
  });
});

function handleCompressStream(req, res) {
  const id = Date.now().toString(36) + Math.random().toString(36).substr(2);
  
  // Get settings from headers
  const fileName = req.headers['x-filename'] || 'video.mp4';
  let settings;
  try {
    settings = JSON.parse(req.headers['x-settings'] || '{}');
  } catch (e) {
    settings = { crf: 23, fps: 0, scale: 0, noAudio: false, preset: 'medium' };
  }
  
  const inputExt = path.extname(fileName).toLowerCase() || '.mp4';
  const inputPath = path.join(TEMP_DIR, `${id}_input${inputExt}`);
  const outputPath = path.join(TEMP_DIR, `${id}_output.mp4`);
  
  // Stream file to disk
  const writeStream = fs.createWriteStream(inputPath);
  let uploadedBytes = 0;
  const totalBytes = parseInt(req.headers['content-length']) || 0;
  
  // Initialize state
  activeCompressions.set(id, {
    status: 'uploading',
    progress: 0,
    uploadProgress: 0,
    inputPath,
    outputPath,
    inputSize: totalBytes,
    outputSize: 0,
    error: null
  });
  
  console.log(`[${id}] Starting upload: ${fileName} (${formatSize(totalBytes)})`);
  
  req.on('data', (chunk) => {
    writeStream.write(chunk);
    uploadedBytes += chunk.length;
    
    const state = activeCompressions.get(id);
    if (state && totalBytes > 0) {
      state.uploadProgress = Math.round((uploadedBytes / totalBytes) * 100);
    }
  });
  
  req.on('end', () => {
    writeStream.end();
    
    const state = activeCompressions.get(id);
    if (state) {
      state.status = 'processing';
      state.inputSize = uploadedBytes;
    }
    
    console.log(`[${id}] Upload complete, starting compression...`);
    
    // Start compression
    startCompression(id, inputPath, outputPath, settings);
  });
  
  req.on('error', (err) => {
    console.error(`[${id}] Upload error:`, err);
    writeStream.destroy();
    if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
    
    const state = activeCompressions.get(id);
    if (state) {
      state.status = 'error';
      state.error = err.message;
    }
  });
  
  // Return job ID immediately
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ id, status: 'uploading' }));
}

function startCompression(id, inputPath, outputPath, settings) {
  const args = buildFFmpegArgs(inputPath, outputPath, settings);
  
  console.log(`[${id}] FFmpeg:`, 'ffmpeg', args.join(' '));
  
  const ffmpeg = spawn('ffmpeg', args);
  
  let duration = 0;
  let lastProgress = 0;
  
  ffmpeg.stderr.on('data', (data) => {
    const output = data.toString();
    
    // Extract duration
    const durationMatch = output.match(/Duration: (\d{2}):(\d{2}):(\d{2})/);
    if (durationMatch) {
      duration = parseInt(durationMatch[1]) * 3600 + 
                 parseInt(durationMatch[2]) * 60 + 
                 parseInt(durationMatch[3]);
    }
    
    // Extract current time for progress
    const timeMatch = output.match(/time=(\d{2}):(\d{2}):(\d{2})/);
    if (timeMatch && duration > 0) {
      const currentTime = parseInt(timeMatch[1]) * 3600 + 
                          parseInt(timeMatch[2]) * 60 + 
                          parseInt(timeMatch[3]);
      const progress = Math.min(99, Math.round((currentTime / duration) * 100));
      
      if (progress > lastProgress) {
        lastProgress = progress;
        const state = activeCompressions.get(id);
        if (state) {
          state.progress = progress;
        }
      }
    }
  });
  
  ffmpeg.on('close', (code) => {
    const state = activeCompressions.get(id);
    if (!state) return;
    
    if (code === 0 && fs.existsSync(outputPath)) {
      const stats = fs.statSync(outputPath);
      state.status = 'complete';
      state.progress = 100;
      state.outputSize = stats.size;
      
      const inputStats = fs.existsSync(inputPath) ? fs.statSync(inputPath) : { size: state.inputSize };
      console.log(`[${id}] ✓ Complete: ${formatSize(inputStats.size)} → ${formatSize(stats.size)} (${Math.round((1 - stats.size/inputStats.size) * 100)}% reduction)`);
      
      // Clean up input file
      if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
    } else {
      state.status = 'error';
      state.error = `FFmpeg exited with code ${code}`;
      console.error(`[${id}] ✗ Failed:`, state.error);
      
      // Clean up
      if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
      if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
    }
  });
  
  ffmpeg.on('error', (err) => {
    const state = activeCompressions.get(id);
    if (state) {
      state.status = 'error';
      state.error = err.message;
    }
    console.error(`[${id}] FFmpeg error:`, err.message);
  });
}

function buildFFmpegArgs(input, output, settings) {
  const args = ['-y', '-i', input];
  
  // Video filters
  const filters = [];
  
  if (settings.fps > 0) {
    filters.push(`fps=${settings.fps}`);
  }
  
  if (settings.scale > 0) {
    filters.push(`scale=${settings.scale}:-2`);
  }
  
  if (filters.length > 0) {
    args.push('-vf', filters.join(','));
  }
  
  // Video codec
  args.push('-c:v', 'libx264');
  args.push('-crf', (settings.crf || 23).toString());
  args.push('-preset', settings.preset || 'medium');
  
  // Audio
  if (settings.noAudio) {
    args.push('-an');
  } else {
    args.push('-c:a', 'aac', '-b:a', '128k');
  }
  
  args.push(output);
  
  return args;
}

function handleProgress(id, res) {
  const state = activeCompressions.get(id);
  
  if (!state) {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Job not found' }));
    return;
  }
  
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({
    status: state.status,
    progress: state.progress,
    uploadProgress: state.uploadProgress,
    inputSize: state.inputSize,
    outputSize: state.outputSize,
    error: state.error
  }));
}

function handleDownload(id, res) {
  const state = activeCompressions.get(id);
  
  if (!state || state.status !== 'complete') {
    res.writeHead(404);
    res.end('File not found or not ready');
    return;
  }
  
  const filePath = state.outputPath;
  
  if (!fs.existsSync(filePath)) {
    res.writeHead(404);
    res.end('File not found');
    return;
  }
  
  const stat = fs.statSync(filePath);
  
  res.writeHead(200, {
    'Content-Type': 'video/mp4',
    'Content-Length': stat.size,
    'Content-Disposition': `attachment; filename="compressed_${id}.mp4"`
  });
  
  const stream = fs.createReadStream(filePath);
  stream.pipe(res);
  
  stream.on('end', () => {
    // Clean up after download
    setTimeout(() => {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log(`[${id}] Cleaned up`);
      }
      activeCompressions.delete(id);
    }, 5000);
  });
}

function formatSize(bytes) {
  const sizes = ['B', 'KB', 'MB', 'GB'];
  if (bytes === 0) return '0 B';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return (bytes / Math.pow(1024, i)).toFixed(2) + ' ' + sizes[i];
}

server.listen(PORT, () => {
  console.log(`
  ⚡ FFmpresto Server (Native FFmpeg)
  
  URL: http://localhost:${PORT}
  Temp: ${TEMP_DIR}
  
  Utilise FFmpeg natif pour une compression ultra-rapide!
  `);
});

// Cleanup on exit
process.on('SIGINT', () => {
  console.log('\nNettoyage...');
  for (const [id, state] of activeCompressions) {
    if (fs.existsSync(state.inputPath)) fs.unlinkSync(state.inputPath);
    if (fs.existsSync(state.outputPath)) fs.unlinkSync(state.outputPath);
  }
  process.exit();
});
