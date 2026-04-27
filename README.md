# ✨ Gemini UI Enhancer

A Chrome/Chromium browser extension that fixes CSS rendering issues and enhances the Google Gemini UI with premium themes, wider layouts, better code blocks, and more.

![Version](https://img.shields.io/badge/version-1.0.0-6366f1)
![Chrome](https://img.shields.io/badge/Chrome-MV3-4285F4)
![Brave](https://img.shields.io/badge/Brave-Compatible-FB542B)

## 🚀 Features

### CSS Fixes
- **Sidebar stability** — Prevents unexpected sidebar collapses and rendering failures
- **Layout responsiveness** — Fixes CSS issues at various viewport sizes
- **Content width optimization** — Wider chat area for better readability
- **Input area consistency** — Ensures the prompt area renders correctly

### Premium Themes
- 🌑 **Default** — Gemini's native look with fixes applied
- 🌃 **Midnight** — Deep dark theme with electric blue accents
- 🧛 **Dracula** — Classic developer-friendly dark palette
- 🏔️ **Nord** — Calm, cool-toned arctic-inspired theme

### UI Enhancements
- **JetBrains Mono** for code blocks — premium monospace font
- **Inter** for UI text — modern, readable sans-serif
- **Custom scrollbar** — Sleek, theme-matched scrollbar styling
- **Smooth animations** — Subtle transitions for messages and interactions
- **Wide mode** — Expand chat to use more screen space
- **Sidebar lock** — Keep sidebar always visible
- **Font size control** — Adjustable text size slider (80% – 130%)

## 📦 Installation

### From Source (Developer Mode)

1. Clone or download this repository
2. Generate icons (if not already present):
   ```bash
   python3 generate_icons.py
   ```
3. Open your browser's extension management page:
   - **Chrome**: `chrome://extensions`
   - **Brave**: `brave://extensions`
   - **Edge**: `edge://extensions`
4. Enable **Developer mode** (toggle in top-right)
5. Click **Load unpacked**
6. Select the `gemini-ui-enhancer` folder
7. Navigate to [gemini.google.com](https://gemini.google.com) and enjoy!

## 🎛️ Usage

1. Click the extension icon in your browser toolbar
2. Use the **master toggle** to enable/disable the extension
3. Select a **theme** from the theme grid
4. Toggle **Wide Mode**, **Sidebar Lock**, or **Premium Fonts**
5. Adjust the **Font Size** slider to your preference
6. All settings are saved automatically and sync across devices

## 🗂️ Project Structure

```
gemini-ui-enhancer/
├── manifest.json          # Extension manifest (MV3)
├── popup/
│   ├── popup.html         # Extension popup UI
│   ├── popup.css          # Popup styling
│   └── popup.js           # Settings logic
├── content/
│   ├── content.js         # Content script
│   └── themes/
│       ├── fixes.css      # Core CSS fixes (always applied)
│       ├── midnight.css   # Midnight theme
│       ├── dracula.css    # Dracula theme
│       └── nord.css       # Nord theme
├── icons/
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
├── generate_icons.py      # Icon generator script
└── README.md
```

## 🛠️ Technical Details

- **Manifest V3** — Uses the latest Chrome extension standard
- **Chrome Storage Sync API** — Settings persist and sync across devices
- **MutationObserver** — Re-applies enhancements when Gemini's SPA re-renders
- **CSS Custom Properties** — Theme variables for easy customization
- **No external dependencies** — Pure vanilla JS/CSS

## 📄 License

MIT License — Free to use, modify, and distribute.

---

Made with ♥ for Gemini users
