#!/bin/bash

# Firefox Extension Test Installation Script
echo "🔧 RegExtractor Firefox Installation Test"
echo "========================================"
echo ""

# Check if Firefox is installed
if command -v firefox >/dev/null 2>&1; then
    echo "✅ Firefox found"
else
    echo "❌ Firefox not found. Please install Firefox first."
    exit 1
fi

# Check if extension files exist
if [ -f "dist/regextractor-firefox-v1.0.0.xpi" ]; then
    echo "✅ Firefox XPI file found"
    XPI_FILE="dist/regextractor-firefox-v1.0.0.xpi"
elif [ -f "dist/regextractor-firefox-v1.0.0.zip" ]; then
    echo "⚠️  Only ZIP file found (XPI preferred for Firefox)"
    XPI_FILE="dist/regextractor-firefox-v1.0.0.zip"
else
    echo "❌ No Firefox extension files found. Run 'npm run build' first."
    exit 1
fi

echo ""
echo "📋 Installation Options:"
echo ""
echo "1. 🔧 DEVELOPMENT INSTALL (Temporary):"
echo "   - Open Firefox"
echo "   - Go to: about:debugging"
echo "   - Click 'This Firefox'"
echo "   - Click 'Load Temporary Add-on'"
echo "   - Select: $(pwd)/dist/manifest.json"
echo ""
echo "2. 📦 PERMANENT INSTALL (Recommended):"
echo "   - Open Firefox"
echo "   - Drag and drop this file into Firefox:"
echo "   - $(pwd)/${XPI_FILE}"
echo "   - OR go to about:addons → Install from file"
echo ""
echo "3. 🚀 QUICK INSTALL (Automatic):"
read -p "   Would you like to open Firefox and the extension file? (y/N): " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🚀 Opening Firefox..."
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        open -a Firefox
        sleep 2
        open "$XPI_FILE"
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux
        firefox &
        sleep 2
        firefox "$XPI_FILE"
    else
        echo "⚠️  Auto-open not supported on this OS. Please install manually."
    fi
else
    echo "👍 Manual installation selected."
fi

echo ""
echo "🔍 After installation, you should see the RegExtractor icon in Firefox toolbar."
echo "📝 If you see 'corrupted' error, use the development install method instead."
