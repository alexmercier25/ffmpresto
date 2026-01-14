#!/bin/bash

# FFmpresto - Script de démarrage
# Double-clique sur ce fichier pour lancer l'application

cd "$(dirname "$0")"

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo ""
echo -e "${YELLOW}⚡ FFmpresto - Compression Vidéo${NC}"
echo "=================================="
echo ""

# Vérifier Node.js
check_node() {
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node -v)
        echo -e "${GREEN}✓${NC} Node.js installé ($NODE_VERSION)"
        return 0
    else
        echo -e "${RED}✗${NC} Node.js non trouvé"
        return 1
    fi
}

# Vérifier FFmpeg
check_ffmpeg() {
    if command -v ffmpeg &> /dev/null; then
        FFMPEG_VERSION=$(ffmpeg -version 2>&1 | head -1 | cut -d' ' -f3)
        echo -e "${GREEN}✓${NC} FFmpeg installé (v$FFMPEG_VERSION)"
        return 0
    else
        echo -e "${RED}✗${NC} FFmpeg non trouvé"
        return 1
    fi
}

# Vérifier Homebrew (pour les installations)
check_homebrew() {
    if command -v brew &> /dev/null; then
        return 0
    else
        return 1
    fi
}

echo "Vérification des dépendances..."
echo ""

NODE_OK=false
FFMPEG_OK=false

if check_node; then
    NODE_OK=true
fi

if check_ffmpeg; then
    FFMPEG_OK=true
fi

echo ""

# Si tout est OK, démarrer
if $NODE_OK && $FFMPEG_OK; then
    echo -e "${GREEN}Toutes les dépendances sont installées !${NC}"
    echo ""
    echo "Démarrage du serveur..."
    echo ""
    
    # Ouvrir le navigateur après un délai
    (sleep 2 && open "http://localhost:8888") &
    
    # Démarrer le serveur
    node server.js
    
else
    echo -e "${YELLOW}═══════════════════════════════════════${NC}"
    echo -e "${YELLOW}   Installation requise${NC}"
    echo -e "${YELLOW}═══════════════════════════════════════${NC}"
    echo ""
    
    if ! check_homebrew; then
        echo -e "${BLUE}Étape 0: Installer Homebrew${NC}"
        echo "Copie et colle cette commande dans le Terminal:"
        echo ""
        echo -e "${YELLOW}/bin/bash -c \"\$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)\"${NC}"
        echo ""
        echo "Puis relance ce script."
        echo ""
    else
        if ! $NODE_OK; then
            echo -e "${BLUE}→ Installer Node.js:${NC}"
            echo -e "  ${YELLOW}brew install node${NC}"
            echo ""
        fi
        
        if ! $FFMPEG_OK; then
            echo -e "${BLUE}→ Installer FFmpeg:${NC}"
            echo -e "  ${YELLOW}brew install ffmpeg${NC}"
            echo ""
        fi
        
        echo "Une fois installé, relance ce script (double-clique)."
    fi
    
    echo ""
    echo -e "Appuie sur Entrée pour fermer..."
    read
fi
