#!/bin/bash

# Build script for RegExtractor Chrome Extension
set -e

echo "🔧 Building RegExtractor Extension..."

# Clean previous build
echo "🧹 Cleaning previous build..."
rm -rf dist
rm -f *.zip
rm -f *.crx

# Create distribution directory
echo "📁 Creating distribution directory..."
mkdir -p dist

# Copy necessary files
echo "📋 Copying files..."
cp manifest.json dist/
cp background.js dist/
cp content.js dist/
cp popup.html dist/
cp popup.css dist/
cp popup.js dist/
cp LICENSE dist/
cp README.md dist/

# Copy icons directory
cp -r icons dist/

# Get version from manifest.json
VERSION=$(node -p "JSON.parse(require('fs').readFileSync('manifest.json', 'utf8')).version")

# Create zip file
echo "📦 Creating zip file..."
cd dist
zip -r "../regextractor-v${VERSION}.zip" .
cd ..

echo "✅ Build complete!"
echo "📦 Distribution files created:"
echo "   - dist/ (directory with all files)"
echo "   - regextractor-v${VERSION}.zip (packaged extension)"
echo ""
echo "🚀 To install the extension:"
echo "   1. Open Chrome and go to chrome://extensions/"
echo "   2. Enable 'Developer mode'"
echo "   3. Click 'Load unpacked' and select the 'dist' folder"
echo "   OR"
echo "   4. Drag and drop the .zip file onto the extensions page"
