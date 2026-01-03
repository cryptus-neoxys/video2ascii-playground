import { useState, useCallback } from 'react';
import { useSettings } from './hooks/useSettings';
import { VideoSelector } from './components/VideoSelector';
import { ControlPanel } from './components/ControlPanel';
import { CodeExport } from './components/CodeExport';
import { AsciiPlayer } from './components/AsciiPlayer';
import { SAMPLE_VIDEOS } from './data/sampleVideos';
import './index.css';

function App() {
  const [currentVideoId, setCurrentVideoId] = useState<string | null>(() => {
    // Try to get last used video from localStorage
    const saved = localStorage.getItem('v2a_last_video');
    return saved || SAMPLE_VIDEOS[0]?.id || null;
  });

  const defaultVideoSrc = SAMPLE_VIDEOS.find(v => v.id === currentVideoId)?.videoUrl || SAMPLE_VIDEOS[0]?.videoUrl || '';
  
  const { settings, updateSetting, resetToDefaults, setVideoSrc } = useSettings(defaultVideoSrc);

  const handleSelectVideo = useCallback((videoUrl: string, videoId: string) => {
    setCurrentVideoId(videoId);
    setVideoSrc(videoUrl, false);
    localStorage.setItem('v2a_last_video', videoId);
  }, [setVideoSrc]);

  const handleUploadVideo = useCallback((file: File) => {
    const url = URL.createObjectURL(file);
    setCurrentVideoId(null); // Clear selected sample
    setVideoSrc(url, true);
  }, [setVideoSrc]);

  const handleTogglePlay = useCallback(() => {
    updateSetting('isPlaying', !settings.isPlaying);
  }, [settings.isPlaying, updateSetting]);

  return (
    <div className="app">
      {/* Main ASCII Display */}
      <div className="ascii-container">
        <AsciiPlayer 
          settings={settings} 
          onTogglePlay={handleTogglePlay}
        />
      </div>

      {/* Control Sidebar */}
      <aside className="control-sidebar">
        <div className="sidebar-header">
          <h1>Video2Ascii Playground</h1>
          <p>Interactive ASCII art demo</p>
        </div>

        <VideoSelector
          currentVideoId={currentVideoId}
          onSelectVideo={handleSelectVideo}
          onUploadVideo={handleUploadVideo}
        />

        <ControlPanel
          settings={settings}
          onUpdate={updateSetting}
          onReset={resetToDefaults}
        />

        <CodeExport settings={settings} />
      </aside>
    </div>
  );
}

export default App;
