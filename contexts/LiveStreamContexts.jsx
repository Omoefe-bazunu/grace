import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
} from 'react';
import { AppState } from 'react-native';
import {
  getActiveLiveStreams,
  getLiveStreamComments,
  addLiveStreamComment,
  getLiveStreamReactions,
  toggleLiveStreamReaction,
  getLiveStreamLog,
  getLiveStreamDetails,
} from '../services/dataService';
import { getAnonymousUserId } from '../utils/anonymousUser';

const POLL_INTERVAL_MS = 5 * 60 * 1000; // stream status: every 5 min
const COMMENT_POLL_MS = 10_000; // comments: every 10s when live
const REACTION_POLL_MS = 15_000; // reactions: every 15s when live

const LiveStreamContext = createContext(null);

export function LiveStreamProvider({ children }) {
  const [liveStream, setLiveStream] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);

  // Active stream engagement
  const [comments, setComments] = useState([]);
  const [reactions, setReactions] = useState({});
  const [myReactions, setMyReactions] = useState({});

  // Stream log
  const [streamLog, setStreamLog] = useState([]);
  const [logLoading, setLogLoading] = useState(false);
  const [logHasMore, setLogHasMore] = useState(true);
  const [logCursor, setLogCursor] = useState(null);

  const commentPollRef = useRef(null);
  const reactionPollRef = useRef(null);
  const appStateRef = useRef(AppState.currentState);

  // Load anonymous user ID once
  useEffect(() => {
    getAnonymousUserId().then(setUserId);
  }, []);

  // Fetch active stream
  const fetchLiveStream = async () => {
    try {
      const streams = await getActiveLiveStreams();
      setLiveStream(streams[0] || null);
    } catch (err) {
      console.error('Live fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch comments for active stream
  const fetchComments = async (streamId) => {
    try {
      const data = await getLiveStreamComments(streamId);
      setComments(data);
    } catch (err) {
      console.error('Comments fetch error:', err);
    }
  };

  // Fetch reactions for active stream
  const fetchReactions = async (streamId) => {
    try {
      const data = await getLiveStreamReactions(streamId);
      setReactions(data);
    } catch (err) {
      console.error('Reactions fetch error:', err);
    }
  };

  // Start/stop polling when active stream changes
  useEffect(() => {
    // Clear existing polls
    if (commentPollRef.current) clearInterval(commentPollRef.current);
    if (reactionPollRef.current) clearInterval(reactionPollRef.current);
    setComments([]);
    setReactions({});
    setMyReactions({});

    if (!liveStream?.id) return;

    // Fetch immediately
    fetchComments(liveStream.id);
    fetchReactions(liveStream.id);

    // Poll only when stream is active
    if (liveStream.isActive) {
      commentPollRef.current = setInterval(
        () => fetchComments(liveStream.id),
        COMMENT_POLL_MS,
      );
      reactionPollRef.current = setInterval(
        () => fetchReactions(liveStream.id),
        REACTION_POLL_MS,
      );
    }

    return () => {
      if (commentPollRef.current) clearInterval(commentPollRef.current);
      if (reactionPollRef.current) clearInterval(reactionPollRef.current);
    };
  }, [liveStream?.id, liveStream?.isActive]);

  // Whether comments are open
  const canComment = (stream) => {
    if (!stream) return false;
    if (stream.isActive) return true;
    const updatedAt = new Date(stream.updatedAt);
    const hoursElapsed = (Date.now() - updatedAt.getTime()) / (1000 * 60 * 60);
    return hoursElapsed < 24;
  };

  // Post comment
  const postComment = async (streamId, text) => {
    const uid = userId || (await getAnonymousUserId());
    await addLiveStreamComment(streamId, text, uid);
    // Refresh immediately after posting
    await fetchComments(streamId);
  };

  // Toggle reaction — optimistic update + server sync
  const toggleReaction = async (streamId, emoji) => {
    const uid = userId || (await getAnonymousUserId());
    const isCurrentlyActive = myReactions[emoji] === true;

    // Optimistic update
    setMyReactions((prev) => ({ ...prev, [emoji]: !isCurrentlyActive }));
    setReactions((prev) => ({
      ...prev,
      [emoji]: Math.max(0, (prev[emoji] || 0) + (isCurrentlyActive ? -1 : 1)),
    }));

    try {
      await toggleLiveStreamReaction(streamId, emoji, uid);
      // Sync actual server counts after toggle
      await fetchReactions(streamId);
    } catch (err) {
      // Revert optimistic update on failure
      setMyReactions((prev) => ({ ...prev, [emoji]: isCurrentlyActive }));
      setReactions((prev) => ({
        ...prev,
        [emoji]: Math.max(0, (prev[emoji] || 0) + (isCurrentlyActive ? 1 : -1)),
      }));
      console.error('Reaction toggle failed:', err);
    }
  };

  // Stream log (paginated)
  const fetchStreamLog = async (reset = false) => {
    if (logLoading) return;
    if (!reset && !logHasMore) return;

    setLogLoading(true);
    try {
      const cursor = reset ? null : logCursor;
      const result = await getLiveStreamLog(10, cursor);
      setStreamLog((prev) =>
        reset ? result.streams : [...prev, ...result.streams],
      );
      setLogCursor(result.nextCursor);
      setLogHasMore(result.hasMore);
    } catch (err) {
      console.error('Stream log error:', err);
    } finally {
      setLogLoading(false);
    }
  };

  // Lazy-load details for a past stream
  const fetchLogStreamDetails = async (streamId) => {
    return await getLiveStreamDetails(streamId);
  };

  // Initial load + polling
  useEffect(() => {
    fetchLiveStream();
    fetchStreamLog(true);

    const interval = setInterval(fetchLiveStream, POLL_INTERVAL_MS);

    const appStateSub = AppState.addEventListener('change', (nextState) => {
      if (
        appStateRef.current.match(/inactive|background/) &&
        nextState === 'active'
      ) {
        fetchLiveStream();
        if (liveStream?.id) {
          fetchComments(liveStream.id);
          fetchReactions(liveStream.id);
        }
      }
      appStateRef.current = nextState;
    });

    return () => {
      clearInterval(interval);
      appStateSub.remove();
    };
  }, []);

  return (
    <LiveStreamContext.Provider
      value={{
        liveStream,
        loading,
        fetchLiveStream,
        comments,
        reactions,
        myReactions,
        canComment,
        postComment,
        toggleReaction,
        streamLog,
        logLoading,
        logHasMore,
        fetchStreamLog,
        fetchLogStreamDetails,
      }}
    >
      {children}
    </LiveStreamContext.Provider>
  );
}

export const useLiveStream = () => useContext(LiveStreamContext);

// WORKING VERSION BEFORE COMMENTS AND REACTIONS WERE ADDED
// import React, { createContext, useContext, useEffect, useState } from 'react';
// import { AppState } from 'react-native';
// import { API_BASE_URL } from '../utils/api';

// // ✅ No YouTube API key on the frontend at all — backend handles it
// const POLL_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes, matches backend poller

// const LiveStreamContext = createContext(null);

// export function LiveStreamProvider({ children }) {
//   const [liveStream, setLiveStream] = useState(null);
//   const [loading, setLoading] = useState(true);

//   const fetchLiveStream = async () => {
//     try {
//       // ✅ Hits your own backend — serves from in-memory cache, costs zero YouTube quota
//       const response = await fetch(`${API_BASE_URL}/api/liveStreams/active`);
//       const data = await response.json();

//       const stream = data.liveStreams?.[0] || null;
//       setLiveStream(stream);
//     } catch (err) {
//       console.error('Live fetch error:', err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchLiveStream();

//     // ✅ Poll every 5 min — backend already checked YouTube, so this is just a cache read
//     const interval = setInterval(fetchLiveStream, POLL_INTERVAL_MS);

//     // ✅ Re-check immediately when user brings the app to the foreground
//     const appStateSub = AppState.addEventListener('change', (nextState) => {
//       if (nextState === 'active') {
//         fetchLiveStream();
//       }
//     });

//     return () => {
//       clearInterval(interval);
//       appStateSub.remove();
//     };
//   }, []);

//   return (
//     <LiveStreamContext.Provider
//       value={{ liveStream, loading, fetchLiveStream }}
//     >
//       {children}
//     </LiveStreamContext.Provider>
//   );
// }

// export const useLiveStream = () => useContext(LiveStreamContext);
