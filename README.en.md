# ⚡ FFmpresto

**Compress your videos ultra fast, directly on your Mac.**

Perfect for reducing video size before sending to an AI (Gemini) or platforms with size limits.

> 🇫🇷 [Version française](README.md) | The interface automatically detects your browser language

---

## 📥 Download

1. **Download the repo**: Click the green "Code" button → **"Download ZIP"**
2. **Unzip the file**: Double-click `ffmpresto-main.zip` in your Downloads folder
3. **Open the folder**: You should see a `ffmpresto-main` folder with all files

---

## 🚀 Installation (copy-paste one command)

**Open Terminal** (search "Terminal" in Spotlight with `Cmd + Space`)

Then **copy-paste this command** and press Enter:

```bash
cd ~/Downloads/ffmpresto-main && bash install.sh
```

**That's it!** The script automatically installs:
- ✅ Xcode Command Line Tools
- ✅ Homebrew
- ✅ Node.js
- ✅ FFmpeg

> 💡 First time takes 5-10 minutes. After that, it's instant.

---

## ▶️ Usage (after installation)

To launch FFmpresto next time:

**Option 1 - Terminal:**
```bash
cd ~/Downloads/ffmpresto-main && node server.js
```

**Option 2 - File:**

Double-click `start.command` (if macOS blocks it: right-click → "Open")

The app opens at http://localhost:8888

---

## ✨ Presets

| Preset | Description | Ideal for |
|--------|-------------|-----------|
| ⚖️ **Balanced** | Standard compression | General use |
| 🤖 **AI-Optimized** | 24 FPS, 720p, optimized | Sending to Gemini |
| 🔧 **Custom** | Manual settings | Specific needs |

### AI-Optimized Preset

- **24 FPS**: Smooth motion for analysis
- **720p**: Sufficient resolution for analysis
- **Audio**: Keep it for transcription

📉 A **1 GB video can become 20-50 MB**!

---

## 🔒 Privacy

- **100% local**: No data sent to the internet
- Everything stays on your Mac

---

## ❓ Issues?

### Where is Terminal?

Press `Cmd + Space`, type "Terminal" and press Enter

### Command doesn't work

Make sure you're in the right folder:
```bash
cd ~/Downloads/ffmpresto-main
bash install.sh
```

### "ffmpresto-main" doesn't exist

You may have renamed the folder. Adjust the path:
```bash
cd ~/Downloads/YOUR_FOLDER
bash install.sh
```

### Browser doesn't open

Go manually to http://localhost:8888

---

## 👤 Credits

Created by [Alexandre Mercier](https://www.linkedin.com/in/alexandre-mercier-3080ba197/)

Made with ⚡
