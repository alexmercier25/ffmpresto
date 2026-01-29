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
    crf: 26,
    fps: 24,
    scale: 1280,
    preset: 'faster'
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
      ? window.i18n.t('progressAI')
      : window.i18n.t('progressProcessing');
    progressPercent.textContent = '0%';
    progressFill.style.width = '0%';
    
    // Poll for compression progress
    pollInterval = setInterval(async () => {
      try {
        const progressRes = await fetch(`/api/progress/${id}`);
        const data = await progressRes.json();
        
        if (data.status === 'uploading') {
          progressStatus.textContent = window.i18n.t('progressUploading');
          progressPercent.textContent = data.uploadProgress + '%';
          progressFill.style.width = data.uploadProgress + '%';
        } else if (data.status === 'processing') {
          progressStatus.textContent = currentPreset === 'ai' 
            ? window.i18n.t('progressAI')
            : window.i18n.t('progressProcessing');
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

// ============ NAVIGATION ============
const sidebar = document.querySelector('.sidebar');
const sidebarOverlay = document.getElementById('sidebarOverlay');
const menuToggle = document.getElementById('menuToggle');
const navItems = document.querySelectorAll('.nav-item');
const pages = document.querySelectorAll('.page');

// Toggle mobile sidebar
function toggleSidebar() {
  sidebar.classList.toggle('open');
  sidebarOverlay.classList.toggle('active');
}

// Close sidebar
function closeSidebar() {
  sidebar.classList.remove('open');
  sidebarOverlay.classList.remove('active');
}

// Navigate to page
function navigateTo(pageName) {
  // Update nav items
  navItems.forEach(item => {
    item.classList.toggle('active', item.dataset.page === pageName);
  });

  // Update pages
  pages.forEach(page => {
    page.classList.toggle('active', page.id === `page-${pageName}`);
  });

  // Close mobile sidebar
  closeSidebar();

  // Special handling for settings page
  if (pageName === 'settings') {
    updateSettingsPage();
  }
}

// Update settings page API key status
async function updateSettingsPage() {
  const hasKey = await checkApiKey();
  const statusEl = document.getElementById('settingsApiKeyStatus');
  const statusText = statusEl.querySelector('.status-text');
  const deleteBtn = document.getElementById('settingsDeleteApiKeyBtn');
  const inputGroup = statusEl.nextElementSibling;

  if (hasKey) {
    statusEl.classList.add('configured');
    statusText.textContent = window.i18n.t('settingsApiConfigured');
    deleteBtn.classList.remove('hidden');
    inputGroup.classList.add('hidden');
  } else {
    statusEl.classList.remove('configured');
    statusText.textContent = window.i18n.t('settingsApiNotConfigured');
    deleteBtn.classList.add('hidden');
    inputGroup.classList.remove('hidden');
  }
}

// Event listeners for navigation
menuToggle.addEventListener('click', toggleSidebar);
sidebarOverlay.addEventListener('click', closeSidebar);

navItems.forEach(item => {
  item.addEventListener('click', (e) => {
    e.preventDefault();
    navigateTo(item.dataset.page);
  });
});

// Settings page API key handlers
const settingsApiKeyInput = document.getElementById('settingsApiKeyInput');
const settingsSaveApiKeyBtn = document.getElementById('settingsSaveApiKeyBtn');
const settingsDeleteApiKeyBtn = document.getElementById('settingsDeleteApiKeyBtn');

settingsSaveApiKeyBtn.addEventListener('click', async () => {
  const key = settingsApiKeyInput.value.trim();
  if (key) {
    const saved = await saveApiKey(key);
    if (saved) {
      settingsApiKeyInput.value = '';
      await updateSettingsPage();
    }
  }
});

settingsApiKeyInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    settingsSaveApiKeyBtn.click();
  }
});

settingsDeleteApiKeyBtn.addEventListener('click', async () => {
  if (confirm(window.i18n.t('geminiDeleteConfirm'))) {
    await deleteApiKey();
    await updateSettingsPage();
  }
});

// ============ GEMINI INTEGRATION ============

// Gemini DOM Elements
const geminiSection = document.getElementById('geminiSection');
const geminiSetup = document.getElementById('geminiSetup');
const geminiActions = document.getElementById('geminiActions');
const geminiStatus = document.getElementById('geminiStatus');
const apiKeyInput = document.getElementById('apiKeyInput');
const saveApiKeyBtn = document.getElementById('saveApiKeyBtn');
const geminiConfigBtn = document.getElementById('geminiConfigBtn');
const uploadToGeminiBtn = document.getElementById('uploadToGeminiBtn');
const magicButtons = document.getElementById('magicButtons');
const magicBtns = document.querySelectorAll('.magic-btn');
const customPromptInput = document.getElementById('customPromptInput');
const sendCustomPromptBtn = document.getElementById('sendCustomPromptBtn');
const geminiResponse = document.getElementById('geminiResponse');
const geminiResponseContent = document.getElementById('geminiResponseContent');
const copyResponseBtn = document.getElementById('copyResponseBtn');

// Gemini state
let geminiFileUploaded = false;

// Check API key on load and show Gemini section if AI preset was used
async function checkApiKey() {
  try {
    const res = await fetch('/api/gemini/key');
    const data = await res.json();
    return data.hasKey;
  } catch (e) {
    console.error('Error checking API key:', e);
    return false;
  }
}

// Save API key
async function saveApiKey(key) {
  try {
    const res = await fetch('/api/gemini/key', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ apiKey: key })
    });
    const data = await res.json();
    return data.success;
  } catch (e) {
    console.error('Error saving API key:', e);
    return false;
  }
}

