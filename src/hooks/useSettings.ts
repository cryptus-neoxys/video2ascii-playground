import { useState, useEffect, useCallback } from 'react';
import type { AsciiSettings } from '../types';
import { DEFAULT_SETTINGS, CACHE_KEYS } from '../types';

function loadFromStorage(): Partial<AsciiSettings> {
  try {
    const saved = localStorage.getItem(CACHE_KEYS.SETTINGS);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.warn('Failed to load settings from localStorage:', e);
  }
  return {};
}

function saveToStorage(settings: AsciiSettings): void {
  try {
    localStorage.setItem(CACHE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (e) {
    console.warn('Failed to save settings to localStorage:', e);
  }
}

// Keys that should trigger a video restart when changed
const RESTART_KEYS: (keyof AsciiSettings)[] = [
  'numColumns', 'colored', 'brightness', 'blend', 'highlight', 'charset',
  'enableMouse', 'trailLength', 'enableRipple', 'rippleSpeed',
  'audioEffect', 'audioRange', 'showStats', 'videoSrc'
];

export function useSettings(initialVideoSrc: string) {
  const [settings, setSettings] = useState<AsciiSettings>(() => {
    const saved = loadFromStorage();
    return {
      ...DEFAULT_SETTINGS,
      ...saved,
      videoSrc: saved.videoSrc || initialVideoSrc,
    };
  });

  // Version counter that increments on settings changes to trigger component remount
  const [settingsVersion, setSettingsVersion] = useState(0);

  // Persist to localStorage on change (debounced)
  useEffect(() => {
    const timeout = setTimeout(() => {
      saveToStorage(settings);
    }, 300);
    return () => clearTimeout(timeout);
  }, [settings]);

  const updateSetting = useCallback(<K extends keyof AsciiSettings>(
    key: K,
    value: AsciiSettings[K]
  ) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    // Increment version if this setting should trigger restart
    if (RESTART_KEYS.includes(key)) {
      setSettingsVersion(v => v + 1);
    }
  }, []);

  const updateMultiple = useCallback((updates: Partial<AsciiSettings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
    // Check if any update key should trigger restart
    const shouldRestart = Object.keys(updates).some(k => 
      RESTART_KEYS.includes(k as keyof AsciiSettings)
    );
    if (shouldRestart) {
      setSettingsVersion(v => v + 1);
    }
  }, []);

  const resetToDefaults = useCallback(() => {
    setSettings(prev => ({ ...DEFAULT_SETTINGS, videoSrc: prev.videoSrc }));
    setSettingsVersion(v => v + 1);
  }, []);

  const setVideoSrc = useCallback((src: string, isCustom: boolean = false) => {
    setSettings(prev => ({
      ...prev,
      videoSrc: src,
      isCustomVideo: isCustom,
      isPlaying: true,
    }));
    setSettingsVersion(v => v + 1);
  }, []);

  return {
    settings,
    settingsVersion,
    updateSetting,
    updateMultiple,
    resetToDefaults,
    setVideoSrc,
  };
}
