import { useRef, useState, useEffect } from 'react';
import type { UploadedVideo } from '../types';
import { CACHE_KEYS } from '../types';
import { SAMPLE_VIDEOS } from '../data/sampleVideos';

type TabType = 'sample' | 'uploaded';

interface VideoSelectorProps {
  currentVideoId: string | null;
  onSelectVideo: (videoUrl: string, videoId: string) => void;
  onUploadVideo: (file: File) => void;
  uploadedVideos: UploadedVideo[];
  onDeleteUploadedVideo?: (videoId: string) => void;
  isProcessingUpload?: boolean;
}

function loadActiveTab(): TabType {
  try {
    const saved = localStorage.getItem(CACHE_KEYS.ACTIVE_TAB);
    if (saved === 'sample' || saved === 'uploaded') return saved;
  } catch {
    // Ignore
  }
  return 'sample';
}

export function VideoSelector({ 
  currentVideoId, 
  onSelectVideo, 
  onUploadVideo,
  uploadedVideos,
  onDeleteUploadedVideo,
  isProcessingUpload = false,
}: VideoSelectorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<TabType>(() => loadActiveTab());

  // Persist active tab
  useEffect(() => {
    localStorage.setItem(CACHE_KEYS.ACTIVE_TAB, activeTab);
  }, [activeTab]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUploadVideo(file);
      // Clear the input so the same file can be uploaded again
      e.target.value = '';
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleDeleteVideo = (e: React.MouseEvent, videoId: string) => {
    e.stopPropagation();
    if (onDeleteUploadedVideo) {
      onDeleteUploadedVideo(videoId);
    }
  };

  return (
    <>
      {/* Tabs */}
      <div className="video-tabs">
        <button
          className={`video-tab ${activeTab === 'sample' ? 'active' : ''}`}
          onClick={() => setActiveTab('sample')}
        >
          Sample
        </button>
        <button
          className={`video-tab ${activeTab === 'uploaded' ? 'active' : ''}`}
          onClick={() => setActiveTab('uploaded')}
        >
          Uploaded {uploadedVideos.length > 0 && `(${uploadedVideos.length})`}
        </button>
      </div>

      {/* Video Grid */}
      <div className="video-selector">
        {activeTab === 'sample' && (
          <>
            {SAMPLE_VIDEOS.map((video) => (
              <button
                key={video.id}
                className={`video-thumb ${currentVideoId === video.id ? 'active' : ''}`}
                onClick={() => onSelectVideo(video.videoUrl, video.id)}
                title={video.title}
              >
                <img 
                  src={video.thumbnailUrl} 
                  alt={video.title}
                  loading="lazy"
                />
                <span className="video-thumb-label">{video.title}</span>
              </button>
            ))}
          </>
        )}

        {activeTab === 'uploaded' && (
          <>
            {uploadedVideos.length === 0 && !isProcessingUpload && (
              <div className="upload-empty">
                <span>No uploaded videos yet</span>
              </div>
            )}

            {uploadedVideos.map((video) => (
              <button
                key={video.id}
                className={`video-thumb ${currentVideoId === video.id ? 'active' : ''}`}
                onClick={() => onSelectVideo(video.videoUrl, video.id)}
                title={video.title}
              >
                <img 
                  src={video.thumbnailUrl} 
                  alt={video.title}
                  loading="lazy"
                />
                <span className="video-thumb-label">{video.title}</span>
                {onDeleteUploadedVideo && (
                  <button 
                    className="video-thumb-delete"
                    onClick={(e) => handleDeleteVideo(e, video.id)}
                    title="Delete video"
                  >
                    ×
                  </button>
                )}
              </button>
            ))}

            {isProcessingUpload && (
              <div className="video-thumb processing">
                <div className="loading-skeleton" style={{ width: '100%', height: '100%' }} />
                <span className="video-thumb-label">Processing...</span>
              </div>
            )}

            {/* Upload Button */}
            <div 
              className="upload-zone"
              onClick={handleUploadClick}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && handleUploadClick()}
            >
              <span>📁 Upload Video</span>
              <input
                ref={fileInputRef}
                type="file"
                accept="video/mp4,video/webm,video/*"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
            </div>
          </>
        )}
      </div>
    </>
  );
}
