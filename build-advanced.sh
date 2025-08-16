#!/bin/bash

# Advanced build script for RegExtractor Extension
# Supports both Firefox (manifest v2) and Chrome (manifest v3)
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔧 Building RegExtractor Extension...${NC}"

# Clean previous builds
echo -e "${YELLOW}🧹 Cleaning previous builds...${NC}"
rm -rf dist
rm -rf build
rm -f *.zip
rm -f *.crx

# Create build directories
echo -e "${YELLOW}📁 Creating build directories...${NC}"
mkdir -p build/firefox
mkdir -p build/chrome
mkdir -p dist

# Get version from package.json
VERSION=$(node -p "JSON.parse(require('fs').readFileSync('package.json', 'utf8')).version")
echo -e "${BLUE}📝 Version: ${VERSION}${NC}"

# Common files to copy
COMMON_FILES=("background.js" "content.js" "popup.html" "popup.css" "popup.js" "LICENSE" "README.md")

# Function to copy common files
copy_common_files() {
    local target_dir=$1
    echo -e "${YELLOW}📋 Copying common files to ${target_dir}...${NC}"
    
    for file in "${COMMON_FILES[@]}"; do
        cp "$file" "$target_dir/"
    done
    
    # Copy icons directory
    cp -r icons "$target_dir/"
}

# Build Firefox version (Manifest v2)
echo -e "${GREEN}🦊 Building Firefox version (Manifest v2)...${NC}"
copy_common_files "build/firefox"
cp manifest.json build/firefox/

# Build Chrome version (Manifest v3)
echo -e "${GREEN}🟡 Building Chrome version (Manifest v3)...${NC}"
copy_common_files "build/chrome"
cp manifest-v3.json build/chrome/manifest.json

# Create zip files
echo -e "${YELLOW}📦 Creating distribution packages...${NC}"

# Firefox package (ZIP for manual installation)
cd build/firefox
zip -r "../../dist/regextractor-firefox-v${VERSION}.zip" .
cd ../..

# Chrome package
cd build/chrome
zip -r "../../dist/regextractor-chrome-v${VERSION}.zip" .
cd ../..

# Create a universal package (Firefox compatible)
cp -r build/firefox/* dist/

# Create proper Firefox XPI using web-ext (for Firefox Add-ons)
echo -e "${YELLOW}📦 Creating Firefox XPI package...${NC}"
if command -v npx >/dev/null 2>&1; then
    npx web-ext build --source-dir=build/firefox --artifacts-dir=dist --overwrite-dest
    # Rename the XPI to include version number
    if [ -f "dist/regextractor-${VERSION}.zip" ]; then
        mv "dist/regextractor-${VERSION}.zip" "dist/regextractor-firefox-v${VERSION}.xpi"
    elif [ -f "dist/regextractor-1.0.zip" ]; then
        mv "dist/regextractor-1.0.zip" "dist/regextractor-firefox-v${VERSION}.xpi"
    fi
else
    echo -e "${RED}⚠️  web-ext not found. Install with: npm install web-ext --save-dev${NC}"
fi

echo -e "${GREEN}✅ Build complete!${NC}"
echo -e "${BLUE}📦 Distribution files created:${NC}"
echo -e "   - ${YELLOW}dist/${NC} (directory with Firefox-compatible files)"
echo -e "   - ${YELLOW}dist/regextractor-firefox-v${VERSION}.zip${NC} (Firefox manual install)"
echo -e "   - ${YELLOW}dist/regextractor-firefox-v${VERSION}.xpi${NC} (Firefox proper package)"
echo -e "   - ${YELLOW}dist/regextractor-chrome-v${VERSION}.zip${NC} (Chrome extension)"
echo ""
echo -e "${BLUE}🚀 Installation instructions:${NC}"
echo -e "${GREEN}Firefox:${NC}"
echo "   ${BLUE}Method 1 (Temporary - Development):${NC}"
echo "   1. Open Firefox and go to about:debugging"
echo "   2. Click 'This Firefox' → 'Load Temporary Add-on'"
echo "   3. Select the manifest.json from dist/ folder"
echo ""
echo "   ${BLUE}Method 2 (Permanent - Use XPI file):${NC}"
echo "   1. Open Firefox"
echo "   2. Drag and drop the .xpi file onto Firefox"
echo "   3. Or go to about:addons and install from file"
echo ""
echo -e "${GREEN}Chrome:${NC}"
echo "   1. Open Chrome and go to chrome://extensions/"
echo "   2. Enable 'Developer mode'"
echo "   3. Click 'Load unpacked' and select the 'build/chrome' folder"
echo "   4. OR drag and drop the chrome .zip file"
