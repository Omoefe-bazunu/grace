import apiClient from '../utils/api';

// === SERMONS ===
export const getSermons = async () => {
  try {
    const response = await apiClient.get('sermons');
    return response.data.sermons || [];
  } catch {
    return [];
  }
};

export const getSermonsPaginated = async (limit = 15, after = null) => {
  try {
    const params = { limit, sort: 'createdAt', order: 'desc' };
    if (after) params.after = after;
    const response = await apiClient.get('sermons', params);
    return {
      sermons: response.data.sermons || [],
      hasMore: response.data.pagination?.hasMore || false,
      nextCursor: response.data.pagination?.nextCursor || null,
    };
  } catch {
    return { sermons: [], hasMore: false };
  }
};

export const getSermonsByCategoryPaginated = async (
  category,
  limit = 10,
  after = null
) => {
  try {
    const params = { category, limit, sort: 'createdAt', order: 'desc' };
    if (after) params.after = after;
    const response = await apiClient.get('sermons', params);
    return {
      sermons: response.data.sermons || [],
      hasMore: response.data.pagination?.hasMore || false,
      nextCursor: response.data.pagination?.nextCursor || null,
    };
  } catch {
    return { sermons: [], hasMore: false };
  }
};

export const getSermon = async (id) => {
  try {
    const response = await apiClient.get(`sermons/${id}`);
    return response.data;
  } catch {
    return null;
  }
};

// === SERMON VIDEOS ===
export const getSermonVideos = async () => {
  try {
    const response = await apiClient.get('sermonVideos');
    return response.data.sermonVideos || [];
  } catch {
    return [];
  }
};

export const getSermonVideosPaginated = async (limit = 12, after = null) => {
  try {
    const params = { limit, sort: 'createdAt', order: 'desc' };
    if (after) params.after = after;
    const response = await apiClient.get('sermonVideos', params);
    return {
      sermonVideos: response.data.sermonVideos || [],
      hasMore: response.data.pagination?.hasMore || false,
      nextCursor: response.data.pagination?.nextCursor || null,
    };
  } catch {
    return { sermonVideos: [], hasMore: false };
  }
};

export const getSermonVideosByCategoryPaginated = async (
  category,
  limit = 10,
  after = null
) => {
  try {
    const params = { category, limit, sort: 'createdAt', order: 'desc' };
    if (after) params.after = after;
    const response = await apiClient.get('sermonVideos', params);
    return {
      sermonVideos: response.data.sermonVideos || [],
      hasMore: response.data.pagination?.hasMore || false,
      nextCursor: response.data.pagination?.nextCursor || null,
    };
  } catch {
    return { sermonVideos: [], hasMore: false };
  }
};

export const getSermonVideo = async (id) => {
  try {
    const response = await apiClient.get(`sermonVideos/${id}`);
    return response.data;
  } catch {
    return null;
  }
};

// === SONGS ===
export const getSongs = async () => {
  try {
    const response = await apiClient.get('songs');
    return response.data.songs || [];
  } catch {
    return [];
  }
};

export const getSongsPaginated = async (limit = 15, after = null) => {
  try {
    const params = { limit, sort: 'title', order: 'asc' };
    if (after) params.after = after;
    const response = await apiClient.get('songs', params);
    return {
      songs: response.data.songs || [],
      hasMore: response.data.pagination?.hasMore || false,
      nextCursor: response.data.pagination?.nextCursor || null,
    };
  } catch {
    return { songs: [], hasMore: false };
  }
};

export const getSongsByCategoryPaginated = async (
  category,
  limit = 10,
  after = null
) => {
  try {
    const params = { category, limit };
    if (after) params.after = after;
    const response = await apiClient.get('songs', params);
    return {
      songs: response.data.songs || [],
      hasMore: response.data.pagination?.hasMore || false,
      nextCursor: response.data.pagination?.nextCursor || null,
    };
  } catch {
    return { songs: [], hasMore: false };
  }
};

export const getSong = async (id) => {
  try {
    const response = await apiClient.get(`songs/${id}`);
    return response.data;
  } catch {
    return null;
  }
};

