/**
 * Gemini UI Enhancer — Popup Script
 * Handles settings UI, persistence, and direct messaging to content script
 *
 * v1.1 — Fixed: sends direct message to content script for instant theme switching
 */

(function () {
  'use strict';

  const DEFAULT_SETTINGS = {
    enabled: true,
    theme: 'default',
    wideMode: false,
    sidebarLock: false,
    fontSize: 100,
    enhancedFonts: true,
    smoothAnimations: true,
  };

  // DOM elements
  const els = {
    masterToggle: document.getElementById('masterToggle'),
    statusBar: document.getElementById('statusBar'),
    themeButtons: document.querySelectorAll('.theme-btn'),
    wideMode: document.getElementById('wideMode'),
    sidebarLock: document.getElementById('sidebarLock'),
    enhancedFonts: document.getElementById('enhancedFonts'),
    fontSize: document.getElementById('fontSize'),
    fontSizeValue: document.getElementById('fontSizeValue'),
    resetBtn: document.getElementById('resetBtn'),
    container: document.querySelector('.popup-container'),
  };

  // Current settings (kept in sync)
  let currentSettings = { ...DEFAULT_SETTINGS };

  // Save a setting and notify content script immediately
  function saveSetting(key, value) {
    currentSettings[key] = value;
    // Save to storage
    chrome.storage.sync.set({ [key]: value }, () => {
      // ALSO send direct message to the active Gemini tab for instant update
      notifyContentScript();
    });
  }

  // Send settings directly to the content script on the active Gemini tab
  function notifyContentScript() {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0] && tabs[0].url && tabs[0].url.includes('gemini.google.com')) {
        chrome.tabs.sendMessage(
          tabs[0].id,
          { type: 'GUE_APPLY_SETTINGS', settings: currentSettings },
          (response) => {
            if (chrome.runtime.lastError) {
              // Content script might not be injected yet — that's okay, storage listener will catch it
              console.log('GUE popup: content script not reachable, relying on storage listener');
            }
          }
        );
      }
    });
  }

  // Update UI from settings
  function updateUI(settings) {
    currentSettings = { ...settings };

    // Master toggle
    els.masterToggle.checked = settings.enabled;
    els.container.classList.toggle('disabled', !settings.enabled);

    // Status bar
    const statusDot = els.statusBar.querySelector('.status-dot');
    const statusText = els.statusBar.querySelector('.status-text');
    if (settings.enabled) {
      statusDot.classList.add('active');
      els.statusBar.classList.remove('disabled');
      statusText.textContent = 'Active on Gemini';
    } else {
      statusDot.classList.remove('active');
      els.statusBar.classList.add('disabled');
      statusText.textContent = 'Disabled';
    }

    // Theme buttons
    els.themeButtons.forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.theme === settings.theme);
    });

    // Toggles
    els.wideMode.checked = settings.wideMode;
    els.sidebarLock.checked = settings.sidebarLock;
    els.enhancedFonts.checked = settings.enhancedFonts;

    // Font size
    els.fontSize.value = settings.fontSize;
    els.fontSizeValue.textContent = `${settings.fontSize}%`;
  }

  // Load settings
  function loadSettings() {
    chrome.storage.sync.get(DEFAULT_SETTINGS, (settings) => {
      updateUI(settings);
    });
  }

  // Event Listeners

  // Master toggle
  els.masterToggle.addEventListener('change', (e) => {
    saveSetting('enabled', e.target.checked);
    els.container.classList.toggle('disabled', !e.target.checked);

    const statusDot = els.statusBar.querySelector('.status-dot');
    const statusText = els.statusBar.querySelector('.status-text');
    if (e.target.checked) {
      statusDot.classList.add('active');
      els.statusBar.classList.remove('disabled');
      statusText.textContent = 'Active on Gemini';
    } else {
      statusDot.classList.remove('active');
      els.statusBar.classList.add('disabled');
      statusText.textContent = 'Disabled';
    }
  });

  // Theme buttons — instant switching
  els.themeButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      els.themeButtons.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      saveSetting('theme', btn.dataset.theme);
    });
  });

  // Wide mode
  els.wideMode.addEventListener('change', (e) => {
    saveSetting('wideMode', e.target.checked);
  });

  // Sidebar lock
  els.sidebarLock.addEventListener('change', (e) => {
    saveSetting('sidebarLock', e.target.checked);
  });

  // Enhanced fonts
  els.enhancedFonts.addEventListener('change', (e) => {
    saveSetting('enhancedFonts', e.target.checked);
  });

  // Font size slider
  els.fontSize.addEventListener('input', (e) => {
    const value = parseInt(e.target.value, 10);
    els.fontSizeValue.textContent = `${value}%`;
    saveSetting('fontSize', value);
  });

  // Reset button
  els.resetBtn.addEventListener('click', () => {
    currentSettings = { ...DEFAULT_SETTINGS };
    chrome.storage.sync.set(DEFAULT_SETTINGS, () => {
      updateUI(DEFAULT_SETTINGS);
      notifyContentScript();
      // Brief visual feedback
      els.resetBtn.style.color = '#10b981';
      els.resetBtn.querySelector('svg').style.stroke = '#10b981';
      setTimeout(() => {
        els.resetBtn.style.color = '';
        els.resetBtn.querySelector('svg').style.stroke = '';
      }, 1000);
    });
  });

  // Initialize
  loadSettings();
})();
