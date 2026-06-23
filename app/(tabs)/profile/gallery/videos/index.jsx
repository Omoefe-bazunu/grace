import React from 'react';
import { getGalleryVideos } from '../../../../../services/dataService';
import VideoListScreen from '../../../../../components/VideoListScreen';
import { useLanguage } from '../../../../../contexts/LanguageContext';

export default function GalleryVideos() {
  const { translations } = useLanguage();
  return (
    <VideoListScreen
      fetchFn={getGalleryVideos}
      urlFields={['url', 'videoUrl', 'youtubeId']}
      routePrefix="/(tabs)/profile/gallery/videos"
      bannerUri="https://firebasestorage.googleapis.com/v0/b/southpark-11f5d.firebasestorage.app/o/general%2FHome%2FIMG-20260520-WA0239-01.jpeg?alt=media&token=cd857f08-86b0-4138-9e6f-a80307af5048"
      bannerTitle={translations.videoGalleryTitle || 'VIDEO GALLERY'}
      bannerSubtitle={
        translations.videoGallerySubtitle ||
        'Major events across our branches, kept for your viewing pleasure.'
      }
      searchPlaceholder={translations.search || 'Search'}
      emptyText={translations.noVideosYet || 'No videos yet'}
      emptySearchText={translations.noEventsFound || 'No videos found'}
      showBackButton={true}
    />
  );
}
