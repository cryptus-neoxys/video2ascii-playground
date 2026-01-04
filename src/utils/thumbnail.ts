// Thumbnail generation utility - extracts frame from video at min(duration, 1s)

export async function generateThumbnail(videoBlob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.muted = true;
    video.playsInline = true;
    video.preload = 'metadata';

    const blobUrl = URL.createObjectURL(videoBlob);
    video.src = blobUrl;

    const cleanup = () => {
      URL.revokeObjectURL(blobUrl);
      video.remove();
    };

    video.onerror = () => {
      cleanup();
      reject(new Error('Failed to load video for thumbnail'));
    };

    video.onloadedmetadata = () => {
      // Seek to min(duration, 1s)
      const seekTime = Math.min(video.duration, 1);
      video.currentTime = seekTime;
    };

    video.onseeked = () => {
      try {
        // Create canvas and draw the frame
        const canvas = document.createElement('canvas');
        const aspectRatio = video.videoWidth / video.videoHeight;
        
        // Thumbnail size: 200px width, maintain aspect ratio
        canvas.width = 200;
        canvas.height = Math.round(200 / aspectRatio);

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          cleanup();
          reject(new Error('Failed to get canvas context'));
          return;
        }

        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Convert to data URL (JPEG for smaller size)
        const thumbnailUrl = canvas.toDataURL('image/jpeg', 0.7);
        
        cleanup();
        console.log('[Thumbnail] Generated thumbnail for video');
        resolve(thumbnailUrl);
      } catch (error) {
        cleanup();
        reject(error);
      }
    };
  });
}

export function sanitizeFilename(filename: string): string {
  // Remove extension and special characters
  return filename
    .replace(/\.[^/.]+$/, '') // Remove extension
    .replace(/[^a-zA-Z0-9]/g, '_') // Replace special chars with underscore
    .toLowerCase()
    .slice(0, 30); // Limit length
}

export function generateVideoId(filename: string): string {
  const sanitized = sanitizeFilename(filename);
  return `user_${sanitized}_${Date.now()}`;
}