// Delete API key
async function deleteApiKey() {
  try {
    await fetch('/api/gemini/key', { method: 'DELETE' });
  } catch (e) {
    console.error('Error deleting API key:', e);
  }
}

// Update Gemini UI based on key status
async function updateGeminiUI() {
  const hasKey = await checkApiKey();

  if (hasKey) {
    geminiSetup.classList.add('hidden');
    geminiActions.classList.remove('hidden');
  } else {
    geminiSetup.classList.remove('hidden');
    geminiActions.classList.add('hidden');
  }
}

// Set Gemini status message
function setGeminiStatus(text, state = 'ready') {
  const statusDot = geminiStatus.querySelector('.status-dot');
  const statusText = geminiStatus.querySelector('.status-text');

  statusDot.classList.remove('loading', 'error');
  if (state === 'loading') statusDot.classList.add('loading');
  if (state === 'error') statusDot.classList.add('error');

  statusText.textContent = text;
}

// Upload video to Gemini
async function uploadToGemini() {
  if (!currentJobId) return;

  uploadToGeminiBtn.disabled = true;
  uploadToGeminiBtn.innerHTML = '<span class="loading-spinner"></span><span>' + window.i18n.t('geminiUploading') + '</span>';
  setGeminiStatus(window.i18n.t('geminiUploading'), 'loading');

  try {
    const res = await fetch('/api/gemini/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jobId: currentJobId })
    });

    const data = await res.json();

    if (data.success) {
      geminiFileUploaded = true;
      uploadToGeminiBtn.classList.add('hidden');
      magicButtons.classList.remove('hidden');
      setGeminiStatus(window.i18n.t('geminiReadyAnalyze'), 'ready');
    } else {
      throw new Error(data.error);
    }
  } catch (e) {
    console.error('Upload to Gemini failed:', e);
    setGeminiStatus(window.i18n.t('geminiError') + ': ' + e.message, 'error');
    uploadToGeminiBtn.disabled = false;
    uploadToGeminiBtn.innerHTML = '<span class="btn-icon">☁️</span><span>' + window.i18n.t('geminiUpload') + '</span>';
  }
}

