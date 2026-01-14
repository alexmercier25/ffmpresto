// FFmpresto - Video Compression Tool
// Uses native FFmpeg via server for ultra-fast compression

// State
let selectedFile = null;
let currentPreset = 'balanced';
let selectedCrf = 23;
let currentJobId = null;
let pollInterval = null;

// Preset configurations
const PRESETS = {
  balanced: {
    crf: 23,
    fps: 0,
    scale: 0,
    preset: 'medium'
  },
  ai: {
    crf: 28,
    fps: 1,
    scale: 1280,
    preset: 'fast'
  },
  custom: null
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
const includeAudioCheckbox = document.getElementById('includeAudio');
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

// Preset Management
function setPreset(preset) {
  currentPreset = preset;
  
  presetBtns.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.preset === preset);
  });
  
  aiPresetInfo.classList.toggle('hidden', preset !== 'ai');
  customOptions.classList.toggle('hidden', preset !== 'custom');
  
  if (preset === 'balanced') {
    selectedCrf = PRESETS.balanced.crf;
  } else if (preset === 'ai') {
    selectedCrf = PRESETS.ai.crf;
  }
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
  currentJobId = null;
  
  if (pollInterval) {
    clearInterval(pollInterval);
    pollInterval = null;
  }
  
  dropZone.classList.remove('hidden');
  fileInfo.classList.add('hidden');
  settings.classList.add('hidden');
  progress.classList.add('hidden');
  result.classList.add('hidden');
  
  fileInput.value = '';
}

// Get current settings
function getCurrentSettings() {
  const includeAudio = includeAudioCheckbox.checked;
  const baseSettings = {
    noAudio: !includeAudio
  };
  
  if (currentPreset === 'custom') {
    return {
      ...baseSettings,
      crf: selectedCrf,
      fps: parseInt(fpsSelect.value),
      scale: parseInt(scaleSelect.value),
      preset: 'medium'
    };
  } else if (currentPreset === 'ai') {
    return {
      ...PRESETS.ai,
      ...baseSettings
    };
  } else {
    return {
      ...PRESETS.balanced,
      ...baseSettings
    };
  }
}

// Compression via server (streaming upload)
async function compressVideo() {
  if (!selectedFile) return;
  
  const compressionSettings = getCurrentSettings();
  
  // Show progress
  settings.classList.add('hidden');
  progress.classList.remove('hidden');
  progressStatus.textContent = 'Envoi de la vidéo...';
  progressPercent.textContent = '0%';
  progressFill.style.width = '0%';
  
  try {
    // Create XMLHttpRequest for upload progress tracking
    const xhr = new XMLHttpRequest();
    
    // Track upload progress
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        const percent = Math.round((e.loaded / e.total) * 100);
        progressStatus.textContent = `Envoi: ${formatFileSize(e.loaded)} / ${formatFileSize(e.total)}`;
        progressPercent.textContent = percent + '%';
        progressFill.style.width = percent + '%';
      }
    };
    
    // Handle response
    const uploadPromise = new Promise((resolve, reject) => {
      xhr.onload = () => {
        if (xhr.status === 200) {
          try {
            resolve(JSON.parse(xhr.responseText));
          } catch (e) {
            reject(new Error('Invalid response'));
          }
        } else {
          reject(new Error(`Upload failed: ${xhr.status}`));
        }
      };
      xhr.onerror = () => reject(new Error('Network error'));
    });
    
    // Send file directly (streaming)
    xhr.open('POST', '/api/compress');
    xhr.setRequestHeader('X-Filename', selectedFile.name);
    xhr.setRequestHeader('X-Settings', JSON.stringify(compressionSettings));
    xhr.send(selectedFile);
    
    const { id } = await uploadPromise;
    currentJobId = id;
    
    progressStatus.textContent = currentPreset === 'ai' 
      ? 'Optimisation IA (FFmpeg natif)...' 
      : 'Compression (FFmpeg natif)...';
    progressPercent.textContent = '0%';
    progressFill.style.width = '0%';
    
    // Poll for compression progress
    pollInterval = setInterval(async () => {
      try {
        const progressRes = await fetch(`/api/progress/${id}`);
        const data = await progressRes.json();
        
        if (data.status === 'uploading') {
          progressStatus.textContent = 'Réception par le serveur...';
          progressPercent.textContent = data.uploadProgress + '%';
          progressFill.style.width = data.uploadProgress + '%';
        } else if (data.status === 'processing') {
          progressStatus.textContent = currentPreset === 'ai' 
            ? 'Optimisation IA (FFmpeg natif)...' 
            : 'Compression (FFmpeg natif)...';
          progressPercent.textContent = data.progress + '%';
          progressFill.style.width = data.progress + '%';
        } else if (data.status === 'complete') {
          clearInterval(pollInterval);
          pollInterval = null;
          showResults(data.inputSize, data.outputSize);
        } else if (data.status === 'error') {
          clearInterval(pollInterval);
          pollInterval = null;
          throw new Error(data.error);
        }
      } catch (err) {
        if (err.message !== 'Job not found') {
          console.error('Progress poll error:', err);
        }
      }
    }, 500);
    
  } catch (error) {
    console.error('Compression error:', error);
    alert('Erreur lors de la compression: ' + error.message);
    progress.classList.add('hidden');
    settings.classList.remove('hidden');
    
    if (pollInterval) {
      clearInterval(pollInterval);
      pollInterval = null;
    }
  }
}

function showResults(inputSize, outputSize) {
  progress.classList.add('hidden');
  result.classList.remove('hidden');
  
  const reductionPercent = Math.round((1 - outputSize / inputSize) * 100);
  
  originalSize.textContent = formatFileSize(inputSize);
  compressedSize.textContent = formatFileSize(outputSize);
  reduction.textContent = reductionPercent > 0 ? reductionPercent + '%' : '0%';
}

function downloadCompressed() {
  if (!currentJobId) return;
  
  const a = document.createElement('a');
  a.href = `/api/download/${currentJobId}`;
  a.download = getOutputFileName(selectedFile.name);
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
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

// Quality selection
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

// Initialize
setPreset('balanced');

console.log('⚡ FFmpresto loaded (Native FFmpeg mode)');
