import React from 'react';
import { Share2 } from 'lucide-react-native';
import { getSermonVideo } from '../../../../services/dataService';
import VideoPlayerScreen from '../../../../components/VideoPlayerScreen';

export default function SermonVideoDetailScreen() {
  return (
    <VideoPlayerScreen
      fetchFn={getSermonVideo}
      defaultTitle="Sermon Video"
      urlFields={['videoUrl', 'youtubeId']}
      ShareIcon={Share2}
    />
  );
}
