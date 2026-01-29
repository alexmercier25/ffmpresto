// FFmpresto - Internationalization

const translations = {
  fr: {
    pageTitle: "FFmpresto - Compression Vidéo",
    tagline: "Compresse tes vidéos en un éclair",
    // Navigation
    navCompress: "Compresser",
    navHistory: "Historique",
    navSettings: "Paramètres",
    // Pages
    compressTitle: "Compression Vidéo",
    historyTitle: "Historique",
    historySubtitle: "Tes compressions récentes",
    historyEmpty: "Aucune compression pour le moment",
    historyEmptyHint: "Tes fichiers compressés apparaîtront ici",
    settingsTitle: "Paramètres",
    settingsSubtitle: "Configuration de l'application",
    settingsGeminiTitle: "API Gemini",
    settingsGeminiDesc: "Connecte ton compte pour l'analyse vidéo IA",
    settingsApiConfigured: "Clé configurée",
    settingsApiNotConfigured: "Non configurée",
    settingsDeleteKey: "Supprimer la clé",
    settingsAboutTitle: "À propos",
    dropText: "Glisse ta vidéo ici",
    dropSubtext: "ou clique pour sélectionner",
    settings: "Paramètres",
    presetLabel: "Preset",
    presetBalanced: "Équilibré",
    presetBalancedDesc: "Compression standard",
    presetAI: "AI-Optimized",
    presetAIDesc: "24 FPS, 720p, max 2Go",
    presetCustom: "Custom",
    presetCustomDesc: "Paramètres manuels",
    aiInfoTitle: "Optimisé pour l'IA",
    aiInfoDesc: "24 images/seconde • 720p • Audio 128k",
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
    footerCredit: "Créé par",
    // Gemini translations
    geminiTitle: "Analyser avec Gemini",
    geminiSetupText: "Configure ta clé API Gemini pour analyser la vidéo directement.",
    geminiSaveKey: "Sauvegarder",
    geminiGetKey: "Obtenir une clé API gratuite",
    geminiReady: "Prêt à analyser",
    geminiReadyAnalyze: "Prêt - Choisis une action",
    geminiUpload: "Envoyer à Gemini",
    geminiUploading: "Envoi en cours...",
    geminiAnalyzing: "Analyse en cours...",
    geminiComplete: "Analyse terminée",
    geminiError: "Erreur",
    geminiMagicLabel: "Actions rapides",
    geminiChapters: "Chapitres",
    geminiSummary: "Résumé TL;DR",
    geminiQuiz: "QCM",
    geminiSentiment: "Sentiment",
    geminiCustomPlaceholder: "Pose ta question...",
    geminiResponseLabel: "Réponse Gemini",
    geminiCopied: "Copié !",
    geminiDeleteConfirm: "Supprimer la clé API Gemini ?"
  },
  en: {
    pageTitle: "FFmpresto - Video Compression",
    tagline: "Compress your videos in a flash",
    // Navigation
    navCompress: "Compress",
    navHistory: "History",
    navSettings: "Settings",
    // Pages
    compressTitle: "Video Compression",
    historyTitle: "History",
    historySubtitle: "Your recent compressions",
    historyEmpty: "No compressions yet",
    historyEmptyHint: "Your compressed files will appear here",
    settingsTitle: "Settings",
    settingsSubtitle: "App configuration",
    settingsGeminiTitle: "Gemini API",
    settingsGeminiDesc: "Connect your account for AI video analysis",
    settingsApiConfigured: "Key configured",
    settingsApiNotConfigured: "Not configured",
    settingsDeleteKey: "Delete key",
    settingsAboutTitle: "About",
    dropText: "Drop your video here",
    dropSubtext: "or click to select",
    settings: "Settings",
    presetLabel: "Preset",
    presetBalanced: "Balanced",
    presetBalancedDesc: "Standard compression",
    presetAI: "AI-Optimized",
    presetAIDesc: "24 FPS, 720p, max 2GB",
    presetCustom: "Custom",
    presetCustomDesc: "Manual settings",
    aiInfoTitle: "Optimized for AI",
    aiInfoDesc: "24 frames/second • 720p • Audio 128k",
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
    footerCredit: "Created by",
    // Gemini translations
    geminiTitle: "Analyze with Gemini",
    geminiSetupText: "Configure your Gemini API key to analyze the video directly.",
    geminiSaveKey: "Save",
    geminiGetKey: "Get a free API key",
    geminiReady: "Ready to analyze",
    geminiReadyAnalyze: "Ready - Choose an action",
    geminiUpload: "Send to Gemini",
    geminiUploading: "Uploading...",
    geminiAnalyzing: "Analyzing...",
    geminiComplete: "Analysis complete",
    geminiError: "Error",
    geminiMagicLabel: "Quick actions",
    geminiChapters: "Chapters",
    geminiSummary: "TL;DR Summary",
    geminiQuiz: "Quiz",
    geminiSentiment: "Sentiment",
    geminiCustomPlaceholder: "Ask your question...",
    geminiResponseLabel: "Gemini Response",
    geminiCopied: "Copied!",
    geminiDeleteConfirm: "Delete Gemini API key?"
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
