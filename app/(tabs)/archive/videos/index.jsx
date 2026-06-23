import React from 'react';
import { Film } from 'lucide-react-native';
import { getArchiveVideos } from '../../../../services/dataService';
import VideoListScreen from '../../../../components/VideoListScreen';
import { useLanguage } from '../../../../contexts/LanguageContext';

export default function ArchiveVideosScreen() {
  const { translations } = useLanguage();
  return (
    <VideoListScreen
      fetchFn={getArchiveVideos}
      urlFields={['url', 'videoUrl', 'youtubeId']}
      routePrefix="/(tabs)/archive/videos"
      bannerUri="https://firebasestorage.googleapis.com/v0/b/southpark-11f5d.firebasestorage.app/o/general%2FHome%2FCHURCHARCHIVE.jpeg?alt=media&token=8a847186-124a-4603-93fe-4da0f740f15e"
      bannerTitle={translations.videoArchiveTitle || 'VIDEO ARCHIVE'}
      bannerSubtitle={
        translations.videoArchiveSubtitle ||
        'Videos of old events of the church, kept for reference and memories.'
      }
      searchPlaceholder={translations.search || 'Search'}
      emptyText={translations.noVideosYet || 'No videos yet'}
      emptySearchText={translations.noEventsFound || 'No videos found'}
      showBackButton={true}
    />
  );
}
