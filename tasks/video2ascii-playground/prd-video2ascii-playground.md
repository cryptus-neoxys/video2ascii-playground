# Video2Ascii Interactive Playground

## Introduction/Overview

An interactive web playground for the [video2ascii](https://github.com/elijah0528/video2ascii/) library — a WebGL-powered React component that converts video to ASCII art in real-time.

**Problem**: Developers want to experiment with video2ascii settings before implementing it in their projects, but there's no easy way to test all the parameters interactively.

**Solution**: A sandbox web app where users can select sample videos or upload their own, then dynamically adjust all controls (brightness, charset, effects, etc.) to see the ASCII conversion in real-time.

---

## Goals

1. **Experimentation Sandbox**: Allow users to test all video2ascii settings before implementing in their own projects
2. **Quick Demo**: Provide curated sample videos that showcase the library's best features
3. **Real-time Control**: Enable dynamic adjustment of all props with immediate visual feedback
4. **Time-boxed Delivery**: Complete v1 within ~2 hours

---

## User Stories

1. **As a developer**, I want to select a sample video and see it converted to ASCII art instantly, so I can evaluate if this library fits my needs.

2. **As a developer**, I want to adjust controls (brightness, charset, colors) and see changes in real-time, so I can find the perfect configuration for my use case.

3. **As a developer**, I want to upload my own video file, so I can test how my specific content looks as ASCII art.

4. **As a developer**, I want to experiment with interactive effects (mouse glow, ripple, audio reactivity), so I can understand how these features work before implementing them.

5. **As a developer**, I want to copy the configuration code once I find settings I like, so I can easily implement it in my project.

---

## Functional Requirements

### Video Selection (FR1)

1. **FR1.1**: The app must display 3-5 curated sample videos as thumbnail/buttons for quick selection
2. **FR1.2**: Sample videos should cover different content types (e.g., cinematic, nature, person talking, abstract patterns)
3. **FR1.3**: The app must allow users to upload their own video file (mp4, webm)
4. **FR1.4**: Uploaded videos must work immediately without server-side processing (client-side only)

### Interactive Controls (FR2)

The app must expose ALL video2ascii props as interactive controls:

| Control                  | Type              | Range/Options                                                    |
| ------------------------ | ----------------- | ---------------------------------------------------------------- |
| **FR2.1** `numColumns`   | Slider            | 40-200                                                           |
| **FR2.2** `colored`      | Toggle            | true/false                                                       |
| **FR2.3** `brightness`   | Slider            | 0-2 (step 0.1)                                                   |
| **FR2.4** `blend`        | Slider            | 0-100                                                            |
| **FR2.5** `highlight`    | Slider            | 0-100                                                            |
| **FR2.6** `charset`      | Dropdown          | standard, detailed, blocks, minimal, binary, dots, arrows, emoji |
| **FR2.7** `enableMouse`  | Toggle            | true/false                                                       |
| **FR2.8** `trailLength`  | Slider            | 0-50                                                             |
| **FR2.9** `enableRipple` | Toggle            | true/false                                                       |
| **FR2.10** `rippleSpeed` | Slider            | 10-100                                                           |
| **FR2.11** `audioEffect` | Slider            | 0-100                                                            |
| **FR2.12** `audioRange`  | Slider            | 0-100                                                            |
| **FR2.13** `isPlaying`   | Play/Pause Button | true/false                                                       |
| **FR2.14** `showStats`   | Toggle            | Show FPS                                                         |

### UI Layout (FR3)

1. **FR3.1**: Main display area showing the ASCII video conversion (takes ~70% of viewport)
2. **FR3.2**: Control panel as a collapsible sidebar or bottom panel (~30%)
3. **FR3.3**: Controls grouped logically: Video Selection, Visual Settings, Interactive Effects, Audio Settings
4. **FR3.4**: Each control should display its current value
5. **FR3.5**: "Reset to Defaults" button to restore all settings

### Code Export (FR4)

1. **FR4.1**: Display generated React code snippet based on current settings
2. **FR4.2**: "Copy Code" button to copy the configuration to clipboard
3. **FR4.3**: Code should only include non-default props (clean output)

---

## Non-Goals (Out of Scope for V1)

- ❌ User accounts or saving configurations
- ❌ Paste video URL support (future scope)
- ❌ Server-side video processing
- ❌ Video recording/export of ASCII output
- ❌ Mobile-optimized layout (desktop-first)
- ❌ Preset configurations library

---

## Design Considerations

### Visual Design

- **Dark theme** (ASCII art looks best on dark backgrounds)
- **Glassmorphism** control panel with subtle transparency
- **Smooth animations** for control interactions
- **Monaco-style code block** for the code export section

### UI Inspiration

- Interactive demo/playground pattern similar to:
  - [Framer Motion Playground](https://www.framer.com/motion/)
  - [React Spring Visualizer](https://react-spring.io/)

### Control Panel Layout

```
┌────────────────────────────────────────────────────────────────────────┐
│  ┌─────────────────────────────────────────────┐ ┌──────────────────┐  │
│  │                                             │ │ VIDEO SELECTION  │  │
│  │                                             │ │ [🎬] [🌿] [👤]    │  │
│  │           ASCII VIDEO DISPLAY               │ │ [Upload Video]   │  │
│  │                                             │ ├──────────────────┤  │
│  │                                             │ │ VISUAL SETTINGS  │  │
│  │                                             │ │ Columns: ════    │  │
│  │                                             │ │ Brightness: ════ │  │
│  │                                             │ │ Charset: [▼]     │  │
│  │                                             │ │ Colored: [✓]     │  │
│  │                                             │ ├──────────────────┤  │
│  │                                             │ │ EFFECTS          │  │
│  │                                             │ │ Mouse Glow: [✓]  │  │
│  │                                             │ │ Ripple: [ ]      │  │
│  │                                             │ ├──────────────────┤  │
│  │                                             │ │ </> CODE EXPORT  │  │
│  └─────────────────────────────────────────────┘ └──────────────────┘  │
└────────────────────────────────────────────────────────────────────────┘
```

---

## Technical Considerations

### Tech Stack

- **React + Vite** (TypeScript, pnpm)
- **video2ascii** npm package
- **Vanilla CSS** with CSS variables for theming
- **No additional UI libraries** (keep bundle small, fast build)

### Sample Videos

**Strategy**: Store only video metadata (URL, thumbnail URL, title) — no static video assets in the repo. Videos are loaded directly from external sources (Pexels/Pixabay CDN) in the browser.

Source royalty-free videos from:
- [Pexels Videos](https://www.pexels.com/videos/) — provides direct video URLs
- [Pixabay Videos](https://pixabay.com/videos/) — provides direct video URLs

**Video Metadata Schema**:
```typescript
interface SampleVideo {
  id: string;
  title: string;
  thumbnailUrl: string;  // Small image for preview
  videoUrl: string;      // Direct CDN link to video
  category: 'cinematic' | 'nature' | 'abstract' | 'person';
}
```

Suggested samples (3-4 videos):
1. **Cinematic/City** - urban night scene with lights
2. **Nature** - waterfall or forest movement  
3. **Abstract** - geometric patterns or liquid motion
4. **Person** - face/portrait for testing detail

### Performance & Caching

**Client-Side Caching Strategy**:
- Use **LocalStorage** to cache video metadata and user preferences
- Cache video blob data using **IndexedDB** for larger storage capacity
- Store last-used video selection and control settings for session persistence
- Implement cache expiration (e.g., 7 days) to ensure fresh content

**Caching Implementation**:
```typescript
// LocalStorage keys
const CACHE_KEYS = {
  LAST_VIDEO: 'v2a_last_video',
  CONTROL_SETTINGS: 'v2a_settings',
  VIDEO_CACHE_META: 'v2a_cache_meta'
};

// IndexedDB for video blobs (future optimization)
const VIDEO_CACHE_DB = 'video2ascii_cache';
```

**Other Performance Optimizations**:
- Lazy-load non-selected sample video thumbnails
- Debounce slider inputs (~50ms) to prevent excessive re-renders
- Show loading skeleton while video loads from external source

---

## Success Metrics

1. ✅ User can see ASCII conversion within 3 seconds of page load (accounting for external video fetch)
2. ✅ All controls update the ASCII output in real-time (<100ms latency)
3. ✅ User can upload a custom video and see it converted
4. ✅ Generated code can be copy-pasted into a React project and works
5. ✅ Returning users see cached video/settings instantly
