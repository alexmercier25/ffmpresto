# ⚡ FFmpresto

Compresse tes vidéos en un éclair, directement dans ton navigateur.

![FFmpresto](https://img.shields.io/badge/100%25-Local-22c55e?style=flat-square)
![No API](https://img.shields.io/badge/Pas%20d'API-f59e0b?style=flat-square)
![FFmpeg](https://img.shields.io/badge/FFmpeg-WASM-8b5cf6?style=flat-square)

## 🚀 Utilisation

### Option 1: Ouvrir directement (le plus simple)

Double-clique sur `index.html` pour l'ouvrir dans ton navigateur.

> ⚠️ Certains navigateurs bloquent les scripts locaux. Si ça ne fonctionne pas, utilise l'option 2.

### Option 2: Serveur local (recommandé)

```bash
# Avec Python
python3 -m http.server 8888

# Ou avec Node.js
npx serve
```

Puis ouvre http://localhost:8888

## ✨ Fonctionnalités

- **100% local** - Aucune donnée n'est envoyée sur internet
- **Drag & Drop** - Glisse ta vidéo directement dans l'interface
- **3 niveaux de qualité** - Légère, Équilibrée, Haute
- **Taille max optionnelle** - Spécifie une taille cible en Mo
- **Aperçu des résultats** - Vois la réduction de taille avant de télécharger

## 🎛️ Paramètres de compression

| Qualité | CRF | Description |
|---------|-----|-------------|
| 🪶 Légère | 28 | Fichier plus petit, légère perte de qualité |
| ⚖️ Équilibrée | 23 | Bon compromis (recommandé) |
| 💎 Haute | 18 | Meilleure qualité, fichier plus gros |

## 🔧 Comment ça marche

FFmpresto utilise [ffmpeg.wasm](https://ffmpegwasm.netlify.app/), une version WebAssembly de FFmpeg. Tout le traitement se fait dans ton navigateur :

1. Tu sélectionnes une vidéo
2. FFmpeg.wasm est chargé (seulement la première fois)
3. La vidéo est compressée en H.264/AAC
4. Tu télécharges le résultat

## 📝 Notes

- La première compression peut être plus lente (chargement de FFmpeg ~30Mo)
- Les compressions suivantes sont plus rapides
- Fonctionne mieux sur Chrome/Edge (meilleur support WebAssembly)
- Les très grosses vidéos (>2Go) peuvent causer des problèmes de mémoire

## 📁 Structure

```
ffmpresto/
├── index.html    # Page principale
├── style.css     # Styles
├── app.js        # Logique de compression
└── README.md     # Ce fichier
```

---

Made with ⚡ par un dev qui en avait marre de ses logiciels de montage
