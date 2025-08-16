# Build Instructions for RegExtractor

This document explains how to build and distribute the RegExtractor browser extension.

## Quick Start

### Prerequisites
- Node.js (for running build scripts)
- `zip` command-line utility (usually pre-installed on macOS/Linux)

### Building the Extension

1. **Simple build** (creates Firefox and Chrome versions):
   ```bash
   npm run build
   ```

2. **Install for development** (if you haven't already):
   ```bash
   npm run install-deps
   ```

## Build Output

After running the build, you'll find:

```
dist/
├── regextractor-firefox-v1.0.0.zip    # Firefox ZIP (for AMO submission)
├── regextractor-firefox-v1.0.0.xpi    # Firefox XPI (for direct install)
├── regextractor-chrome-v1.0.0.zip     # Chrome extension package
├── manifest.json                       # Firefox-compatible files
├── background.js
├── content.js
├── popup.html
├── popup.css
├── popup.js
├── icons/
└── ...

build/
├── firefox/                           # Firefox build directory
│   ├── manifest.json (v2)
│   └── ... (all extension files)
└── chrome/                            # Chrome build directory
    ├── manifest.json (v3)
    └── ... (all extension files)
```

## Available Scripts

- `npm run build` - Build both Firefox and Chrome versions
- `npm run build:simple` - Simple build (Firefox-compatible)
- `npm run clean` - Clean all build artifacts
- `npm run dev:firefox` - Run Firefox extension in development mode
- `npm run dev:chrome` - Instructions for Chrome development
- `npm run lint` - Lint the extension code
- `npm run package` - Create web-ext compatible package

## Installation Instructions

### Firefox

Firefox has specific requirements for extension installation. The build process creates multiple formats:

1. **Development/Testing (Temporary installation):**
   ```bash
   ./install-firefox.sh  # Interactive installation script
   ```
   
   Or manually:
   - Open Firefox
   - Navigate to `about:debugging`
   - Click "This Firefox"
   - Click "Load Temporary Add-on"
   - Select `manifest.json` from the `dist/` folder

2. **Production Installation (Permanent):**
   - Use the `.xpi` file: `regextractor-firefox-v1.0.0.xpi`
   - Drag and drop the `.xpi` file into Firefox
   - Or go to `about:addons` → gear icon → "Install Add-on From File"

**⚠️ Important:** If you get a "corrupted" error with the ZIP file, use the XPI file or the development method above. Firefox requires properly signed extensions for permanent installation from ZIP files.

### Chrome

1. **Developer mode installation:**
   - Open Chrome
   - Navigate to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top right)
   - Click "Load unpacked"
   - Select the `build/chrome/` folder

2. **From ZIP file:**
   - Use the `regextractor-chrome-v1.0.0.zip` file
   - Submit to Chrome Web Store for permanent installation

## Manifest Versions

The extension supports both browser types with appropriate manifest versions:

- **Firefox**: Uses Manifest V2 (`manifest.json`)
  - `browser_action` for popup
  - `background.scripts` with `persistent: false`

- **Chrome**: Uses Manifest V3 (`manifest-v3.json`)
  - `action` for popup
  - `background.service_worker`

## File Structure

### Source Files (included in build):
- `background.js` - Background script
- `content.js` - Content script for web page interaction
- `popup.html` - Extension popup interface
- `popup.css` - Popup styling
- `popup.js` - Popup functionality
- `icons/` - Extension icons (16px, 32px, 48px, 128px)
- `LICENSE` - License file
- `README.md` - Documentation

### Build Files (excluded from git):
- `dist/` - Distribution files
- `build/` - Platform-specific builds
- `*.zip` - Packaged extensions
- `node_modules/` - Dependencies
- `web-ext-artifacts/` - Web-ext generated files

## Development Workflow

1. Make changes to source files
2. Run `npm run build` to create new packages
3. Test in both Firefox and Chrome:
   - Firefox: `npm run dev:firefox`
   - Chrome: Load `build/chrome/` folder manually
4. Use `npm run lint` to check for issues
5. The `.gitignore` file ensures build artifacts aren't committed

## Distribution

The build process creates ready-to-distribute packages:
- Submit `regextractor-firefox-v1.0.0.zip` to Firefox Add-ons (AMO)
- Submit `regextractor-chrome-v1.0.0.zip` to Chrome Web Store
- Both packages are automatically versioned based on `package.json`
