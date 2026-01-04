# AGENT instructions (video2ascii-playground)

## Project overview
- This is a Vite + React + TypeScript **playground UI** for the `video2ascii` package (no backend).
- The core idea: a single `AsciiSettings` object drives the `Video2Ascii` component props.

## Architecture / data flow
- `src/App.tsx` composes the UI:
  - Left: `AsciiPlayer` renders `video2ascii`’s `<Video2Ascii />`.
  - Right: `VideoSelector`, `ControlPanel`, and `CodeExport` control/reflect the same settings.
- State lives in `src/hooks/useSettings.ts`:
  - Initializes from `DEFAULT_SETTINGS` + saved localStorage state.
  - Persists settings to localStorage with a ~300ms debounce.
- Types + defaults + cache keys are centralized in `src/types/index.ts`.

## Key conventions in this repo
- Settings are updated via a typed generic setter:
  - `updateSetting<K extends keyof AsciiSettings>(key, value)` from `useSettings`.
  - Components call it like `onUpdate('numColumns', v)` (see `src/components/ControlPanel.tsx`).
- Only “real” `video2ascii` props should be forwarded to `<Video2Ascii />`:
  - `videoSrc` is mapped to the `src` prop in `src/components/AsciiPlayer.tsx`.
  - Non-prop flags like `isCustomVideo` should not be passed through.
- Local storage:
  - Settings use `CACHE_KEYS.SETTINGS` (`v2a_settings`) in `src/hooks/useSettings.ts`.
  - “Last selected video” is stored as `v2a_last_video` in `src/App.tsx`; prefer using `CACHE_KEYS.LAST_VIDEO` for new code.

## Common change recipes
- Add a new setting/prop:
  - Update `AsciiSettings` and `DEFAULT_SETTINGS` in `src/types/index.ts`.
  - Wire UI in `src/components/ControlPanel.tsx` (or another component) using `onUpdate(...)`.
  - Pass the new prop into `<Video2Ascii />` in `src/components/AsciiPlayer.tsx`.
  - Update code generation in `src/hooks/useCodeExport.ts` so `generateCode()` includes it when non-default.

## Developer workflows
- Install: `pnpm install`
- Dev server: `pnpm dev` (Vite)
- Build: `pnpm build` (runs `tsc -b` then `vite build`)
- Lint: `pnpm lint` (ESLint flat config in `eslint.config.js`)
- Preview prod build: `pnpm preview`

## Styling / UI
- Styling is plain CSS in `src/index.css` using CSS variables (no Tailwind/UI kit).
- Prefer existing classnames (e.g. `control-group`, `section-header`, `btn`) and existing CSS variables.
