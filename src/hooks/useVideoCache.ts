// Video caching hook using IndexedDB with LRU eviction and expiration
// The cache handles all blob URL lifecycle internally - callers just get URLs

import { useState, useEffect, useCallback, useRef } from 'react';
import type { CacheMetadata } from '../types';
import { CACHE_KEYS, CACHE_CONFIG } from '../types';
import { getBlob, saveBlob, deleteBlob } from '../utils/indexeddb';

function loadCacheMeta(): CacheMetadata[] {
  try {
    const saved = localStorage.getItem(CACHE_KEYS.CACHE_META);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.warn('[VideoCache] Failed to load cache metadata:', e);
  }
  return [];
}

function saveCacheMeta(meta: CacheMetadata[]): void {
  try {
    localStorage.setItem(CACHE_KEYS.CACHE_META, JSON.stringify(meta));
  } catch (e) {
    console.warn('[VideoCache] Failed to save cache metadata:', e);
  }
}

export function useVideoCache() {
  const [cacheMeta, setCacheMeta] = useState<CacheMetadata[]>(() => loadCacheMeta());
  const [isReady, setIsReady] = useState(false);
  
  // Internal tracking of active blob URLs - auto-revoked when replaced or on unmount
  const activeUrls = useRef<Map<string, string>>(new Map());

  // Internal helper to revoke a URL if it exists
  const revokeUrl = (videoId: string): void => {
    const url = activeUrls.current.get(videoId);
    if (url) {
      URL.revokeObjectURL(url);
      activeUrls.current.delete(videoId);
    }
  };

  // Initialize and clean expired entries on mount
  useEffect(() => {
    const cleanExpired = async () => {
      const now = Date.now();
      const validMeta: CacheMetadata[] = [];
      const expiredIds: string[] = [];

      for (const meta of cacheMeta) {
        if (meta.expiresAt > now) {
          validMeta.push(meta);
        } else {
          expiredIds.push(meta.videoId);
        }
      }

      for (const id of expiredIds) {
        revokeUrl(id);
        await deleteBlob(id);
        console.log('[VideoCache] Deleted expired video:', id);
      }

      if (expiredIds.length > 0) {
        setCacheMeta(validMeta);
        saveCacheMeta(validMeta);
      }

      setIsReady(true);
    };

    cleanExpired();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Persist metadata on change
  useEffect(() => {
    if (isReady) {
      saveCacheMeta(cacheMeta);
    }
  }, [cacheMeta, isReady]);

  // Cleanup all URLs on unmount
  useEffect(() => {
    const urls = activeUrls.current;
    return () => {
      urls.forEach(url => URL.revokeObjectURL(url));
      urls.clear();
    };
  }, []);

  // Evict LRU entry if at capacity
  const evictLRU = useCallback(async (currentMeta: CacheMetadata[], excludeId?: string): Promise<CacheMetadata[]> => {
    if (currentMeta.length < CACHE_CONFIG.MAX_VIDEOS) return currentMeta;

    const sorted = [...currentMeta].sort((a, b) => a.lastAccessed - b.lastAccessed);
    const toEvict = sorted.find(m => m.videoId !== excludeId);
    
    if (toEvict) {
      revokeUrl(toEvict.videoId);
      await deleteBlob(toEvict.videoId);
      console.log('[VideoCache] Evicted LRU:', toEvict.videoId);
      return currentMeta.filter(m => m.videoId !== toEvict.videoId);
    }
    return currentMeta;
  }, []);

  const getCachedVideo = useCallback(async (videoId: string): Promise<string | null> => {
    // Return existing URL if we have one
    const existingUrl = activeUrls.current.get(videoId);
    if (existingUrl) return existingUrl;

    const meta = cacheMeta.find(m => m.videoId === videoId);
    if (!meta) return null;

    // Check expiration
    if (meta.expiresAt < Date.now()) {
      console.log('[VideoCache] Cache expired for:', videoId);
      await deleteBlob(videoId);
      setCacheMeta(prev => prev.filter(m => m.videoId !== videoId));
      return null;
    }

    const blob = await getBlob(videoId);
    if (!blob) {
      console.log('[VideoCache] Blob not found for:', videoId);
      setCacheMeta(prev => prev.filter(m => m.videoId !== videoId));
      return null;
    }

    // Update last accessed
    setCacheMeta(prev => prev.map(m => 
      m.videoId === videoId ? { ...m, lastAccessed: Date.now() } : m
    ));

    // Create URL and track it
    const url = URL.createObjectURL(blob);
    activeUrls.current.set(videoId, url);
    return url;
  }, [cacheMeta]);

  const cacheVideo = useCallback(async (videoId: string, videoUrl: string): Promise<string> => {
    // Check if already cached and valid
    const existingMeta = cacheMeta.find(m => m.videoId === videoId);
    if (existingMeta && existingMeta.expiresAt > Date.now()) {
      const cachedUrl = await getCachedVideo(videoId);
      if (cachedUrl) return cachedUrl;
    }

    // Evict if needed
    const currentMeta = await evictLRU(cacheMeta, videoId);

    console.log('[VideoCache] Fetching video:', videoUrl);
    try {
      const response = await fetch(videoUrl);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      const blob = await response.blob();
      await saveBlob(videoId, blob);

      const now = Date.now();
      const newMeta: CacheMetadata = {
        videoId,
        lastAccessed: now,
        expiresAt: now + CACHE_CONFIG.EXPIRY_MS,
        blobSize: blob.size,
      };

      setCacheMeta([...currentMeta.filter(m => m.videoId !== videoId), newMeta]);
      
      // Revoke old URL if exists, create new one
      revokeUrl(videoId);
      const url = URL.createObjectURL(blob);
      activeUrls.current.set(videoId, url);
      return url;
    } catch (error) {
      console.error('[VideoCache] Failed to cache video:', error);
      return videoUrl; // Fallback to original URL
    }
  }, [cacheMeta, getCachedVideo, evictLRU]);

  const cacheVideoBlob = useCallback(async (videoId: string, blob: Blob): Promise<string> => {
    // Evict if needed
    const currentMeta = await evictLRU(cacheMeta, videoId);

    await saveBlob(videoId, blob);

    const now = Date.now();
    const newMeta: CacheMetadata = {
      videoId,
      lastAccessed: now,
      expiresAt: now + CACHE_CONFIG.EXPIRY_MS,
      blobSize: blob.size,
    };

    setCacheMeta([...currentMeta.filter(m => m.videoId !== videoId), newMeta]);
    
    // Revoke old URL if exists, create new one
    revokeUrl(videoId);
    const url = URL.createObjectURL(blob);
    activeUrls.current.set(videoId, url);
    return url;
  }, [cacheMeta, evictLRU]);

  const evictVideo = useCallback(async (videoId: string): Promise<void> => {
    revokeUrl(videoId);
    await deleteBlob(videoId);
    setCacheMeta(prev => prev.filter(m => m.videoId !== videoId));
    console.log('[VideoCache] Manually evicted:', videoId);
  }, []);

  const getCacheStats = useCallback(() => {
    const totalSize = cacheMeta.reduce((sum, m) => sum + m.blobSize, 0);
    return {
      count: cacheMeta.length,
      maxCount: CACHE_CONFIG.MAX_VIDEOS,
      totalSizeMB: (totalSize / 1024 / 1024).toFixed(2),
      videos: cacheMeta.map(m => ({
        id: m.videoId,
        sizeMB: (m.blobSize / 1024 / 1024).toFixed(2),
        expiresIn: Math.round((m.expiresAt - Date.now()) / 1000 / 60 / 60) + ' hours',
      })),
    };
  }, [cacheMeta]);

  return {
    isReady,
    getCachedVideo,
    cacheVideo,
    cacheVideoBlob,
    evictVideo,
    getCacheStats,
    cacheMeta,
  };
}
