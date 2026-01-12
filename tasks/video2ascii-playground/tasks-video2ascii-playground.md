# Video2Ascii Playground - Implementation Tasks

## Relevant Files

- `src/App.tsx` - Main application component with layout and state management
- `src/components/AsciiPlayer.tsx` - Wrapper component for video2ascii with dynamic props
- `src/components/ControlPanel.tsx` - Sidebar with all interactive controls
- `src/components/VideoSelector.tsx` - Sample video thumbnails and upload button
- `src/components/CodeExport.tsx` - Generated code snippet display with copy button
- `src/hooks/useSettings.ts` - State management for all control values with LocalStorage persistence
- `src/hooks/useVideoCache.ts` - Video caching logic using LocalStorage/IndexedDB (NOT CREATED - deferred)
- `src/data/sampleVideos.ts` - Sample video metadata (URLs, thumbnails, titles)
- `src/styles/index.css` - Global styles, CSS variables, dark theme (located at src/index.css)
- `src/styles/controls.css` - Control panel styling (merged into src/index.css)
- `src/types/index.ts` - TypeScript interfaces for settings and video metadata

### Notes

- This is a new project, so all files will be created from scratch
- Use `pnpm` for package management
- No unit tests required for v1 (time-boxed to ~2 hours)
- Manual browser testing is the primary verification method

## Instructions for Completing Tasks

**IMPORTANT:** As you complete each task, you must check it off in this markdown file by changing `- [ ]` to `- [x]`. This helps track progress and ensures you don't skip any steps.

Example:

- `- [ ] 1.1 Read file` → `- [x] 1.1 Read file` (after completing)

Update the file after completing each sub-task, not just after completing an entire parent task.

## Tasks

- [x] 0.0 Project Setup
  - [x] 0.1 Initialize Vite + React + TypeScript project using `pnpm create vite@latest ./ --template react-ts`
  - [x] 0.2 Install video2ascii package: `pnpm add video2ascii`
  - [x] 0.3 Create folder structure: `src/components`, `src/hooks`, `src/data`, `src/styles`, `src/types`
  - [x] 0.4 Set up base CSS with dark theme and CSS variables in `src/styles/index.css` (implemented in src/index.css)

- [x] 1.0 Core Types and Data
  - [x] 1.1 Create TypeScript interfaces in `src/types/index.ts` for Settings, SampleVideo, and CacheKeys
  - [x] 1.2 Create sample video metadata in `src/data/sampleVideos.ts` with 3-4 Pexels/Pixabay video URLs

- [x] 2.0 State Management Hooks
  - [x] 2.1 Create `useSettings` hook with all video2ascii control values and LocalStorage persistence
  - [ ] 2.2 Create `useVideoCache` hook for caching video selection and settings to LocalStorage (DEFERRED - basic caching in useSettings)

- [x] 3.0 UI Components - Video Selection
  - [x] 3.1 Create `VideoSelector` component with sample video thumbnail buttons
  - [x] 3.2 Add file upload input for custom video files
  - [x] 3.3 Style video selector with thumbnails and active state indicator

- [x] 4.0 UI Components - Control Panel
  - [x] 4.1 Create `ControlPanel` component with collapsible sections
  - [x] 4.2 Add Visual Settings controls: numColumns slider, brightness slider, colored toggle, charset dropdown, blend slider, highlight slider
  - [x] 4.3 Add Effects controls: enableMouse toggle, trailLength slider, enableRipple toggle, rippleSpeed slider
  - [x] 4.4 Add Audio controls: audioEffect slider, audioRange slider
  - [x] 4.5 Add Playback controls: play/pause button, showStats toggle
  - [x] 4.6 Add "Reset to Defaults" button
  - [x] 4.7 Style control panel with glassmorphism effect

- [x] 5.0 UI Components - ASCII Display & Code Export
  - [x] 5.1 Create `AsciiPlayer` wrapper component that passes all settings to Video2Ascii
  - [x] 5.2 Create `CodeExport` component that generates React code snippet from current settings
  - [x] 5.3 Add "Copy Code" button with clipboard functionality
  - [x] 5.4 Add loading skeleton/spinner while video loads

- [x] 6.0 Main App Assembly
  - [x] 6.1 Assemble all components in `App.tsx` with layout (70% display, 30% sidebar)
  - [x] 6.2 Wire up state between components
  - [x] 6.3 Add page title and minimal header

- [x] 7.0 Testing & Polish
  - [x] 7.1 Test all controls update ASCII output in real-time
  - [x] 7.2 Test video upload functionality
  - [x] 7.3 Test code export generates valid React code
  - [x] 7.4 Test LocalStorage persistence across page reloads
  - [x] 7.5 Final UI polish and responsive tweaks

## Known Issues for V2 (from PRD enhancements)

- [ ] Video freezes when changing settings (needs component key reset)
- [ ] Video freezes when uploading new video (same issue)
- [ ] No video caching (downloads every time)
- [ ] Uploaded videos not shown in video selector
- [ ] No dropdown to filter sample vs uploaded videos
