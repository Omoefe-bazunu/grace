import React from 'react';
import {
  getSermonVideosPaginated,
  searchContentPaginated,
} from '../../../../services/dataService';
import VideoListScreen from '../../../../components/VideoListScreen';
import { useLanguage } from '../../../../contexts/LanguageContext';

const searchFn = (query, pageSize, cursor) =>
  searchContentPaginated(query, null, pageSize, cursor);

export default function SermonVideosScreen() {
  const { translations } = useLanguage();
  return (
    <VideoListScreen
      fetchMoreFn={getSermonVideosPaginated}
      searchFn={searchFn}
      itemsKey="sermonVideos"
      routePrefix="/(tabs)/sermons/video"
      bannerUri="https://firebasestorage.googleapis.com/v0/b/southpark-11f5d.firebasestorage.app/o/general%2Fsermonsection.jpeg?alt=media&token=4ed2e960-ac18-401a-a9f6-e15dc5e30d16"
      bannerTitle={translations.sermonVideosBannerTitle || 'SERMON VIDEOS'}
      bannerSubtitle={
        translations.sermonVideosBannerSubtitle ||
        'Watch video versions of our sermons.'
      }
      searchPlaceholder={
        translations.searchSermonVideosPlaceholder || 'Search sermon videos...'
      }
      emptyText={
        translations.noSermonVideosAvailable || 'No sermon videos available'
      }
      emptySearchText={
        translations.noSermonVideosFound || 'No sermon videos found'
      }
      showBackButton={true}
    />
  );
}
