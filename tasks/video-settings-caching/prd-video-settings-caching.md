# Interactive Video Settings & Caching

## Introduction/Overview

This feature enhances the Video2Ascii Playground with two major improvements:

1. **Interactive Video Settings** — Currently, changing settings or uploading a new video causes the video to freeze. This update will make settings changes seamlessly restart the video with the new configuration.

2. **Video Caching & Management** — Implement client-side video caching using IndexedDB to avoid re-downloading videos, and properly manage uploaded videos alongside sample videos with a tabbed interface.

**Problem**: Users experience a frozen video when adjusting settings, and must re-download sample videos on every page load. Uploaded videos disappear from the selector and cannot be reused.

**Solution**: Use React key-based remounting for settings changes, implement IndexedDB caching with LRU eviction, and create a unified video management system with tabs for sample vs. uploaded videos.

---

## Goals

1. **Seamless Settings Updates**: Any settings change restarts the video from the beginning with new configuration applied
2. **Persistent Video Cache**: Cache up to 5 videos (~100MB) with 7-day LRU expiration to avoid re-downloads
3. **Unified Video Management**: Uploaded videos stored with same metadata structure as sample videos
4. **Tabbed Video Selector**: Switch between "Sample Videos" and "Uploaded Videos" tabs

---

## User Stories

1. **As a developer**, I want to adjust settings (columns, brightness, charset) and have the video restart immediately with those changes applied, so I can see the effect without refreshing the page.

2. **As a developer**, I want sample videos to load instantly on subsequent visits, so I don't wait for downloads.

3. **As a developer**, I want my uploaded videos to appear in a dedicated "Uploaded Videos" tab, so I can easily switch between them and sample videos.

4. **As a developer**, I want uploaded videos to persist across sessions (until cache expires), so I can continue experimenting with them later.

5. **As a developer**, I want to see a thumbnail of my uploaded video generated automatically, so the video selector looks consistent.

---

## Functional Requirements

### FR1: Interactive Video Settings

| ID    | Requirement                                                                                                                                                                                                                                                |
| ----- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| FR1.1 | When any ASCII setting changes (numColumns, brightness, colored, charset, blend, highlight, enableMouse, trailLength, enableRipple, rippleSpeed, audioEffect, audioRange), the Video2Ascii component must remount and restart playback from the beginning. |
| FR1.2 | When a new video is selected or uploaded, the component must remount and start playing the new video.                                                                                                                                                      |
| FR1.3 | The remount must be triggered by changing the React `key` prop on the AsciiPlayer component.                                                                                                                                                               |
| FR1.4 | A unique key should be generated from the video source + a settings hash or timestamp.                                                                                                                                                                     |

### FR2: Video Caching System

| ID    | Requirement                                                                                  |
| ----- | -------------------------------------------------------------------------------------------- |
| FR2.1 | Create a video cache using IndexedDB to store video blob data.                               |
| FR2.2 | Cache up to 5 videos maximum (4 sample + 1 user by default capacity).                        |
| FR2.3 | Implement LRU (Least Recently Used) eviction when cache is full.                             |
| FR2.4 | Each cached video has a 7-day expiration; expired videos are deleted on next access.         |
| FR2.5 | Store cache metadata in LocalStorage: `{ videoId, lastAccessed, expiresAt, blobSize }`.      |
| FR2.6 | When loading a sample video, check cache first; if hit and not expired, use cached blob URL. |
| FR2.7 | When uploading a video, store the blob in IndexedDB immediately.                             |

### FR3: Uploaded Video Management

| ID    | Requirement                                                                                                                |
| ----- | -------------------------------------------------------------------------------------------------------------------------- |
| FR3.1 | Uploaded videos must have the same metadata structure as sample videos: `{ id, title, category, thumbnailUrl, videoUrl }`. |
| FR3.2 | Generate `id` from sanitized filename + timestamp (e.g., `user_myvideo_1704412800000`).                                    |
| FR3.3 | Set `title` from the original filename (without extension).                                                                |
| FR3.4 | Set `category` to `'user'` for all uploaded videos.                                                                        |
| FR3.5 | Generate `thumbnailUrl` by extracting a video frame at `min(videoDuration, 1 second)` using canvas.                        |
| FR3.6 | Store `videoUrl` as a blob URL reference to the IndexedDB cached blob (format: `indexeddb://video-cache/{videoId}`).       |
| FR3.7 | Store uploaded video metadata list in LocalStorage under key `v2a_uploaded_videos`.                                        |

