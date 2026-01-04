# Video Settings & Caching - Implementation Tasks

## Relevant Files

- `src/hooks/useVideoCache.ts` - NEW: IndexedDB caching logic, LRU eviction, expiration handling
- `src/hooks/useUploadedVideos.ts` - NEW: Manage uploaded video metadata, thumbnail generation
- `src/hooks/useSettings.ts` - MODIFY: Add settings change counter for component remounting
- `src/types/index.ts` - MODIFY: Add CacheMetadata, UploadedVideo interfaces
- `src/components/VideoSelector.tsx` - MODIFY: Add tabbed interface, integrate with uploaded videos
- `src/components/AsciiPlayer.tsx` - MODIFY: Accept key prop for remounting
- `src/App.tsx` - MODIFY: Wire up caching hooks, generate player key, handle tab state
- `src/utils/thumbnail.ts` - NEW: Video thumbnail extraction utility
- `src/utils/indexeddb.ts` - NEW: IndexedDB wrapper utilities

### Notes

- Use browser DevTools > Application > IndexedDB to verify cache, and verify with console
- Test with network throttling to verify cache hits

## Instructions for Completing Tasks

**IMPORTANT:** As you complete each task, you must check it off in this markdown file by changing `- [ ]` to `- [x]`. This helps track progress and ensures you don't skip any steps.

Example:

- `- [ ] 1.1 Read file` → `- [x] 1.1 Read file` (after completing)

Update the file after completing each sub-task, not just after completing an entire parent task.

## Tasks

- [x] 0.0 Create feature branch
  - [x] 0.1 Create and checkout a new branch: `git checkout -b feature/video-settings-caching`

- [x] 1.0 Interactive Video Settings (Component Remounting)
  - [x] 1.1 Add `settingsVersion` counter to `useSettings` hook that increments on any setting change
  - [x] 1.2 Create a `playerKey` in `App.tsx` derived from `videoSrc + settingsVersion`
  - [x] 1.3 Pass `playerKey` as the `key` prop to `AsciiPlayer` component
  - [x] 1.4 Test that changing any control restarts the video from the beginning

- [x] 2.0 IndexedDB Video Cache Infrastructure
  - [x] 2.1 Create `src/utils/indexeddb.ts` with helper functions: `openDB()`, `getBlob()`, `saveBlob()`, `deleteBlob()`, `getAllKeys()`
  - [x] 2.2 Define IndexedDB database name `video2ascii_cache` with object store `videos`
  - [x] 2.3 Add `CacheMetadata` interface to `src/types/index.ts` with fields: `videoId`, `lastAccessed`, `expiresAt`, `blobSize`
  - [x] 2.4 Create `src/hooks/useVideoCache.ts` with functions: `getCachedVideo()`, `cacheVideo()`, `evictLRU()`, `cleanExpired()`
  - [x] 2.5 Implement LRU eviction: when cache has 5 videos and adding new one, delete least recently accessed
  - [x] 2.6 Implement 7-day expiration check: skip expired videos, delete them on access
  - [x] 2.7 Store cache metadata array in LocalStorage key `v2a_cache_meta`

- [x] 3.0 Uploaded Video Management
  - [x] 3.1 Add `UploadedVideo` interface extending `SampleVideo` with `uploadedAt: number` to `src/types/index.ts`
  - [x] 3.2 Create `src/utils/thumbnail.ts` with `generateThumbnail(videoBlob)` function that extracts frame at `min(duration, 1s)`
  - [x] 3.3 Create `src/hooks/useUploadedVideos.ts` with state: `uploadedVideos`, and functions: `addVideo()`, `removeVideo()`, `getVideos()`
  - [x] 3.4 Generate video ID from sanitized filename + timestamp: `user_${filename}_${Date.now()}`
  - [x] 3.5 Store uploaded video blob in IndexedDB using `cacheVideo()` from useVideoCache
  - [x] 3.6 Store uploaded video metadata in LocalStorage key `v2a_uploaded_videos`
  - [x] 3.7 Load uploaded videos from LocalStorage on hook initialization

- [x] 4.0 Tabbed Video Selector UI
  - [x] 4.1 Add `activeTab` state to `VideoSelector` component: `'sample' | 'uploaded'`
  - [x] 4.2 Create tab buttons styled with glassmorphism (active: accent color, inactive: muted)
  - [x] 4.3 Add CSS styles for `.video-tabs`, `.video-tab`, `.video-tab.active` in `index.css`
  - [x] 4.4 Conditionally render sample videos grid or uploaded videos grid based on active tab
  - [x] 4.5 In "Uploaded" tab: show thumbnails of uploaded videos + upload button
  - [x] 4.6 If no uploaded videos, show placeholder text "No uploaded videos yet" with upload button
  - [x] 4.7 Persist active tab to LocalStorage key `v2a_active_tab`
  - [x] 4.8 Update `VideoSelector` props to accept `uploadedVideos` array and `onDeleteUploadedVideo` callback

- [x] 5.0 Integration & Testing
  - [x] 5.1 Wire up `useVideoCache` in `App.tsx` to intercept sample video loading
  - [x] 5.2 Wire up `useUploadedVideos` in `App.tsx` and pass to `VideoSelector`
  - [x] 5.3 Modify `handleUploadVideo` to use `addVideo()` from useUploadedVideos
  - [x] 5.4 Test: Change settings → video restarts immediately
  - [x] 5.5 Test: Load sample video → cached in IndexedDB (check DevTools)
  - [x] 5.6 Test: Refresh page → sample video loads from cache (no network)
  - [x] 5.7 Test: Upload video → appears in Uploaded tab with thumbnail
  - [x] 5.8 Test: Upload 6th video → oldest is evicted (LRU)
  - [x] 5.9 Console log cache operations for debugging
