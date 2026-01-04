// Video caching hook using IndexedDB with LRU eviction and expiration

import { useState, useEffect, useCallback } from 'react';
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

      // Delete expired blobs
      for (const id of expiredIds) {
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

  const getCachedVideo = useCallback(async (videoId: string): Promise<string | null> => {
    const meta = cacheMeta.find(m => m.videoId === videoId);
    
    if (!meta) {
      console.log('[VideoCache] No cache entry for:', videoId);
      return null;
    }

    // Check expiration
    if (meta.expiresAt < Date.now()) {
      console.log('[VideoCache] Cache expired for:', videoId);
      await deleteBlob(videoId);
      setCacheMeta(prev => prev.filter(m => m.videoId !== videoId));
      return null;
    }

    // Get blob from IndexedDB
    const blob = await getBlob(videoId);
    if (!blob) {
      console.log('[VideoCache] Blob not found for:', videoId);
      setCacheMeta(prev => prev.filter(m => m.videoId !== videoId));
      return null;
    }

    // Update last accessed time
    setCacheMeta(prev => prev.map(m => 
      m.videoId === videoId 
        ? { ...m, lastAccessed: Date.now() }
        : m
    ));

    // Return blob URL
    return URL.createObjectURL(blob);
  }, [cacheMeta]);

  const cacheVideo = useCallback(async (videoId: string, videoUrl: string): Promise<string> => {
    // Check if already cached
    const existingMeta = cacheMeta.find(m => m.videoId === videoId);
    if (existingMeta && existingMeta.expiresAt > Date.now()) {
      const cachedUrl = await getCachedVideo(videoId);
      if (cachedUrl) return cachedUrl;
    }

    // Evict LRU if at capacity
    if (cacheMeta.length >= CACHE_CONFIG.MAX_VIDEOS) {
      const sorted = [...cacheMeta].sort((a, b) => a.lastAccessed - b.lastAccessed);
      const toEvict = sorted[0];
      if (toEvict) {
        await deleteBlob(toEvict.videoId);
        setCacheMeta(prev => prev.filter(m => m.videoId !== toEvict.videoId));
        console.log('[VideoCache] Evicted LRU:', toEvict.videoId);
      }
    }

    // Fetch and cache the video
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

      setCacheMeta(prev => [...prev.filter(m => m.videoId !== videoId), newMeta]);
      
      return URL.createObjectURL(blob);
    } catch (error) {
      console.error('[VideoCache] Failed to cache video:', error);
      // Return original URL on error
      return videoUrl;
    }
  }, [cacheMeta, getCachedVideo]);

  const cacheVideoBlob = useCallback(async (videoId: string, blob: Blob): Promise<string> => {
    // Evict LRU if at capacity
    if (cacheMeta.length >= CACHE_CONFIG.MAX_VIDEOS) {
      const sorted = [...cacheMeta].sort((a, b) => a.lastAccessed - b.lastAccessed);
      const toEvict = sorted[0];
      if (toEvict) {
        await deleteBlob(toEvict.videoId);
        setCacheMeta(prev => prev.filter(m => m.videoId !== toEvict.videoId));
        console.log('[VideoCache] Evicted LRU:', toEvict.videoId);
      }
    }

    await saveBlob(videoId, blob);

    const now = Date.now();
    const newMeta: CacheMetadata = {
      videoId,
      lastAccessed: now,
      expiresAt: now + CACHE_CONFIG.EXPIRY_MS,
      blobSize: blob.size,
    };

    setCacheMeta(prev => [...prev.filter(m => m.videoId !== videoId), newMeta]);
    
    return URL.createObjectURL(blob);
  }, [cacheMeta]);

  const evictVideo = useCallback(async (videoId: string): Promise<void> => {
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
