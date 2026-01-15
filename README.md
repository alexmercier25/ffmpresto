# ⚡ FFmpresto

**Compresse tes vidéos ultra rapidement, directement sur ton Mac.**

Parfait pour réduire la taille de vidéos avant de les envoyer à une IA (Gemini) ou sur des plateformes avec des limites de taille.

---

## 📥 Téléchargement

1. **Télécharge le repo** : Clique sur le bouton vert "Code" → **"Download ZIP"**
2. **Décompresse le fichier** : Double-clique sur `ffmpresto-main.zip` dans ton dossier Téléchargements
3. **Ouvre le dossier** : Tu devrais voir un dossier `ffmpresto-main` avec tous les fichiers

---

## 🚀 Installation (copier-coller une commande)

**Ouvre le Terminal** (cherche "Terminal" dans Spotlight avec `Cmd + Espace`)

Puis **copie-colle cette commande** et appuie sur Entrée :

```bash
cd ~/Downloads/ffmpresto-main && bash install.sh
```

**C'est tout !** Le script installe automatiquement :
- ✅ Xcode Command Line Tools
- ✅ Homebrew
- ✅ Node.js
- ✅ FFmpeg

> 💡 La première fois, ça peut prendre 5-10 minutes. Ensuite c'est instantané.

---

## ▶️ Utilisation (après installation)

Pour lancer FFmpresto les prochaines fois :

**Option 1 - Terminal :**
```bash
cd ~/Downloads/ffmpresto-main && node server.js
```

**Option 2 - Fichier :**

Double-clique sur `start.command` (si macOS bloque : clic droit → "Ouvrir")

L'app s'ouvre sur http://localhost:8888

---

## ✨ Presets

| Preset | Description | Idéal pour |
|--------|-------------|------------|
| ⚖️ **Équilibré** | Compression standard | Usage général |
| 🤖 **AI-Optimized** | 1 FPS, résolution réduite | Envoyer à Gemini |
| 🔧 **Custom** | Paramètres manuels | Besoins spécifiques |

### Preset AI-Optimized

- **1 FPS** : Les IA n'ont pas besoin de 30/60 fps
- **720p** : Résolution suffisante pour l'analyse
- **Audio** : Garde-le pour la transcription

📉 Une vidéo de **1 Go peut devenir 20-50 Mo** !

---

## 🔒 Confidentialité

- **100% local** : Aucune donnée n'est envoyée sur internet
- Tout reste sur ton Mac

---

## ❓ Problèmes ?

### Où est le Terminal ?

Appuie sur `Cmd + Espace`, tape "Terminal" et appuie sur Entrée

### La commande ne fonctionne pas

Vérifie que tu es bien dans le bon dossier :
```bash
cd ~/Downloads/ffmpresto-main
bash install.sh
```

### "ffmpresto-main" n'existe pas

Tu as peut-être renommé le dossier. Ajuste le chemin :
```bash
cd ~/Downloads/TON_DOSSIER
bash install.sh
```

### Le navigateur ne s'ouvre pas

Va manuellement sur http://localhost:8888

---

## 👤 Crédits

Créé par [Alexandre Mercier](https://www.linkedin.com/in/alexandre-mercier-3080ba197/)

Made with ⚡
