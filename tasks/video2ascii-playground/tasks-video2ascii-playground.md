# Video2Ascii Playground - Implementation Tasks

## Relevant Files

- `src/App.tsx` - Main application component with layout and state management
- `src/components/AsciiPlayer.tsx` - Wrapper component for video2ascii with dynamic props
- `src/components/ControlPanel.tsx` - Sidebar with all interactive controls
- `src/components/VideoSelector.tsx` - Sample video thumbnails and upload button
- `src/components/CodeExport.tsx` - Generated code snippet display with copy button
- `src/hooks/useSettings.ts` - State management for all control values with LocalStorage persistence
- `src/hooks/useVideoCache.ts` - Video caching logic using LocalStorage/IndexedDB
- `src/data/sampleVideos.ts` - Sample video metadata (URLs, thumbnails, titles)
- `src/styles/index.css` - Global styles, CSS variables, dark theme
- `src/styles/controls.css` - Control panel styling (glassmorphism, sliders)
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

- [ ] 0.0 Project Setup
  - [ ] 0.1 Initialize Vite + React + TypeScript project using `pnpm create vite@latest ./ --template react-ts`
  - [ ] 0.2 Install video2ascii package: `pnpm add video2ascii`
  - [ ] 0.3 Create folder structure: `src/components`, `src/hooks`, `src/data`, `src/styles`, `src/types`
  - [ ] 0.4 Set up base CSS with dark theme and CSS variables in `src/styles/index.css`

- [ ] 1.0 Core Types and Data
  - [ ] 1.1 Create TypeScript interfaces in `src/types/index.ts` for Settings, SampleVideo, and CacheKeys
  - [ ] 1.2 Create sample video metadata in `src/data/sampleVideos.ts` with 3-4 Pexels/Pixabay video URLs

- [ ] 2.0 State Management Hooks
  - [ ] 2.1 Create `useSettings` hook with all video2ascii control values and LocalStorage persistence
  - [ ] 2.2 Create `useVideoCache` hook for caching video selection and settings to LocalStorage

- [ ] 3.0 UI Components - Video Selection
  - [ ] 3.1 Create `VideoSelector` component with sample video thumbnail buttons
  - [ ] 3.2 Add file upload input for custom video files
  - [ ] 3.3 Style video selector with thumbnails and active state indicator

- [ ] 4.0 UI Components - Control Panel
  - [ ] 4.1 Create `ControlPanel` component with collapsible sections
  - [ ] 4.2 Add Visual Settings controls: numColumns slider, brightness slider, colored toggle, charset dropdown, blend slider, highlight slider
  - [ ] 4.3 Add Effects controls: enableMouse toggle, trailLength slider, enableRipple toggle, rippleSpeed slider
  - [ ] 4.4 Add Audio controls: audioEffect slider, audioRange slider
  - [ ] 4.5 Add Playback controls: play/pause button, showStats toggle
  - [ ] 4.6 Add "Reset to Defaults" button
  - [ ] 4.7 Style control panel with glassmorphism effect

- [ ] 5.0 UI Components - ASCII Display & Code Export
  - [ ] 5.1 Create `AsciiPlayer` wrapper component that passes all settings to Video2Ascii
  - [ ] 5.2 Create `CodeExport` component that generates React code snippet from current settings
  - [ ] 5.3 Add "Copy Code" button with clipboard functionality
  - [ ] 5.4 Add loading skeleton/spinner while video loads

- [ ] 6.0 Main App Assembly
  - [ ] 6.1 Assemble all components in `App.tsx` with layout (70% display, 30% sidebar)
  - [ ] 6.2 Wire up state between components
  - [ ] 6.3 Add page title and minimal header

- [ ] 7.0 Testing & Polish
  - [ ] 7.1 Test all controls update ASCII output in real-time
  - [ ] 7.2 Test video upload functionality
  - [ ] 7.3 Test code export generates valid React code
  - [ ] 7.4 Test LocalStorage persistence across page reloads
  - [ ] 7.5 Final UI polish and responsive tweaks
