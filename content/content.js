/**
 * Gemini UI Enhancer — Content Script
 * v1.2 — Fixed: Extension context invalidated errors
 *       All chrome.* calls wrapped in try-catch for graceful handling
 */

(function () {
  'use strict';

  const THEME_FILES = {
    midnight: 'content/themes/midnight.css',
    dracula: 'content/themes/dracula.css',
    nord: 'content/themes/nord.css',
  };

  const DEFAULT_SETTINGS = {
    enabled: true,
    theme: 'default',
    wideMode: false,
    sidebarLock: false,
    fontSize: 100,
    enhancedFonts: true,
    smoothAnimations: true,
  };

  const cssCache = {};
  let currentThemeKey = null;
  let extensionValid = true;

  // ---- Check if extension context is still valid ----
  function isContextValid() {
    try {
      chrome.runtime.getURL('');
      return true;
    } catch (e) {
      extensionValid = false;
      return false;
    }
  }

  // ---- Safe chrome.storage.sync.get wrapper ----
  function safeStorageGet(defaults, callback) {
    if (!isContextValid()) return;
    try {
      chrome.storage.sync.get(defaults, callback);
    } catch (e) {
      extensionValid = false;
      console.log('GUE: Extension context invalidated, please refresh the page.');
    }
  }

  // ---- Fetch and inject theme CSS as inline <style> ----
  async function injectThemeCSS(themeKey) {
    removeThemeCSS();
    currentThemeKey = themeKey;

    if (themeKey === 'default' || !THEME_FILES[themeKey]) return;
    if (!isContextValid()) return;

    try {
      let cssText;
      if (cssCache[themeKey]) {
        cssText = cssCache[themeKey];
      } else {
        const url = chrome.runtime.getURL(THEME_FILES[themeKey]);
        const response = await fetch(url);
        cssText = await response.text();
        cssCache[themeKey] = cssText;
      }

      const style = document.createElement('style');
      style.id = 'gue-theme-stylesheet';
      style.setAttribute('data-gue-theme', themeKey);
      style.textContent = cssText;
      document.head.appendChild(style);
    } catch (err) {
      if (err.message && err.message.includes('Extension context invalidated')) {
        extensionValid = false;
      } else {
        console.error('GUE: Failed to load theme CSS:', err);
      }
    }
  }

  function removeThemeCSS() {
    const existing = document.querySelectorAll('#gue-theme-stylesheet, [data-gue-theme]');
    existing.forEach((el) => el.remove());
    currentThemeKey = null;
  }

  // ---- Apply all settings to the DOM ----
  function applySettings(settings) {
    const body = document.body;
    if (!body) return;

    // Master toggle — OFF
    if (!settings.enabled) {
      body.classList.remove('gue-enhanced', 'gue-wide-mode', 'gue-sidebar-locked');
      const classes = [...body.classList].filter((c) => c.startsWith('gue-theme-'));
      classes.forEach((c) => body.classList.remove(c));
      removeThemeCSS();
      body.style.removeProperty('--gue-font-scale');
      return;
    }

    body.classList.add('gue-enhanced');

    // Theme
    const oldThemeClasses = [...body.classList].filter((c) => c.startsWith('gue-theme-'));
    oldThemeClasses.forEach((c) => body.classList.remove(c));

    if (settings.theme && settings.theme !== 'default') {
      body.classList.add(`gue-theme-${settings.theme}`);
      if (currentThemeKey !== settings.theme) {
        injectThemeCSS(settings.theme);
      }
    } else {
      removeThemeCSS();
    }

    // Wide mode
    body.classList.toggle('gue-wide-mode', !!settings.wideMode);

    // Sidebar lock
    body.classList.toggle('gue-sidebar-locked', !!settings.sidebarLock);

    // Font size
    const scale = (settings.fontSize || 100) / 100;
    body.style.setProperty('--gue-font-scale', scale);

    // Enhanced fonts toggle
    if (!settings.enhancedFonts) {
      body.classList.remove('gue-enhanced');
    }
  }

  // ---- Load settings and apply ----
  function init() {
    safeStorageGet(DEFAULT_SETTINGS, (settings) => {
      applySettings(settings);
    });
  }

  // ---- Listen for setting changes via storage ----
  try {
    chrome.storage.onChanged.addListener((changes, area) => {
      if (area !== 'sync' || !extensionValid) return;
      safeStorageGet(DEFAULT_SETTINGS, (settings) => {
        applySettings(settings);
      });
    });
  } catch (e) {
    extensionValid = false;
  }

  // ---- Listen for direct messages from popup ----
  try {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (!extensionValid) return;
      if (message.type === 'GUE_APPLY_SETTINGS') {
        applySettings(message.settings);
        sendResponse({ success: true });
      }
      return true;
    });
  } catch (e) {
    extensionValid = false;
  }

  // ---- MutationObserver: re-apply if Gemini SPA re-renders ----
  const observer = new MutationObserver((mutations) => {
    if (!extensionValid) return;
    for (const mutation of mutations) {
      if (mutation.type === 'childList' && mutation.target === document.body) {
        safeStorageGet(DEFAULT_SETTINGS, (settings) => {
          if (settings.enabled && !document.body.classList.contains('gue-enhanced')) {
            applySettings(settings);
          }
        });
        break;
      }
    }
  });

  // Initialize
  if (document.body) {
    init();
    observer.observe(document.body, { childList: true, subtree: false });
  } else {
    document.addEventListener('DOMContentLoaded', () => {
      init();
      observer.observe(document.body, { childList: true, subtree: false });
    });
  }

  // SPA navigation detection
  let lastUrl = location.href;
  new MutationObserver(() => {
    if (!extensionValid) return;
    if (location.href !== lastUrl) {
      lastUrl = location.href;
      setTimeout(init, 500);
    }
  }).observe(document, { subtree: true, childList: true });

  console.log('%c✨ Gemini UI Enhancer v1.2 loaded', 'color: #60a5fa; font-weight: bold; font-size: 14px;');
})();
