import { useState, useCallback, useMemo } from 'react';
import { useSettings } from './hooks/useSettings';
import { useVideoCache } from './hooks/useVideoCache';
import { useUploadedVideos } from './hooks/useUploadedVideos';
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
  
  const { settings, settingsVersion, updateSetting, updateSettingLive, commitSettings, resetToDefaults, setVideoSrc } = useSettings(defaultVideoSrc);
  const { cacheVideo, getCacheStats } = useVideoCache();
  const { uploadedVideos, isProcessing, addVideo, removeVideo, getVideoUrl } = useUploadedVideos();

  // Generate a unique key for the AsciiPlayer to force remount on settings/video changes
  const playerKey = useMemo(() => {
    return `${settings.videoSrc}_v${settingsVersion}`;
  }, [settings.videoSrc, settingsVersion]);

  const handleSelectVideo = useCallback(async (videoUrl: string, videoId: string) => {
    setCurrentVideoId(videoId);
    localStorage.setItem('v2a_last_video', videoId);
    
    // Check if this is an uploaded video
    if (videoId.startsWith('user_')) {
      // Get from cache
      const cachedUrl = await getVideoUrl(videoId);
      if (cachedUrl) {
        setVideoSrc(cachedUrl, true);
      } else {
        console.warn('[App] Uploaded video not found in cache:', videoId);
      }
    } else {
      // For sample videos, try to use cache
      try {
        const cachedUrl = await cacheVideo(videoId, videoUrl);
        setVideoSrc(cachedUrl, false);
        console.log('[App] Cache stats:', getCacheStats());
      } catch (error) {
        console.error('[App] Failed to cache video:', error);
        setVideoSrc(videoUrl, false);
      }
    }
  }, [setVideoSrc, cacheVideo, getCacheStats, getVideoUrl]);

  const handleUploadVideo = useCallback(async (file: File) => {
    const uploadedVideo = await addVideo(file);
    if (uploadedVideo) {
      setCurrentVideoId(uploadedVideo.id);
      setVideoSrc(uploadedVideo.videoUrl, true);
      localStorage.setItem('v2a_last_video', uploadedVideo.id);
    }
  }, [addVideo, setVideoSrc]);

  const handleDeleteUploadedVideo = useCallback(async (videoId: string) => {
    await removeVideo(videoId);
    // If the deleted video was selected, clear selection
    if (currentVideoId === videoId) {
      setCurrentVideoId(null);
      setVideoSrc('', false);
    }
  }, [removeVideo, currentVideoId, setVideoSrc]);

  const handleTogglePlay = useCallback(() => {
    updateSetting('isPlaying', !settings.isPlaying);
  }, [settings.isPlaying, updateSetting]);

  return (
    <div className="app">
      {/* Main ASCII Display */}
      <div className="ascii-container">
        <AsciiPlayer 
          key={playerKey}
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
          uploadedVideos={uploadedVideos}
          onDeleteUploadedVideo={handleDeleteUploadedVideo}
          isProcessingUpload={isProcessing}
        />

        <ControlPanel
          settings={settings}
          onUpdateLive={updateSettingLive}
          onUpdate={updateSetting}
          onCommit={commitSettings}
          onReset={resetToDefaults}
        />

        <CodeExport settings={settings} />
      </aside>
    </div>
  );
}

export default App;
