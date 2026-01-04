// Types for Video2Ascii Playground

export type VideoCategory = 'cinematic' | 'nature' | 'abstract' | 'person' | 'user';

export interface SampleVideo {
  id: string;
  title: string;
  thumbnailUrl: string;
  videoUrl: string;
  category: VideoCategory;
}

export interface UploadedVideo extends Omit<SampleVideo, 'category'> {
  category: 'user';
  uploadedAt: number;
}

export interface CacheMetadata {
  videoId: string;
  lastAccessed: number;
  expiresAt: number;
  blobSize: number;
}

export type CharsetKey = 
  | 'standard' 
  | 'detailed' 
  | 'blocks' 
  | 'minimal' 
  | 'binary' 
  | 'dots' 
  | 'arrows' 
  | 'emoji';

export interface AsciiSettings {
  // Video source
  videoSrc: string;
  isCustomVideo: boolean;
  
  // Visual
  numColumns: number;
  colored: boolean;
  brightness: number;
  blend: number;
  highlight: number;
  charset: CharsetKey;
  
  // Mouse effects
  enableMouse: boolean;
  trailLength: number;
  
  // Ripple effects
  enableRipple: boolean;
  rippleSpeed: number;
  
  // Audio
  audioEffect: number;
  audioRange: number;
  
  // Playback
  isPlaying: boolean;
  showStats: boolean;
}

export const DEFAULT_SETTINGS: AsciiSettings = {
  videoSrc: '',
  isCustomVideo: false,
  
  numColumns: 100,
  colored: true,
  brightness: 1.0,
  blend: 0,
  highlight: 0,
  charset: 'standard',
  
  enableMouse: true,
  trailLength: 24,
  
  enableRipple: false,
  rippleSpeed: 40,
  
  audioEffect: 0,
  audioRange: 50,
  
  isPlaying: true,
  showStats: false,
};

// LocalStorage keys
export const CACHE_KEYS = {
  SETTINGS: 'v2a_settings',
  LAST_VIDEO: 'v2a_last_video',
  CACHE_META: 'v2a_cache_meta',
  UPLOADED_VIDEOS: 'v2a_uploaded_videos',
  ACTIVE_TAB: 'v2a_active_tab',
} as const;

// Cache configuration
export const CACHE_CONFIG = {
  MAX_VIDEOS: 5,           // 4 sample + 1 user default
  EXPIRY_DAYS: 7,          // 7 day expiration
  EXPIRY_MS: 7 * 24 * 60 * 60 * 1000,
} as const;

