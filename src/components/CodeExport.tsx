import { useState, useMemo } from 'react';
import type { AsciiSettings } from '../types';
import { generateCode, copyToClipboard } from '../hooks/useCodeExport';

interface CodeExportProps {
  settings: AsciiSettings;
}

export function CodeExport({ settings }: CodeExportProps) {
  const [isCopied, setIsCopied] = useState(false);
  
  const { code } = useMemo(() => generateCode(settings), [settings]);

  const handleCopy = async () => {
    const success = await copyToClipboard(code);
    if (success) {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  return (
    <>
      <div className="section-header">
        <span>{'</>'} Code Export</span>
      </div>
      <div className="code-export">
        <pre className="code-block">
          <code>{code}</code>
        </pre>
        <button 
          className={`btn ${isCopied ? 'btn-primary' : ''}`} 
          onClick={handleCopy}
          style={{ width: '100%', marginTop: '0.75rem' }}
        >
          {isCopied ? '✓ Copied!' : '📋 Copy Code'}
        </button>
      </div>
    </>
  );
}
