// FFmpresto - Video Compression Tool
// Uses ffmpeg.wasm 0.11.x for in-browser video processing

const { createFFmpeg, fetchFile } = FFmpeg;

// State
let ffmpeg = null;
let selectedFile = null;
let currentPreset = 'balanced';
let selectedCrf = 23;
let selectedFps = 0; // 0 = original
let selectedScale = 0; // 0 = original
let compressedBlob = null;

// Preset configurations
const PRESETS = {
  balanced: {
    crf: 23,
    fps: 0,
    scale: 0,
    maxSize: null
  },
  ai: {
    crf: 28,
    fps: 1,
    scale: 1280,
    maxSize: 400
  },
  custom: null // Uses manual settings
};

// DOM Elements
const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');
const fileInfo = document.getElementById('fileInfo');
const fileName = document.getElementById('fileName');
const fileSize = document.getElementById('fileSize');
const removeFileBtn = document.getElementById('removeFile');
const settings = document.getElementById('settings');
const presetBtns = document.querySelectorAll('.preset-btn');
const aiPresetInfo = document.getElementById('aiPresetInfo');
const customOptions = document.getElementById('customOptions');
const qualityBtns = document.querySelectorAll('.quality-btn');
const fpsSelect = document.getElementById('fpsSelect');
const scaleSelect = document.getElementById('scaleSelect');
const maxSizeInput = document.getElementById('maxSize');
const compressBtn = document.getElementById('compressBtn');
const progress = document.getElementById('progress');
const progressStatus = document.getElementById('progressStatus');
const progressPercent = document.getElementById('progressPercent');
const progressFill = document.getElementById('progressFill');
const result = document.getElementById('result');
const originalSize = document.getElementById('originalSize');
const compressedSize = document.getElementById('compressedSize');
const reduction = document.getElementById('reduction');
const downloadBtn = document.getElementById('downloadBtn');
const newFileBtn = document.getElementById('newFile');

// Utility Functions
function formatFileSize(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'Ko', 'Mo', 'Go'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function getOutputFileName(inputName) {
  const parts = inputName.split('.');
  parts.pop();
  const suffix = currentPreset === 'ai' ? '_ai' : '_compressed';
  return parts.join('.') + suffix + '.mp4';
}

// Initialize FFmpeg
async function initFFmpeg() {
  if (ffmpeg && ffmpeg.isLoaded()) return ffmpeg;
  
  ffmpeg = createFFmpeg({
    log: true,
    progress: ({ ratio }) => {
      const percent = Math.round(ratio * 100);
      progressPercent.textContent = percent + '%';
      progressFill.style.width = percent + '%';
    }
  });
  
  await ffmpeg.load();
  
  return ffmpeg;
}

// Preset Management
function setPreset(preset) {
  currentPreset = preset;
  
  // Update UI
  presetBtns.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.preset === preset);
  });
  
  // Show/hide relevant sections
  aiPresetInfo.classList.toggle('hidden', preset !== 'ai');
  customOptions.classList.toggle('hidden', preset !== 'custom');
  
  // Apply preset values
  if (preset === 'balanced') {
    selectedCrf = PRESETS.balanced.crf;
    selectedFps = PRESETS.balanced.fps;
    selectedScale = PRESETS.balanced.scale;
  } else if (preset === 'ai') {
    selectedCrf = PRESETS.ai.crf;
    selectedFps = PRESETS.ai.fps;
    selectedScale = PRESETS.ai.scale;
  }
  // For 'custom', values are set manually by the user
}

// File Selection
function handleFileSelect(file) {
  if (!file || !file.type.startsWith('video/')) {
    alert('Veuillez sélectionner un fichier vidéo valide.');
    return;
  }
  
  selectedFile = file;
  fileName.textContent = file.name;
  fileSize.textContent = formatFileSize(file.size);
  
  dropZone.classList.add('hidden');
  fileInfo.classList.remove('hidden');
  settings.classList.remove('hidden');
  progress.classList.add('hidden');
  result.classList.add('hidden');
}

function resetToDropZone() {
  selectedFile = null;
  compressedBlob = null;
  
  dropZone.classList.remove('hidden');
  fileInfo.classList.add('hidden');
  settings.classList.add('hidden');
  progress.classList.add('hidden');
  result.classList.add('hidden');
  
  fileInput.value = '';
}

// Get current settings based on preset
function getCurrentSettings() {
  if (currentPreset === 'custom') {
    return {
      crf: selectedCrf,
      fps: parseInt(fpsSelect.value),
      scale: parseInt(scaleSelect.value),
      maxSize: maxSizeInput.value ? parseInt(maxSizeInput.value) : null
    };
  } else if (currentPreset === 'ai') {
    return PRESETS.ai;
  } else {
    return PRESETS.balanced;
  }
}

