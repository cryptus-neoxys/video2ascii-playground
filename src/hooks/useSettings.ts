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

export function useSettings(initialVideoSrc: string) {
  const [settings, setSettings] = useState<AsciiSettings>(() => {
    const saved = loadFromStorage();
    return {
      ...DEFAULT_SETTINGS,
      ...saved,
      videoSrc: saved.videoSrc || initialVideoSrc,
    };
  });

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
  }, []);

  const updateMultiple = useCallback((updates: Partial<AsciiSettings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
  }, []);

  const resetToDefaults = useCallback(() => {
    setSettings({ ...DEFAULT_SETTINGS, videoSrc: settings.videoSrc });
  }, [settings.videoSrc]);

  const setVideoSrc = useCallback((src: string, isCustom: boolean = false) => {
    setSettings(prev => ({
      ...prev,
      videoSrc: src,
      isCustomVideo: isCustom,
      isPlaying: true,
    }));
  }, []);

  return {
    settings,
    updateSetting,
    updateMultiple,
    resetToDefaults,
    setVideoSrc,
  };
}
