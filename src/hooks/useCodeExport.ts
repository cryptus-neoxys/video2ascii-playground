import type { AsciiSettings } from '../types';
import { DEFAULT_SETTINGS } from '../types';

interface GeneratedCode {
  code: string;
  hasNonDefaults: boolean;
}

function formatValue(value: unknown): string {
  if (typeof value === 'string') return `"${value}"`;
  if (typeof value === 'boolean') return `{${value}}`;
  if (typeof value === 'number') return `{${value}}`;
  return String(value);
}

export function generateCode(settings: AsciiSettings): GeneratedCode {
  const nonDefaultProps: string[] = [];
  
  // Only include props that differ from defaults
  const checkProp = <K extends keyof AsciiSettings>(key: K, skipKeys: K[] = []) => {
    if (skipKeys.includes(key)) return;
    if (settings[key] !== DEFAULT_SETTINGS[key]) {
      const formattedValue = formatValue(settings[key]);
      nonDefaultProps.push(`  ${key}=${formattedValue}`);
    }
  };
  
  // Skip videoSrc and isCustomVideo as they're not real props
  const skipKeys: (keyof AsciiSettings)[] = ['videoSrc', 'isCustomVideo'];
  
  (Object.keys(DEFAULT_SETTINGS) as (keyof AsciiSettings)[]).forEach(key => {
    checkProp(key, skipKeys);
  });
  
  const propsString = nonDefaultProps.length > 0 
    ? '\n' + nonDefaultProps.join('\n') + '\n'
    : '';
  
  const code = `import Video2Ascii from "video2ascii";

<Video2Ascii
  src="/your-video.mp4"${propsString}/>`;
  
  return {
    code,
    hasNonDefaults: nonDefaultProps.length > 0,
  };
}

export function copyToClipboard(text: string): Promise<boolean> {
  return navigator.clipboard.writeText(text)
    .then(() => true)
    .catch(() => false);
}