// Compression
async function compressVideo() {
  if (!selectedFile) return;
  
  const settings = getCurrentSettings();
  
  // Show progress
  document.getElementById('settings').classList.add('hidden');
  progress.classList.remove('hidden');
  progressStatus.textContent = 'Chargement de FFmpeg...';
  progressPercent.textContent = '0%';
  progressFill.style.width = '0%';
  
  try {
    // Initialize FFmpeg
    await initFFmpeg();
    progressStatus.textContent = 'Préparation...';
    
    // Get input file extension
    const inputExt = selectedFile.name.split('.').pop().toLowerCase();
    const inputFileName = `input.${inputExt}`;
    const outputFileName = 'output.mp4';
    
    // Write file to FFmpeg virtual filesystem
    ffmpeg.FS('writeFile', inputFileName, await fetchFile(selectedFile));
    
    progressStatus.textContent = currentPreset === 'ai' 
      ? 'Optimisation pour IA (1 FPS)...' 
      : 'Compression en cours...';
    
    // Build FFmpeg command
    const ffmpegArgs = ['-i', inputFileName];
    
    // Video filters
    const filters = [];
    
    // FPS filter
    if (settings.fps > 0) {
      filters.push(`fps=${settings.fps}`);
    }
    
    // Scale filter
    if (settings.scale > 0) {
      filters.push(`scale=${settings.scale}:-2`);
    }
    
    // Apply filters if any
    if (filters.length > 0) {
      ffmpegArgs.push('-vf', filters.join(','));
    }
    
    // Video codec settings
    ffmpegArgs.push('-c:v', 'libx264');
    ffmpegArgs.push('-crf', settings.crf.toString());
    ffmpegArgs.push('-preset', 'medium');
    
    // Audio settings (remove audio for AI preset to save space)
    if (currentPreset === 'ai') {
      ffmpegArgs.push('-an'); // No audio for AI
    } else {
      ffmpegArgs.push('-c:a', 'aac');
      ffmpegArgs.push('-b:a', '128k');
    }
    
    // Output
    ffmpegArgs.push('-y', outputFileName);
    
    console.log('FFmpeg args:', ffmpegArgs);
    
    // Execute
    await ffmpeg.run(...ffmpegArgs);
    
    // Read output file
    const data = ffmpeg.FS('readFile', outputFileName);
    compressedBlob = new Blob([data.buffer], { type: 'video/mp4' });
    
    // Cleanup
    ffmpeg.FS('unlink', inputFileName);
    ffmpeg.FS('unlink', outputFileName);
    
    // Show results
    showResults();
    
  } catch (error) {
    console.error('Compression error:', error);
    alert('Erreur lors de la compression: ' + error.message);
    progress.classList.add('hidden');
    document.getElementById('settings').classList.remove('hidden');
  }
}

function showResults() {
  progress.classList.add('hidden');
  result.classList.remove('hidden');
  
  const origSize = selectedFile.size;
  const compSize = compressedBlob.size;
  const reductionPercent = Math.round((1 - compSize / origSize) * 100);
  
  originalSize.textContent = formatFileSize(origSize);
  compressedSize.textContent = formatFileSize(compSize);
  reduction.textContent = reductionPercent > 0 ? reductionPercent + '%' : '0%';
}

function downloadCompressed() {
  if (!compressedBlob) return;
  
  const url = URL.createObjectURL(compressedBlob);
  const a = document.createElement('a');
  a.href = url;
  a.download = getOutputFileName(selectedFile.name);
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Event Listeners

// Drop Zone
dropZone.addEventListener('click', () => fileInput.click());

dropZone.addEventListener('dragover', (e) => {
  e.preventDefault();
  dropZone.classList.add('dragover');
});

dropZone.addEventListener('dragleave', () => {
  dropZone.classList.remove('dragover');
});

dropZone.addEventListener('drop', (e) => {
  e.preventDefault();
  dropZone.classList.remove('dragover');
  const file = e.dataTransfer.files[0];
  handleFileSelect(file);
});

fileInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  handleFileSelect(file);
});

// Remove file
removeFileBtn.addEventListener('click', resetToDropZone);

// Preset selection
presetBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    setPreset(btn.dataset.preset);
  });
});

// Quality selection (for custom preset)
qualityBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    qualityBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    selectedCrf = parseInt(btn.dataset.crf);
  });
});

// Compress button
compressBtn.addEventListener('click', compressVideo);

// Download button
downloadBtn.addEventListener('click', downloadCompressed);

// New file button
newFileBtn.addEventListener('click', resetToDropZone);

// Initialize with balanced preset
setPreset('balanced');

console.log('⚡ FFmpresto loaded');
