import React from 'react';
import { Film } from 'lucide-react-native';
import {
  getVideosPaginated,
  searchContentPaginated,
} from '../../../services/dataService';
import VideoListScreen from '../../../components/VideoListScreen';
import { useLanguage } from '../../../contexts/LanguageContext';

const searchFn = (query, pageSize, cursor) =>
  searchContentPaginated(query, null, pageSize, cursor);

export default function AnimationsScreen() {
  const { translations } = useLanguage();
  return (
    <VideoListScreen
      fetchMoreFn={getVideosPaginated}
      searchFn={searchFn}
      itemsKey="videos"
      routePrefix="/(tabs)/animations"
      bannerUri="https://firebasestorage.googleapis.com/v0/b/southpark-11f5d.firebasestorage.app/o/general%2FBIBLEBASEDSTORIES.jpeg?alt=media&token=27b0644c-ab46-49fd-8f61-a97e97fcf584"
      bannerTitle={translations.animationsBannerTitle || 'BIBLE-BASED STORIES'}
      bannerSubtitle={
        translations.animationsBannerSubtitle ||
        'Learn the word of God through visual illustrations.'
      }
      searchPlaceholder={
        translations.searchAnimationsPlaceholder || 'Search animations...'
      }
      emptyIcon={Film}
      emptyText={
        translations.noAnimationsAvailable || 'No animations available'
      }
      emptySearchText={translations.noVideosFound || 'No videos found'}
      topNavTitle={translations.animations || 'Animations'}
    />
  );
}
