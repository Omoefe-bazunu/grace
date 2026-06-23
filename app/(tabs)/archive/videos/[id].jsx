import React from 'react';
import { Share2 } from 'lucide-react-native';
import { getArchiveVideos } from '../../../../services/dataService';
import VideoPlayerScreen from '../../../../components/VideoPlayerScreen';

async function fetchArchiveVideo(id) {
  const all = await getArchiveVideos();
  return all.find((item) => item.id === id) || null;
}

export default function ArchiveVideoDetailScreen() {
  return (
    <VideoPlayerScreen
      fetchFn={fetchArchiveVideo}
      defaultTitle="Archive Video"
      urlFields={['videoUrl', 'url', 'youtubeId']}
      ShareIcon={Share2}
    />
  );
}
