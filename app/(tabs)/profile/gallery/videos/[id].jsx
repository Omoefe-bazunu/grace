import React from 'react';
import { Share2 } from 'lucide-react-native';
import { getGalleryVideos } from '../../../../../services/dataService';
import VideoPlayerScreen from '../../../../../components/VideoPlayerScreen';

async function fetchGalleryVideo(id) {
  const all = await getGalleryVideos();
  return all.find((item) => item.id === id) || null;
}

export default function GalleryVideoDetailScreen() {
  return (
    <VideoPlayerScreen
      fetchFn={fetchGalleryVideo}
      defaultTitle="Gallery Video"
      urlFields={['videoUrl', 'url', 'youtubeId']}
      ShareIcon={Share2}
    />
  );
}