export const getFavorites = async (email) => {
  try {
    if (!email) return [];
    const response = await apiClient.get(`users/${email}/favorites`);
    return response.data.favorites || [];
  } catch {
    return [];
  }
};

export const toggleFavorite = async (songId, action) => {
  return apiClient.post(`songs/${songId}/favorite`, { action });
};

// === VIDEOS ===
export const getVideos = async () => {
  try {
    const response = await apiClient.get('videos');
    return response.data.videos || [];
  } catch {
    return [];
  }
};

export const getVideosPaginated = async (limit = 12, after = null) => {
  try {
    const params = { limit, sort: 'createdAt', order: 'desc' };
    if (after) params.after = after;
    const response = await apiClient.get('videos', params);
    return {
      videos: response.data.videos || [],
      hasMore: response.data.pagination?.hasMore || false,
      nextCursor: response.data.pagination?.nextCursor || null,
    };
  } catch {
    return { videos: [], hasMore: false };
  }
};

export const getVideo = async (id) => {
  try {
    const response = await apiClient.get(`videos/${id}`);
    return response.data;
  } catch {
    return null;
  }
};

// === DAILY DEVOTIONALS ===
export const getDailyDevotionals = async () => {
  try {
    const response = await apiClient.get('dailyDevotionals');
    return response.data.dailyDevotionals || [];
  } catch {
    return [];
  }
};

export const getDailyDevotionalsPaginated = async (
  limit = 10,
  after = null
) => {
  try {
    const params = { limit, sort: 'date', order: 'desc' };
    if (after) params.after = after;
    const response = await apiClient.get('dailyDevotionals', params);
    return {
      dailyDevotionals: response.data.dailyDevotionals || [],
      hasMore: response.data.pagination?.hasMore || false,
      nextCursor: response.data.pagination?.nextCursor || null,
    };
  } catch {
    return { dailyDevotionals: [], hasMore: false };
  }
};

export const getDailyDevotionalByDate = async (date) => {
  try {
    const all = await getDailyDevotionals();
    return all.find((d) => d.date === date) || null;
  } catch {
    return null;
  }
};

// === NOTICES ===
export const getNotices = async () => {
  try {
    const response = await apiClient.get('notices');
    return response.data.notices || [];
  } catch {
    return [];
  }
};

export const subscribeToNotices = (callback) => {
  const fetch = async () => {
    try {
      const response = await apiClient.get('notices');
      callback(response.data.notices || []);
    } catch {
      callback([]);
    }
  };
  fetch();
  const interval = setInterval(fetch, 10000);
  return () => clearInterval(interval);
};

export const markNoticeAsRead = async (userId, noticeId) => {
  return apiClient.post(`users/${userId}/readNotices`, { noticeId });
};

export const subscribeToReadNotices = (userId, callback) => {
  const fetch = async () => {
    try {
      const response = await apiClient.get(`users/${userId}/readNotices`);
      callback(response.data || []);
    } catch {
      callback([]);
    }
  };
  fetch();
  const interval = setInterval(fetch, 10000);
  return () => clearInterval(interval);
};

// === GALLERY & MINISTERS ===
export const getGalleryPictures = async () => {
  try {
    const response = await apiClient.get('galleryPictures');
    return response.data.galleryPictures || [];
  } catch {
    return [];
  }
};

export const getGalleryVideos = async () => {
  try {
    const response = await apiClient.get('galleryVideos');
    return response.data.galleryVideos || [];
  } catch {
    return [];
  }
};

export const getMinisters = async () => {
  try {
    const response = await apiClient.get('ministers');
    return response.data.ministers || [];
  } catch {
    return [];
  }
};

export const getArchivePictures = async () => {
  try {
    const response = await apiClient.get('archivePictures');
    return response.data.archivePictures || [];
  } catch {
    return [];
  }
};

export const getArchiveVideos = async () => {
  try {
    const response = await apiClient.get('archiveVideos');
    return response.data.archiveVideos || [];
  } catch {
    return [];
  }
};

// === LIVE STREAMS ===
export const getActiveLiveStreams = async () => {
  try {
    const response = await apiClient.get('liveStreams/active');
    return response.data.liveStreams || [];
  } catch {
    return [];
  }
};

