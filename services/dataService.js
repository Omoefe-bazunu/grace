import apiClient from '../utils/api';

// === SERMONS ===
/**
 * Fetches sermons for the public list.
 * Includes sort parameters to ensure newest sermons appear first.
 */
export const getSermonsPaginated = async (limit = 15, after = null) => {
  try {
    const params = { limit, sort: 'createdAt', order: 'desc' };
    if (after) params.after = after;
    const response = await apiClient.get('sermons', params); // Safety check: handle both { sermons: [] } and raw [ ] responses

    const sermons =
      response.data.sermons ||
      (Array.isArray(response.data) ? response.data : []);

    return {
      sermons,
      hasMore: response.data.pagination?.hasMore || false,
      nextCursor: response.data.pagination?.nextCursor || null,
    };
  } catch (err) {
    console.error('Sermon fetch error:', err);
    return { sermons: [], hasMore: false };
  }
};

/**
 * Fetches sermons filtered by category.
 * Used by the TextSermonsScreen to populate the categorized lists.
 */
export const getSermonsByCategoryPaginated = async (
  category,
  limit = 10,
  after = null,
) => {
  try {
    const params = { category, limit, sort: 'createdAt', order: 'desc' };
    if (after) params.after = after;
    const response = await apiClient.get('sermons', params);

    const sermons =
      response.data.sermons ||
      (Array.isArray(response.data) ? response.data : []);

    return {
      sermons,
      hasMore: response.data.pagination?.hasMore || false,
      nextCursor: response.data.pagination?.nextCursor || null,
    };
  } catch (err) {
    console.error(`Error fetching category ${category}:`, err);
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

// === QUIZ RESOURCES ===

/**
 * Fetches all study resources.
 * Hits: GET /api/quiz/resources
 */
export const getQuizResources = async () => {
  try {
    const response = await apiClient.get('quiz/resources');
    return response.data.quizResources || [];
  } catch (err) {
    console.error('Error fetching quiz resources:', err);
    return [];
  }
};

/**
 * Adds a new study resource (Admin only).
 * Hits: POST /api/quiz/resources
 */
export const addQuizResource = async (resourceData) => {
  try {
    // Note: The backend controller automatically sets uploadedBy and createdAt
    const response = await apiClient.post('quiz/resources', resourceData);
    return response.data;
  } catch (err) {
    console.error('Error adding quiz resource:', err);
    throw err;
  }
};

// === QUIZ HELP QUESTIONS ===

/**
 * Students submit a help question.
 * Hits: POST /api/quiz/help
 */
export const addQuizHelpQuestion = async (questionData) => {
  try {
    const response = await apiClient.post('quiz/help', questionData);
    return response.data;
  } catch (err) {
    console.error('Error submitting help question:', err);
    throw err;
  }
};

/**
 * Admins fetch all student inquiries.
 * Hits: GET /api/quiz/help
 */
export const getQuizHelpQuestions = async () => {
  try {
    const response = await apiClient.get('quiz/help');
    return response.data.quizHelpQuestions || [];
  } catch (err) {
    console.error('Error fetching help questions:', err);
    return [];
  }
};

/**
 * Updates the status of a help question (Admin only).
 * Hits: PUT /api/quiz/help/:id
 */
export const updateQuizHelpStatus = async (id, status) => {
  try {
    const response = await apiClient.put(`quiz/help/${id}`, { status });
    return response.data;
  } catch (err) {
    console.error('Error updating status:', err);
    throw err;
  }
};

/**
 * Fetches a single quiz resource.
 */
export const getQuizResource = async (id) => {
  try {
    const response = await apiClient.get(`quiz/resources/${id}`);
    return response.data;
  } catch (err) {
    console.error('Error fetching quiz detail:', err);
    return null;
  }
};

/**
 * Generic search function for specific collections.
 * Handles the call: searchContent(query, 'quizResources')
 */
export const searchContent = async (term, collection) => {
  try {
    // We hit the list endpoint and filter locally for a responsive feel,
    // or you can update the backend to handle a ?search= query param.
    const response = await apiClient.get(`quiz/resources`);
    const allResources = response.data.quizResources || [];

    const lowerTerm = term.toLowerCase();
    const filtered = allResources.filter(
      (item) =>
        item.title?.toLowerCase().includes(lowerTerm) ||
        item.content?.toLowerCase().includes(lowerTerm) ||
        item.year?.toString().includes(lowerTerm),
    );

    return { [collection]: filtered };
  } catch (err) {
    console.error('Search error:', err);
    return { [collection]: [] };
  }
};

// === SEARCH ===
/**
 * Consolidated search that queries multiple collections simultaneously.
 */
export const searchContentPaginated = async (term) => {
  try {
    const [sermonRes, songRes, devotionalRes] = await Promise.all([
      getSermonsPaginated(50),
      getSongsPaginated(50),
      getDailyDevotionalsPaginated(50),
    ]);

    const lowerTerm = term.toLowerCase();
    const filter = (list) =>
      list.filter(
        (item) =>
          (item.title && item.title.toLowerCase().includes(lowerTerm)) ||
          (item.content && item.content.toLowerCase().includes(lowerTerm)),
      );

    return {
      sermons: filter(sermonRes.sermons),
      songs: filter(songRes.songs || []),
      dailyDevotionals: filter(devotionalRes.dailyDevotionals || []),
      pagination: { hasMore: false },
    };
  } catch (err) {
    console.error('Search failure:', err);
    return { sermons: [], songs: [], dailyDevotionals: [] };
  }
};

// === SERMON VIDEOS ===
export const getSermonVideos = async () => {
  try {
    const response = await apiClient.get('sermon');
    return response.data.sermonVideos || [];
  } catch {
    return [];
  }
};

// === SERMON VIDEOS (Stored in 'sermons' collection) ===

/**
 * Fetches all sermons and filters for those containing a videoUrl.
 * Hits: /api/sermons
 */
export const getSermonVideosPaginated = async (limit = 12, after = null) => {
  try {
    const params = { limit, sort: 'createdAt', order: 'desc' };
    if (after) params.after = after;

    const response = await apiClient.get('sermons', params); // Filter items that actually have a videoUrl property

    const allItems =
      response.data.sermons ||
      (Array.isArray(response.data) ? response.data : []);
    const filteredVideos = allItems.filter((item) => item.videoUrl);

    return {
      sermonVideos: filteredVideos,
      hasMore: response.data.pagination?.hasMore || false,
      nextCursor: response.data.pagination?.nextCursor || null,
    };
  } catch (err) {
    console.error('Sermon Video Pagination Error:', err);
    return { sermonVideos: [], hasMore: false };
  }
};

/**
 * Fetches sermon videos by a specific category.
 * Hits: /api/sermons?category=...
 */
export const getSermonVideosByCategoryPaginated = async (
  category,
  limit = 10,
  after = null,
) => {
  try {
    const params = { category, limit, sort: 'createdAt', order: 'desc' };
    if (after) params.after = after;

    const response = await apiClient.get('sermons', params);

    const allItems =
      response.data.sermons ||
      (Array.isArray(response.data) ? response.data : []);
    const filteredVideos = allItems.filter((item) => item.videoUrl);

    return {
      sermonVideos: filteredVideos,
      hasMore: response.data.pagination?.hasMore || false,
      nextCursor: response.data.pagination?.nextCursor || null,
    };
  } catch (err) {
    console.error(`Error fetching sermon video category ${category}:`, err);
    return { sermonVideos: [], hasMore: false };
  }
};

/**
 * Fetches a single sermon video by ID.
 * Hits: /api/sermons/:id
 */
export const getSermonVideo = async (id) => {
  try {
    // We target the 'sermons' endpoint because sermonVideos are mapped there in UploadScreen
    const response = await apiClient.get(`sermons/${id}`); // Safety check: Ensure the returned item actually has a video

    if (response.data && response.data.videoUrl) {
      return response.data;
    }

    console.warn(`Sermon ${id} found but contains no videoUrl`);
    return null;
  } catch (err) {
    if (err.response?.status === 404) {
      console.warn(`Sermon video ID ${id} not found on server.`);
    } else {
      console.error('Error fetching sermon video:', err);
    }
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

export const getSong = async (id) => {
  try {
    const response = await apiClient.get(`songs/${id}`);
    return response.data;
  } catch {
    return null;
  }
};

// === DAILY DEVOTIONALS ===
/**
 * Fetches devotionals with descending date sorting.
 * Endpoint changed from 'dailyDevotionals' to 'devotionals' to match backend.
 */
export const getDailyDevotionalsPaginated = async (
  limit = 10,
  after = null,
) => {
  try {
    const params = { limit, sort: 'date', order: 'desc' };
    if (after) params.after = after;
    const response = await apiClient.get('devotionals', params);

    return {
      dailyDevotionals: response.data.dailyDevotionals || response.data || [],
      hasMore: response.data.pagination?.hasMore || false,
      nextCursor: response.data.pagination?.nextCursor || null,
    };
  } catch (err) {
    console.error('Devotional fetch error:', err);
    return { dailyDevotionals: [], hasMore: false };
  }
};

/**
 * Optimized: Uses the dedicated backend route /api/devotionals/date/:date
 */
export const getDailyDevotionalByDate = async (date) => {
  try {
    const response = await apiClient.get(`devotionals/date/${date}`);
    return response.data;
  } catch (err) {
    console.error(`Error fetching devotional for ${date}:`, err);
    return null;
  }
};

/**
 * Fetches a single devotional by its Firestore ID.
 */
export const getDevotional = async (id) => {
  try {
    const response = await apiClient.get(`devotionals/${id}`);
    return response.data;
  } catch {
    return null;
  }
};

// ANIMATION VIDEOS

/**
 * Fetches animation videos from the backend.
 * Aligned with the 'animations' endpoint in the modular backend.
 */
export const getVideosPaginated = async (limit = 12, after = null) => {
  try {
    const params = { limit, sort: 'createdAt', order: 'desc' };
    if (after) params.after = after; // Using 'animations' endpoint as defined in backend mapping

    const response = await apiClient.get('animations', params); // Handle both wrapped object and raw array responses

    const videos =
      response.data.animations ||
      (Array.isArray(response.data) ? response.data : []);

    return {
      videos,
      hasMore: response.data.pagination?.hasMore || false,
      nextCursor: response.data.pagination?.nextCursor || null,
    };
  } catch (err) {
    console.error('Animation fetch error:', err);
    return { videos: [], hasMore: false };
  }
};

/**
 * Fetches a single animation video by its ID.
 */
export const getVideo = async (id) => {
  try {
    const response = await apiClient.get(`animations/${id}`);
    return response.data;
  } catch (err) {
    console.error('Error fetching single video:', err);
    return null;
  }
};

// === DEDICATED ARCHIVE HELPERS ===

/**
 * Hits: GET /api/archive/pictures
 */
export const getArchivePictures = async () => {
  try {
    const response = await apiClient.get('archive/pictures'); // apiClient adds 'api/' prefix
    return response.data.archivePictures || [];
  } catch (err) {
    console.error('Error fetching archive pictures:', err);
    return [];
  }
};

/**
 * Hits: GET /api/archive/videos
 */
export const getArchiveVideos = async () => {
  try {
    const response = await apiClient.get('archive/videos');
    return response.data.archiveVideos || [];
  } catch (err) {
    console.error('Error fetching archive videos:', err);
    return [];
  }
};

/**
 * Hits: POST /api/archive/upload
 * The type parameter ('picture' or 'video') tells the controller which collection to use.
 */
export const addArchiveMedia = async (type, data) => {
  try {
    const response = await apiClient.post('archive/upload', { ...data, type });
    return response.data;
  } catch (err) {
    console.error(`Error uploading ${type} to archive:`, err);
    throw err;
  }
};

/**
 * Hits: PUT /api/archive/:collection/:id [cite: 560]
 */
export const updateArchiveEntry = async (collection, id, data) => {
  try {
    const response = await apiClient.put(`archive/${collection}`, id, data);
    return response.data;
  } catch (err) {
    console.error(`Error updating ${collection}:`, err);
    throw err;
  }
};

/**
 * Hits: DELETE /api/archive/:collection/:id [cite: 561]
 */
export const deleteArchiveEntry = async (collection, id) => {
  try {
    const response = await apiClient.delete(`archive/${collection}`, id);
    return response.data;
  } catch (err) {
    console.error(`Error deleting from ${collection}:`, err);
    throw err;
  }
};

// === DEDICATED GALLERY HELPERS ===

export const getGalleryPictures = async () => {
  const response = await apiClient.get('gallery/pictures');
  return response.data.galleryPictures || [];
};

export const getGalleryVideos = async () => {
  const response = await apiClient.get('gallery/videos');
  return response.data.galleryVideos || [];
};

export const getGalleryMinisters = async () => {
  const response = await apiClient.get('gallery/ministers');
  return response.data.galleryMinisters || [];
};

export const getMinisters = async () => {
  try {
    // Note: ensure this path matches your backend mount point (e.g., 'gallery/ministers')
    const response = await apiClient.get('gallery/ministers'); // The controller fetchGallery("galleryMinisters") returns an object
    // with the key "galleryMinisters"

    return response.data.galleryMinisters || [];
  } catch (err) {
    console.error('Error in getMinisters service:', err);
    return [];
  }
};

export const addGalleryMedia = async (type, data) => {
  // Hits POST /api/gallery/upload
  return await apiClient.post('gallery/upload', { ...data, type });
};

export const updateGalleryEntry = async (collection, id, data) => {
  return await apiClient.put(`gallery/${collection}`, id, data);
};

export const deleteGalleryEntry = async (collection, id) => {
  return await apiClient.delete(`gallery/${collection}`, id);
};

/**
 * === LIVE STREAM HELPERS ===
 * Target Backend: /api/livestreams (ensure this matches your app.js mount point)
 */

/**
 * GET all streams for management (Admin view)
 * Returns the array of streams directly for the component state
 */
export const getLiveStreams = async () => {
  try {
    const response = await apiClient.get('livestreams');
    return response.data.liveStreams || [];
  } catch (error) {
    console.error('DataService getLiveStreams error:', error);
    throw error;
  }
};

/**
 * GET only active streams (Public/Home view)
 */
export const getActiveLiveStreams = async () => {
  try {
    const response = await apiClient.get('livestreams/active');
    return response.data.liveStreams || [];
  } catch (error) {
    console.error('DataService getActiveLiveStreams error:', error);
    throw error;
  }
};

/**
 * POST create a new stream
 */
export const createLiveStream = async (streamData) => {
  try {
    const response = await apiClient.post('livestreams', streamData);
    return response.data;
  } catch (error) {
    console.error('DataService createLiveStream error:', error);
    throw error;
  }
};

/**
 * PUT update an existing stream
 * FIXED: Removed duplicate id parameter
 */
export const updateLiveStream = async (id, streamData) => {
  try {
    // The apiClient.put handles the path construction internally
    // Just pass the full path as first parameter, and data as second
    const response = await apiClient.put(`livestreams/${id}`, streamData);
    return response.data;
  } catch (error) {
    console.error('DataService updateLiveStream error:', error);
    throw error;
  }
};

/**
 * DELETE a stream
 * FIXED: Removed duplicate id parameter
 */
export const deleteLiveStream = async (id) => {
  try {
    // The apiClient.delete handles the path construction internally
    // Just pass the full path as first parameter
    const response = await apiClient.delete(`livestreams/${id}`);
    return response.data;
  } catch (error) {
    console.error('DataService deleteLiveStream error:', error);
    throw error;
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
  const interval = setInterval(fetch, 30000);
  return () => clearInterval(interval);
};

// === CONTENT MANAGER HELPERS ===

export const updateContentEntry = async (collection, id, data) => {
  // collection will be 'sermons', 'songs', 'videos', etc.
  return await apiClient.put(`${collection}/${id}`, id, data);
};

export const deleteContentEntry = async (collection, id) => {
  return await apiClient.delete(`${collection}/${id}`, id);
};

/**
 * Submits a contact message to the backend.
 * Backend route: /api/contact
 */
export const addContactMessage = async (messageData) => {
  try {
    // Note: We use 'contact' to match app.use("/api/contact", ...) in app.js
    const response = await apiClient.post('contact', messageData);
    return response.data;
  } catch (err) {
    console.error('Error submitting contact form:', err);
    throw err;
  }
};
/**
 * Fetches all contact messages for the Admin panel.
 * Backend route: GET /api/contact
 */
export const getContactMessages = async (limit = 20, after = null) => {
  try {
    const params = { limit };
    if (after) params.after = after;

    const response = await apiClient.get('contact', params);

    return {
      contactMessages: response.data.contactMessages || [],
      hasMore: response.data.pagination?.hasMore || false,
      nextCursor: response.data.pagination?.nextCursor || null,
    };
  } catch (err) {
    console.error('Error fetching contact messages:', err);
    return { contactMessages: [], hasMore: false };
  }
};

/**
 * Periodically polls for new contact messages.
 */
export const subscribeToContactMessages = (callback) => {
  const fetchMessages = async () => {
    try {
      const result = await getContactMessages(50);
      callback(result.contactMessages);
    } catch (err) {
      callback([]);
    }
  };

  fetchMessages(); // Initial fetch
  const interval = setInterval(fetchMessages, 15000); // Poll every 15 seconds
  return () => clearInterval(interval);
};

// === UTILS ===
export const getYouTubeVideoId = (url) => {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
};

// Regular Helpers
export const post = (path, data) => apiClient.post(path, data);
export const put = (path, id, data) => apiClient.put(path, id, data);
export const del = (path, id) => apiClient.delete(path, id);
