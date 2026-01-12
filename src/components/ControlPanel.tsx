import type { AsciiSettings, CharsetKey } from '../types';

interface ControlPanelProps {
  settings: AsciiSettings;
  onUpdateLive: <K extends keyof AsciiSettings>(key: K, value: AsciiSettings[K]) => void;
  onUpdate: <K extends keyof AsciiSettings>(key: K, value: AsciiSettings[K]) => void;
  onCommit: () => void;
  onReset: () => void;
}

const CHARSETS: { value: CharsetKey; label: string }[] = [
  { value: 'standard', label: 'Standard' },
  { value: 'detailed', label: 'Detailed (70 chars)' },
  { value: 'blocks', label: 'Blocks █▓▒░' },
  { value: 'minimal', label: 'Minimal' },
  { value: 'binary', label: 'Binary 10' },
  { value: 'dots', label: 'Dots ●◉○' },
  { value: 'arrows', label: 'Arrows' },
  { value: 'emoji', label: 'Emoji' },
];

// Slider component with separate live and commit callbacks
function Slider({ 
  label, 
  value, 
  min, 
  max, 
  step = 1,
  onChangeLive,
  onCommit,
}: { 
  label: string; 
  value: number; 
  min: number; 
  max: number; 
  step?: number;
  onChangeLive: (v: number) => void;  // Called on every drag tick
  onCommit: () => void;               // Called on mouse release / blur
}) {
  return (
    <div className="control-row" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '0.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span className="control-label">{label}</span>
        <span className="control-value">{step < 1 ? value.toFixed(1) : value}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChangeLive(Number(e.target.value))}
        onPointerUp={onCommit}
        onBlur={onCommit}
      />
    </div>
  );
}

// Toggle component  
function Toggle({ 
  label, 
  checked, 
  onChange 
}: { 
  label: string; 
  checked: boolean; 
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="control-row">
      <span className="control-label">{label}</span>
      <div 
        className={`toggle ${checked ? 'active' : ''}`}
        onClick={() => onChange(!checked)}
        role="switch"
        aria-checked={checked}
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && onChange(!checked)}
      />
    </div>
  );
}

export function ControlPanel({ settings, onUpdateLive, onUpdate, onCommit, onReset }: ControlPanelProps) {
  return (
    <>
      {/* Visual Settings */}
      <div className="section-header">Visual Settings</div>
      <div className="control-group">
        <Slider
          label="Columns"
          value={settings.numColumns}
          min={40}
          max={200}
          onChangeLive={(v) => onUpdateLive('numColumns', v)}
          onCommit={onCommit}
        />
        <Slider
          label="Brightness"
          value={settings.brightness}
          min={0}
          max={2}
          step={0.1}
          onChangeLive={(v) => onUpdateLive('brightness', v)}
          onCommit={onCommit}
        />
        <Slider
          label="Blend (ASCII ↔ Video)"
          value={settings.blend}
          min={0}
          max={100}
          onChangeLive={(v) => onUpdateLive('blend', v)}
          onCommit={onCommit}
        />
        <Slider
          label="Highlight"
          value={settings.highlight}
          min={0}
          max={100}
          onChangeLive={(v) => onUpdateLive('highlight', v)}
          onCommit={onCommit}
        />
        
        <div className="control-row">
          <span className="control-label">Charset</span>
          <select
            value={settings.charset}
            onChange={(e) => onUpdate('charset', e.target.value as CharsetKey)}
          >
            {CHARSETS.map(c => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>
        
        <Toggle
          label="Colored"
          checked={settings.colored}
          onChange={(v) => onUpdate('colored', v)}
        />
      </div>

      {/* Interactive Effects */}
      <div className="section-header">Interactive Effects</div>
      <div className="control-group">
        <Toggle
          label="Mouse Glow"
          checked={settings.enableMouse}
          onChange={(v) => onUpdate('enableMouse', v)}
        />
        {settings.enableMouse && (
          <Slider
            label="Trail Length"
            value={settings.trailLength}
            min={0}
            max={50}
            onChangeLive={(v) => onUpdateLive('trailLength', v)}
            onCommit={onCommit}
          />
        )}
        
        <Toggle
          label="Click Ripple"
          checked={settings.enableRipple}
          onChange={(v) => onUpdate('enableRipple', v)}
        />
        {settings.enableRipple && (
          <Slider
            label="Ripple Speed"
            value={settings.rippleSpeed}
            min={10}
            max={100}
            onChangeLive={(v) => onUpdateLive('rippleSpeed', v)}
            onCommit={onCommit}
          />
        )}
      </div>

      {/* Audio Settings */}
      <div className="section-header">Audio Reactivity</div>
      <div className="control-group">
        <Slider
          label="Audio Effect"
          value={settings.audioEffect}
          min={0}
          max={100}
          onChangeLive={(v) => onUpdateLive('audioEffect', v)}
          onCommit={onCommit}
        />
        <Slider
          label="Audio Range"
          value={settings.audioRange}
          min={0}
          max={100}
          onChangeLive={(v) => onUpdateLive('audioRange', v)}
          onCommit={onCommit}
        />
      </div>

      {/* Playback */}
      <div className="section-header">Playback</div>
      <div className="control-group">
        <Toggle
          label="Show FPS Stats"
          checked={settings.showStats}
          onChange={(v) => onUpdate('showStats', v)}
        />
        
        <div className="control-row" style={{ marginTop: '0.5rem' }}>
          <button className="btn" onClick={onReset}>
            ↺ Reset to Defaults
          </button>
        </div>
      </div>
    </>
  );
}
