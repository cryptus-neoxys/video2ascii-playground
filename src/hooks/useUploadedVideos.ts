// Hook for managing uploaded video metadata

import { useState, useEffect, useCallback } from 'react';
import type { UploadedVideo } from '../types';
import { CACHE_KEYS } from '../types';
import { generateThumbnail, generateVideoId } from '../utils/thumbnail';
import { useVideoCache } from './useVideoCache';

function loadUploadedVideos(): UploadedVideo[] {
  try {
    const saved = localStorage.getItem(CACHE_KEYS.UPLOADED_VIDEOS);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.warn('[UploadedVideos] Failed to load from localStorage:', e);
  }
  return [];
}

function saveUploadedVideos(videos: UploadedVideo[]): void {
  try {
    localStorage.setItem(CACHE_KEYS.UPLOADED_VIDEOS, JSON.stringify(videos));
  } catch (e) {
    console.warn('[UploadedVideos] Failed to save to localStorage:', e);
  }
}

export function useUploadedVideos() {
  const [uploadedVideos, setUploadedVideos] = useState<UploadedVideo[]>(() => loadUploadedVideos());
  const [isProcessing, setIsProcessing] = useState(false);
  const { cacheVideoBlob, evictVideo, getCachedVideo } = useVideoCache();

  // Persist to localStorage on change
  useEffect(() => {
    saveUploadedVideos(uploadedVideos);
  }, [uploadedVideos]);

  const addVideo = useCallback(async (file: File): Promise<UploadedVideo | null> => {
    setIsProcessing(true);
    
    try {
      // Generate ID from filename
      const videoId = generateVideoId(file.name);
      
      // Generate title from filename (without extension)
      const title = file.name.replace(/\.[^/.]+$/, '');
      
      // Read file as blob
      const blob = new Blob([await file.arrayBuffer()], { type: file.type });
      
      // Generate thumbnail
      let thumbnailUrl: string;
      try {
        thumbnailUrl = await generateThumbnail(blob);
      } catch (e) {
        console.warn('[UploadedVideos] Failed to generate thumbnail, using placeholder:', e);
        // Use a simple placeholder if thumbnail generation fails
        thumbnailUrl = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjExMiIgdmlld0JveD0iMCAwIDIwMCAxMTIiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIxMTIiIGZpbGw9IiMxYTFhMjUiLz48dGV4dCB4PSIxMDAiIHk9IjU2IiBmaWxsPSIjNjA2MDcwIiBmb250LXNpemU9IjI0IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIj7wn46sPC90ZXh0Pjwvc3ZnPg==';
      }
      
      // Cache the video blob in IndexedDB
      const videoUrl = await cacheVideoBlob(videoId, blob);
      
      const newVideo: UploadedVideo = {
        id: videoId,
        title,
        thumbnailUrl,
        videoUrl,
        category: 'user',
        uploadedAt: Date.now(),
      };
      
      setUploadedVideos(prev => [...prev, newVideo]);
      console.log('[UploadedVideos] Added video:', newVideo.title);
      
      setIsProcessing(false);
      return newVideo;
    } catch (error) {
      console.error('[UploadedVideos] Failed to add video:', error);
      setIsProcessing(false);
      return null;
    }
  }, [cacheVideoBlob]);

  const removeVideo = useCallback(async (videoId: string): Promise<void> => {
    // Remove from IndexedDB cache
    await evictVideo(videoId);
    
    // Remove from state
    setUploadedVideos(prev => prev.filter(v => v.id !== videoId));
    console.log('[UploadedVideos] Removed video:', videoId);
  }, [evictVideo]);

  const getVideoUrl = useCallback(async (videoId: string): Promise<string | null> => {
    // Try to get from cache
    const video = uploadedVideos.find(v => v.id === videoId);
    if (!video) return null;
    
    const cachedUrl = await getCachedVideo(videoId);
    if (cachedUrl) return cachedUrl;
    
    // Video not in cache anymore, remove from list
    setUploadedVideos(prev => prev.filter(v => v.id !== videoId));
    return null;
  }, [uploadedVideos, getCachedVideo]);

  return {
    uploadedVideos,
    isProcessing,
    addVideo,
    removeVideo,
    getVideoUrl,
  };
}
