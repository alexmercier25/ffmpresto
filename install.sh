#!/bin/bash

# FFmpresto - Script d'installation et de démarrage
# Utilisation: bash install.sh

cd "$(dirname "$0")"

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
BOLD='\033[1m'
NC='\033[0m'

clear
echo ""
echo -e "${YELLOW}⚡ FFmpresto - Compression Vidéo${NC}"
echo "=================================="
echo ""

# 1. Vérifier/Installer Command Line Tools
echo -e "${BLUE}[1/4]${NC} Xcode Command Line Tools..."
if ! xcode-select -p &> /dev/null; then
    echo -e "      Installation en cours (une fenêtre va s'ouvrir)..."
    xcode-select --install 2>/dev/null
    
    echo -e "      ${YELLOW}→ Clique 'Installer' dans la fenêtre popup${NC}"
    echo -e "      En attente de l'installation..."
    
    while ! xcode-select -p &> /dev/null; do
        sleep 3
    done
    echo -e "      ${GREEN}✓${NC} Command Line Tools installés"
else
    echo -e "      ${GREEN}✓${NC} Déjà installé"
fi

# 2. Vérifier/Installer Homebrew
echo -e "${BLUE}[2/4]${NC} Homebrew..."
if ! command -v brew &> /dev/null; then
    echo -e "      Installation en cours..."
    NONINTERACTIVE=1 /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
    
    # Ajouter Homebrew au PATH
    if [[ -f /opt/homebrew/bin/brew ]]; then
        eval "$(/opt/homebrew/bin/brew shellenv)"
    elif [[ -f /usr/local/bin/brew ]]; then
        eval "$(/usr/local/bin/brew shellenv)"
    fi
    
    if command -v brew &> /dev/null; then
        echo -e "      ${GREEN}✓${NC} Homebrew installé"
    else
        echo -e "      ${RED}✗${NC} Erreur d'installation Homebrew"
        exit 1
    fi
else
    echo -e "      ${GREEN}✓${NC} Déjà installé"
fi

# S'assurer que brew est dans le PATH
if [[ -f /opt/homebrew/bin/brew ]]; then
    eval "$(/opt/homebrew/bin/brew shellenv)"
elif [[ -f /usr/local/bin/brew ]]; then
    eval "$(/usr/local/bin/brew shellenv)"
fi

# 3. Vérifier/Installer Node.js
echo -e "${BLUE}[3/4]${NC} Node.js..."
if ! command -v node &> /dev/null; then
    echo -e "      Installation en cours..."
    brew install node 2>/dev/null
    
    if command -v node &> /dev/null; then
        echo -e "      ${GREEN}✓${NC} Node.js installé ($(node -v))"
    else
        echo -e "      ${RED}✗${NC} Erreur d'installation Node.js"
        exit 1
    fi
else
    echo -e "      ${GREEN}✓${NC} Déjà installé ($(node -v))"
fi

# 4. Vérifier/Installer FFmpeg
echo -e "${BLUE}[4/4]${NC} FFmpeg..."
if ! command -v ffmpeg &> /dev/null; then
    echo -e "      Installation en cours (peut prendre quelques minutes)..."
    brew install ffmpeg 2>/dev/null
    
    if command -v ffmpeg &> /dev/null; then
        echo -e "      ${GREEN}✓${NC} FFmpeg installé"
    else
        echo -e "      ${RED}✗${NC} Erreur d'installation FFmpeg"
        exit 1
    fi
else
    echo -e "      ${GREEN}✓${NC} Déjà installé"
fi

echo ""
echo -e "${GREEN}════════════════════════════════════${NC}"
echo -e "${GREEN}   Tout est prêt ! 🎉${NC}"
echo -e "${GREEN}════════════════════════════════════${NC}"
echo ""
echo "Démarrage de FFmpresto..."
echo "Ouvre ton navigateur sur: http://localhost:8888"
echo ""
echo -e "${YELLOW}Appuie sur Ctrl+C pour arrêter le serveur${NC}"
echo ""

# Ouvrir le navigateur après un délai
(sleep 2 && open "http://localhost:8888") &

# Démarrer le serveur
node server.js
