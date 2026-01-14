# ⚡ FFmpresto

**Compresse tes vidéos ultra rapidement, directement sur ton Mac.**

Parfait pour réduire la taille de vidéos avant de les envoyer à une IA (ChatGPT, Claude, Gemini) ou sur des plateformes avec des limites de taille.

![FFmpresto](https://img.shields.io/badge/100%25-Local-22c55e?style=flat-square)
![macOS](https://img.shields.io/badge/macOS-Compatible-blue?style=flat-square)

---

## 🚀 Installation (5 minutes)

### Étape 1 : Installer Homebrew (si pas déjà fait)

Ouvre l'app **Terminal** (cherche "Terminal" dans Spotlight avec `Cmd + Espace`) et colle cette commande :

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

Suis les instructions à l'écran. Ça peut prendre quelques minutes.

### Étape 2 : Installer les dépendances

Toujours dans le Terminal, tape ces deux commandes :

```bash
brew install node
```

```bash
brew install ffmpeg
```

C'est tout ! ✅

---

## ▶️ Utilisation

### Option 1 : Double-clic (recommandé)

1. **Double-clique sur `start.command`**
2. L'app s'ouvre automatiquement dans ton navigateur
3. Glisse ta vidéo et compresse !

> 💡 Si macOS dit que le fichier n'est pas autorisé :
> - Clic droit sur `start.command` → "Ouvrir"
> - Ou va dans Préférences Système → Sécurité → "Ouvrir quand même"

### Option 2 : Terminal

```bash
cd ~/ffmpresto
node server.js
```

Puis ouvre http://localhost:8888

---

## ✨ Fonctionnalités

### Presets

| Preset | Description | Idéal pour |
|--------|-------------|------------|
| ⚖️ **Équilibré** | Compression standard | Usage général |
| 🤖 **AI-Optimized** | 1 FPS, résolution réduite | Envoyer à ChatGPT/Claude/Gemini |
| 🔧 **Custom** | Paramètres manuels | Besoins spécifiques |

### Options Custom

- **Qualité** : Légère / Équilibrée / Haute
- **FPS** : 1 à 30 (ou original)
- **Résolution** : 360p à 1080p (ou originale)
- **Audio** : Inclure ou non (utile si l'IA transcrit)

---

## 🤖 Preset AI-Optimized

Ce preset est conçu pour envoyer des vidéos aux IA :

- **1 FPS** : Les IA n'ont pas besoin de 30/60 fps pour comprendre le contexte
- **720p** : Résolution suffisante pour l'analyse
- **Audio optionnel** : Garde-le si l'IA peut transcrire (recommandé)

Résultat : Une vidéo de **1 Go peut devenir 20-50 Mo** !

---

## 📁 Structure

```
ffmpresto/
├── start.command   ← Double-clique ici pour lancer
├── server.js       ← Serveur (utilise FFmpeg natif)
├── index.html      ← Interface
├── style.css       ← Styles
├── app.js          ← Logique
└── README.md       ← Ce fichier
```

---

## ❓ FAQ

### "FFmpeg n'est pas installé"

```bash
brew install ffmpeg
```

### "Node.js n'est pas installé"

```bash
brew install node
```

### "brew: command not found"

Installe Homebrew d'abord (voir Étape 1).

### "Le fichier start.command ne s'ouvre pas"

Clic droit → "Ouvrir" (au lieu de double-clic).

### La compression est lente

- Vérifie que tu utilises bien le serveur natif (pas ffmpeg.wasm)
- Les très grosses vidéos (>2 Go) prennent naturellement plus de temps
- Le preset AI-Optimized est plus rapide car il réduit beaucoup la vidéo

---

## 🔒 Confidentialité

- **100% local** : Aucune donnée n'est envoyée sur internet
- Les fichiers temporaires sont dans `/tmp/ffmpresto/` et supprimés après usage

---

## 🛠️ Pour les devs

Le serveur expose ces endpoints :

- `POST /api/compress` - Upload et compression (streaming)
- `GET /api/progress/:id` - Status de la compression
- `GET /api/download/:id` - Télécharger le résultat

---

Made with ⚡ pour compresser des vidéos sans prise de tête