### FR4: Tabbed Video Selector UI

| ID    | Requirement                                                                                         |
| ----- | --------------------------------------------------------------------------------------------------- |
| FR4.1 | Replace the current video selector section header with two tabs: "Sample" and "Uploaded".           |
| FR4.2 | Default to "Sample" tab on first load.                                                              |
| FR4.3 | Persist the last selected tab in LocalStorage.                                                      |
| FR4.4 | "Sample" tab shows the 4 curated sample video thumbnails.                                           |
| FR4.5 | "Uploaded" tab shows uploaded video thumbnails + the upload button.                                 |
| FR4.6 | If no uploaded videos exist, show only the upload button with helper text "No uploaded videos yet". |
| FR4.7 | Style tabs to match the existing glassmorphism design.                                              |

---

## Non-Goals (Out of Scope)

- ❌ Cloud storage or server-side video processing
- ❌ Video transcoding or format conversion
- ❌ Editing or cropping uploaded videos
- ❌ Sharing videos between users
- ❌ Video seeking/scrubbing controls
- ❌ Configurable cache size (fixed at 5 videos)

---

## Design Considerations

### Tabbed Selector Mockup

```
┌──────────────────────────────────────┐
│  ┌─────────┐ ┌──────────┐            │
│  │ Sample  │ │ Uploaded │            │  ← Tabs
│  └─────────┘ └──────────┘            │
├──────────────────────────────────────┤
│ ┌────────┐ ┌────────┐ ┌────────┐     │
│ │ 🎬     │ │ 🌊     │ │ 🏔️     │     │  ← Video Thumbnails
│ │ City   │ │ Water  │ │ Glacier│     │
│ └────────┘ └────────┘ └────────┘     │
│ ┌────────┐                           │
│ │ 🌲     │                           │
│ │ Forest │                           │
│ └────────┘                           │
└──────────────────────────────────────┘
```

### Tab Styling

- Active tab: solid background with `--accent-primary`, white text
- Inactive tab: transparent background, `--text-muted` text
- Tab container: full width, no gap between tabs

---

## Technical Considerations

### Video Cache Architecture

```typescript
// IndexedDB Structure
Database: 'video2ascii_cache'
Object Store: 'videos'
  - key: videoId (string)
  - value: { blob: Blob, metadata: CacheMetadata }

// LocalStorage Keys
'v2a_cache_meta' → CacheMetadata[]
'v2a_uploaded_videos' → UploadedVideo[]
'v2a_active_tab' → 'sample' | 'uploaded'

interface CacheMetadata {
  videoId: string;
  lastAccessed: number;  // timestamp
  expiresAt: number;     // timestamp (7 days from creation)
  blobSize: number;      // bytes
}

interface UploadedVideo extends SampleVideo {
  category: 'user';
  uploadedAt: number;
}
```

### Thumbnail Generation

```typescript
async function generateThumbnail(videoBlob: Blob): Promise<string> {
  const video = document.createElement('video');
  video.src = URL.createObjectURL(videoBlob);
  video.currentTime = Math.min(video.duration || 1, 1); // min(duration, 1s)
  await video.play(); video.pause();
  
  const canvas = document.createElement('canvas');
  canvas.width = 200; canvas.height = 112; // 16:9 thumbnail
  canvas.getContext('2d').drawImage(video, 0, 0, 200, 112);
  
  return canvas.toDataURL('image/jpeg', 0.7);
}
```

### Component Key for Remount

```typescript
// In App.tsx or AsciiPlayer parent
const playerKey = useMemo(() => {
  return `${settings.videoSrc}_${Date.now()}`;
}, [settings.videoSrc, settingsChangeCounter]);

<AsciiPlayer key={playerKey} settings={settings} />
```

---

## Success Metrics

1. ✅ Changing any setting restarts the video within 100ms
2. ✅ Second visit to a sample video loads from cache (no network request)
3. ✅ Uploaded videos persist after page refresh
4. ✅ Thumbnail visible for uploaded videos within 2 seconds of upload
5. ✅ Cache respects 5-video limit with LRU eviction
6. ✅ Expired videos (>7 days) are not used

---

## Open Questions

*None — all questions resolved in clarification phase.*
