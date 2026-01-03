import Video2Ascii from 'video2ascii';
import type { AsciiSettings } from '../types';

interface AsciiPlayerProps {
  settings: AsciiSettings;
  onTogglePlay: () => void;
}

export function AsciiPlayer({ settings, onTogglePlay }: AsciiPlayerProps) {
  if (!settings.videoSrc) {
    return (
      <div className="loading-skeleton" style={{ 
        width: '100%', 
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        <span style={{ fontSize: '3rem' }}>🎬</span>
        <span style={{ color: 'var(--text-muted)' }}>Select a video to begin</span>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <Video2Ascii
        src={settings.videoSrc}
        numColumns={settings.numColumns}
        colored={settings.colored}
        brightness={settings.brightness}
        blend={settings.blend}
        highlight={settings.highlight}
        charset={settings.charset}
        enableMouse={settings.enableMouse}
        trailLength={settings.trailLength}
        enableRipple={settings.enableRipple}
        rippleSpeed={settings.rippleSpeed}
        audioEffect={settings.audioEffect}
        audioRange={settings.audioRange}
        isPlaying={settings.isPlaying}
        autoPlay={true}
        showStats={settings.showStats}
        enableSpacebarToggle={true}
      />
      
      {/* Play/Pause overlay button */}
      <button 
        className="play-btn"
        onClick={onTogglePlay}
        style={{
          position: 'absolute',
          bottom: '1.5rem',
          left: '1.5rem',
          opacity: 0.8,
        }}
        title={settings.isPlaying ? 'Pause (Space)' : 'Play (Space)'}
      >
        {settings.isPlaying ? (
          <svg viewBox="0 0 24 24">
            <rect x="6" y="4" width="4" height="16" />
            <rect x="14" y="4" width="4" height="16" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24">
            <polygon points="5,3 19,12 5,21" />
          </svg>
        )}
      </button>
    </div>
  );
}
