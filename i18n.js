// FFmpresto - Internationalization

const translations = {
  fr: {
    pageTitle: "FFmpresto - Compression Vidéo",
    tagline: "Compresse tes vidéos en un éclair",
    dropText: "Glisse ta vidéo ici",
    dropSubtext: "ou clique pour sélectionner",
    settings: "Paramètres",
    presetLabel: "Preset",
    presetBalanced: "Équilibré",
    presetBalancedDesc: "Compression standard",
    presetAI: "AI-Optimized",
    presetAIDesc: "1 FPS, max 400Mo",
    presetCustom: "Custom",
    presetCustomDesc: "Paramètres manuels",
    aiInfoTitle: "Optimisé pour l'IA",
    aiInfoDesc: "1 image/seconde • Qualité moyenne • Audio optionnel",
    aiInfoHint: "Parfait pour envoyer à Gemini.",
    audioLabel: "Inclure l'audio",
    audioDesc: "L'IA peut transcrire l'audio pour améliorer son analyse",
    qualityLabel: "Qualité",
    qualityLight: "Légère",
    qualityLightDesc: "Fichier plus petit",
    qualityBalanced: "Équilibrée",
    qualityBalancedDesc: "Recommandé",
    qualityHigh: "Haute",
    qualityHighDesc: "Meilleure qualité",
    fpsLabel: "Images/seconde (FPS)",
    maxSizeLabel: "Taille max (Mo)",
    maxSizePlaceholder: "Illimité",
    resolutionLabel: "Résolution",
    original: "Original",
    originalRes: "Originale",
    compressBtn: "Compresser",
    progressLoading: "Chargement de FFmpeg...",
    progressUploading: "Envoi de la vidéo...",
    progressProcessing: "Compression (FFmpeg natif)...",
    progressAI: "Optimisation IA (FFmpeg natif)...",
    progressHint: "La première compression peut prendre un moment pour charger FFmpeg",
    resultTitle: "Compression terminée!",
    resultBefore: "Avant",
    resultAfter: "Après",
    resultReduction: "Réduction",
    downloadBtn: "Télécharger",
    newFileBtn: "Nouvelle vidéo",
    footerText: "Propulsé par",
    footerLocal: "Tout se passe dans ton ordinateur",
    footerCredit: "Créé par"
  },
  en: {
    pageTitle: "FFmpresto - Video Compression",
    tagline: "Compress your videos in a flash",
    dropText: "Drop your video here",
    dropSubtext: "or click to select",
    settings: "Settings",
    presetLabel: "Preset",
    presetBalanced: "Balanced",
    presetBalancedDesc: "Standard compression",
    presetAI: "AI-Optimized",
    presetAIDesc: "1 FPS, max 400MB",
    presetCustom: "Custom",
    presetCustomDesc: "Manual settings",
    aiInfoTitle: "Optimized for AI",
    aiInfoDesc: "1 frame/second • Medium quality • Optional audio",
    aiInfoHint: "Perfect for sending to Gemini.",
    audioLabel: "Include audio",
    audioDesc: "AI can transcribe audio to improve its analysis",
    qualityLabel: "Quality",
    qualityLight: "Light",
    qualityLightDesc: "Smaller file",
    qualityBalanced: "Balanced",
    qualityBalancedDesc: "Recommended",
    qualityHigh: "High",
    qualityHighDesc: "Better quality",
    fpsLabel: "Frames/second (FPS)",
    maxSizeLabel: "Max size (MB)",
    maxSizePlaceholder: "Unlimited",
    resolutionLabel: "Resolution",
    original: "Original",
    originalRes: "Original",
    compressBtn: "Compress",
    progressLoading: "Loading FFmpeg...",
    progressUploading: "Uploading video...",
    progressProcessing: "Compressing (Native FFmpeg)...",
    progressAI: "AI Optimization (Native FFmpeg)...",
    progressHint: "First compression might take a moment to load FFmpeg",
    resultTitle: "Compression complete!",
    resultBefore: "Before",
    resultAfter: "After",
    resultReduction: "Reduction",
    downloadBtn: "Download",
    newFileBtn: "New video",
    footerText: "Powered by",
    footerLocal: "Everything happens on your computer",
    footerCredit: "Created by"
  }
};

// Get browser language
function getBrowserLanguage() {
  const lang = navigator.language || navigator.userLanguage;
  return lang.startsWith('fr') ? 'fr' : 'en';
}

// Get stored language or browser language
function getCurrentLanguage() {
  return localStorage.getItem('ffmpresto-lang') || getBrowserLanguage();
}

// Set language
function setLanguage(lang) {
  localStorage.setItem('ffmpresto-lang', lang);
  document.documentElement.lang = lang;
  
  // Update page title
  document.title = translations[lang].pageTitle;
  
  // Update all elements with data-i18n
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (translations[lang] && translations[lang][key]) {
      el.textContent = translations[lang][key];
    }
  });
  
  // Update placeholders with data-i18n-placeholder
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    if (translations[lang] && translations[lang][key]) {
      el.placeholder = translations[lang][key];
    }
  });
  
  // Update language buttons
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-lang') === lang);
  });
}

// Initialize language on load
document.addEventListener('DOMContentLoaded', () => {
  const lang = getCurrentLanguage();
  setLanguage(lang);
  
  // Language switcher
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      setLanguage(btn.getAttribute('data-lang'));
    });
  });
});

// Export for use in app.js
window.i18n = {
  t: (key) => {
    const lang = getCurrentLanguage();
    return translations[lang][key] || key;
  },
  setLanguage,
  getCurrentLanguage
};
