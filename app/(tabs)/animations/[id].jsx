import React from 'react';
import { Share2 } from 'lucide-react-native';
import { getVideo } from '../../../services/dataService';
import VideoPlayerScreen from '../../../components/VideoPlayerScreen';

export default function AnimationDetailScreen() {
  return (
    <VideoPlayerScreen
      fetchFn={getVideo}
      defaultTitle="Animation Video"
      urlFields={['videoUrl', 'youtubeId']}
      ShareIcon={Share2}
    />
  );
}
