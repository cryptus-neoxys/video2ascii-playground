import { useRef } from 'react';
import { SAMPLE_VIDEOS } from '../data/sampleVideos';

interface VideoSelectorProps {
  currentVideoId: string | null;
  onSelectVideo: (videoUrl: string, videoId: string) => void;
  onUploadVideo: (file: File) => void;
}

export function VideoSelector({ 
  currentVideoId, 
  onSelectVideo, 
  onUploadVideo 
}: VideoSelectorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUploadVideo(file);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <>
      <div className="section-header">Video Selection</div>
      <div className="video-selector">
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
      </div>
    </>
  );
}