// Send prompt to Gemini
async function sendPrompt(promptType, customPrompt = null) {
  if (!currentJobId || !geminiFileUploaded) return;

  // Disable all buttons
  magicBtns.forEach(btn => btn.disabled = true);
  sendCustomPromptBtn.disabled = true;
  setGeminiStatus(window.i18n.t('geminiAnalyzing'), 'loading');

  try {
    const res = await fetch('/api/gemini/prompt', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jobId: currentJobId,
        promptType: promptType,
        prompt: customPrompt
      })
    });

    const data = await res.json();

    if (data.success) {
      geminiResponseContent.textContent = data.response;
      geminiResponse.classList.remove('hidden');
      setGeminiStatus(window.i18n.t('geminiComplete'), 'ready');
    } else {
      throw new Error(data.error);
    }
  } catch (e) {
    console.error('Gemini prompt failed:', e);
    setGeminiStatus(window.i18n.t('geminiError') + ': ' + e.message, 'error');
  } finally {
    // Re-enable buttons
    magicBtns.forEach(btn => btn.disabled = false);
    sendCustomPromptBtn.disabled = false;
  }
}

// Copy response to clipboard
function copyResponse() {
  const text = geminiResponseContent.textContent;
  navigator.clipboard.writeText(text).then(() => {
    const originalTitle = copyResponseBtn.title;
    copyResponseBtn.title = window.i18n.t('geminiCopied');
    setTimeout(() => {
      copyResponseBtn.title = originalTitle;
    }, 2000);
  });
}

// Event Listeners for Gemini
saveApiKeyBtn.addEventListener('click', async () => {
  const key = apiKeyInput.value.trim();
  if (key) {
    const saved = await saveApiKey(key);
    if (saved) {
      apiKeyInput.value = '';
      await updateGeminiUI();
    }
  }
});

apiKeyInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    saveApiKeyBtn.click();
  }
});

geminiConfigBtn.addEventListener('click', async () => {
  // Toggle between showing setup and actions
  const hasKey = await checkApiKey();
  if (hasKey) {
    if (confirm(window.i18n.t('geminiDeleteConfirm'))) {
      await deleteApiKey();
      await updateGeminiUI();
      magicButtons.classList.add('hidden');
      uploadToGeminiBtn.classList.remove('hidden');
      uploadToGeminiBtn.disabled = false;
      uploadToGeminiBtn.innerHTML = '<span class="btn-icon">☁️</span><span>' + window.i18n.t('geminiUpload') + '</span>';
      geminiFileUploaded = false;
    }
  }
});

uploadToGeminiBtn.addEventListener('click', uploadToGemini);

magicBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    sendPrompt(btn.dataset.prompt);
  });
});

sendCustomPromptBtn.addEventListener('click', () => {
  const prompt = customPromptInput.value.trim();
  if (prompt) {
    sendPrompt('custom', prompt);
    customPromptInput.value = '';
  }
});

customPromptInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    sendCustomPromptBtn.click();
  }
});

copyResponseBtn.addEventListener('click', copyResponse);

// Modify showResults to show Gemini section for AI preset
const originalShowResults = showResults;
showResults = function(inputSize, outputSize) {
  originalShowResults(inputSize, outputSize);

  // Show Gemini section only for AI preset
  if (currentPreset === 'ai') {
    geminiSection.classList.remove('hidden');
    geminiFileUploaded = false;
    uploadToGeminiBtn.classList.remove('hidden');
    uploadToGeminiBtn.disabled = false;
    uploadToGeminiBtn.innerHTML = '<span class="btn-icon">☁️</span><span>' + window.i18n.t('geminiUpload') + '</span>';
    magicButtons.classList.add('hidden');
    geminiResponse.classList.add('hidden');
    updateGeminiUI();
    setGeminiStatus(window.i18n.t('geminiReady'), 'ready');
  } else {
    geminiSection.classList.add('hidden');
  }
};

// Modify resetToDropZone to reset Gemini state
const originalResetToDropZone = resetToDropZone;
resetToDropZone = function() {
  originalResetToDropZone();
  geminiSection.classList.add('hidden');
  geminiFileUploaded = false;
};

console.log('⚡ FFmpresto loaded (Native FFmpeg mode)');
