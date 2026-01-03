import type { SampleVideo } from '../types';

// Sample videos from Pexels - royalty free
export const SAMPLE_VIDEOS: SampleVideo[] = [
  {
    id: 'city-night',
    title: 'City Night',
    category: 'cinematic',
    thumbnailUrl: 'https://images.pexels.com/videos/3129671/free-video-3129671.jpg?auto=compress&cs=tinysrgb&w=200',
    videoUrl: 'https://videos.pexels.com/video-files/3129671/3129671-sd_640_360_30fps.mp4',
  },
  {
    id: 'waterfall',
    title: 'Waterfall',
    category: 'nature',
    thumbnailUrl: 'https://images.pexels.com/videos/2253585/free-video-2253585.jpg?auto=compress&cs=tinysrgb&w=200',
    videoUrl: 'https://videos.pexels.com/video-files/2253585/2253585-sd_640_360_24fps.mp4',
  },
  {
    id: 'arches-glacier-glacier-national-park-national-park-3813002',
    title: 'Glacier National Park',
    category: 'nature',
    thumbnailUrl: 'https://images.pexels.com/videos/3813002/arches-glacier-glacier-national-park-national-park-3813002.jpeg?auto=compress&cs=tinysrgb&w=200',
    videoUrl: 'https://videos.pexels.com/video-files/3813002/3813002-sd_640_360_30fps.mp4',
  },
  {
    id: 'woman-portrait',
    title: 'Portrait',
    category: 'person',
    thumbnailUrl: 'https://images.pexels.com/videos/34588734/pexels-photo-34588734.jpeg?auto=compress&cs=tinysrgb&w=200',
    videoUrl: 'https://videos.pexels.com/video-files/34588734/14657402_640_360_30fps.mp4',
  },
];

export const getVideoById = (id: string): SampleVideo | undefined => {
  return SAMPLE_VIDEOS.find(v => v.id === id);
};