export const getLiveStreams = async () => {
  try {
    const response = await apiClient.get('liveStreams');
    return response.data.liveStreams || [];
  } catch {
    return [];
  }
};

export const createLiveStream = (data) => apiClient.post('liveStreams', data);
export const updateLiveStream = (id, data) =>
  apiClient.put('liveStreams', id, data);
export const deleteLiveStream = (id) => apiClient.delete('liveStreams', id);

// === QUIZ ===
export const getQuizResources = async () => {
  try {
    const response = await apiClient.get('quizResources');
    return response.data.quizResources || [];
  } catch {
    return [];
  }
};

export const getQuiz = async (id) => {
  try {
    const response = await apiClient.get(`quizResources/${id}`);
    return response.data;
  } catch {
    return null;
  }
};

export const addQuizResource = (data) => apiClient.post('quizResources', data);
export const addQuizHelpQuestion = (data) =>
  apiClient.post('quizHelpQuestions', data);

export const subscribeToQuizHelpQuestions = (callback) => {
  const fetch = async () => {
    try {
      const response = await apiClient.get('quizHelpQuestions');
      callback(response.data.quizHelpQuestions || []);
    } catch {
      callback([]);
    }
  };
  fetch();
  const interval = setInterval(fetch, 10000);
  return () => clearInterval(interval);
};

// === CONTACT ===
export const addContactMessage = (data) =>
  apiClient.post('contactMessages', data);

export const subscribeToContactMessages = (callback) => {
  const fetch = async () => {
    try {
      const response = await apiClient.get('contactMessages');
      callback(response.data.contactMessages || []);
    } catch {
      callback([]);
    }
  };
  fetch();
  const interval = setInterval(fetch, 10000);
  return () => clearInterval(interval);
};

// === SEARCH ===
export const searchContent = async (term, category = null) => {
  return searchContentPaginated(term, category, 20);
};

export const searchContentPaginated = async (
  term,
  category = null,
  limit = 20,
  after = null
) => {
  try {
    const [sermons, songs, videos, sermonVideos, devotionals] =
      await Promise.all([
        getSermonsPaginated(100),
        getSongsPaginated(100),
        getVideosPaginated(100),
        getSermonVideosPaginated(100),
        getDailyDevotionalsPaginated(100),
      ]);

    const lowerTerm = term.toLowerCase();
    const filter = (list) =>
      list.filter(
        (item) =>
          (item.title && item.title.toLowerCase().includes(lowerTerm)) ||
          (item.content && item.content.toLowerCase().includes(lowerTerm))
      );

    return {
      sermons: filter(sermons.sermons),
      songs: filter(songs.songs),
      videos: filter(videos.videos),
      sermonVideos: filter(sermonVideos.sermonVideos),
      dailyDevotionals: filter(devotionals.dailyDevotionals),
      pagination: { hasMore: false },
    };
  } catch {
    return {};
  }
};

// === UTILS ===
export const getYouTubeVideoId = (url) => {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
};

// === METADATA WRITES ===
export const uploadMinister = (data) => apiClient.post('ministers', data);
export const uploadGalleryPicture = (data) =>
  apiClient.post('galleryPictures', data);
export const uploadGalleryVideo = (data) =>
  apiClient.post('galleryVideos', data);
export const uploadArchivePicture = (data) =>
  apiClient.post('archivePictures', data);
export const uploadArchiveVideo = (data) =>
  apiClient.post('archiveVideos', data);

// === DELETES ===
export const deleteGalleryPicture = (id) =>
  apiClient.delete('galleryPictures', id);
export const deleteGalleryVideo = (id) => apiClient.delete('galleryVideos', id);
export const deleteArchivePicture = (id) =>
  apiClient.delete('archivePictures', id);
export const deleteArchiveVideo = (id) => apiClient.delete('archiveVideos', id);
export const deleteMinister = (id) => apiClient.delete('ministers', id);

// Generic Exports for Admin Content Manager
export const post = (path, data) => apiClient.post(path, data);
export const put = (path, id, data) => apiClient.put(path, id, data);
export const del = (path, id) => apiClient.delete(path, id);
