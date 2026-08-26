import { useCallback, useEffect, useRef } from 'react';

import type { StoryManager } from '../core/StoryManager';
import { generateId } from '../utils/generateId';
import { useFeedStore } from './useFeedStore';

const NATIVE_SUBSCRIBE_DELAY_MS = 10;

type UseFeedLoaderInput = {
  storyManager: StoryManager;
  feed: string;
  favoritesOnly: boolean;
  showFavorites: boolean;
};

export const useFeedLoader = ({
  storyManager,
  feed,
  favoritesOnly,
  showFavorites,
}: UseFeedLoaderInput) => {
  const uniqueId = useRef(generateId()).current;
  const clearUpdate = useFeedStore((state) => state.clearUpdate);

  const fetchFeed = useCallback(() => {
    storyManager.fetchFeed(feed, uniqueId);
  }, [storyManager, feed, uniqueId]);

  const fetchFavorites = useCallback(() => {
    storyManager.fetchFavorites(feed);
  }, [storyManager, feed]);

  useEffect(() => {
    const timer = setTimeout(() => {
      storyManager.createSubscriberList(feed, uniqueId);
      if (favoritesOnly) {
        fetchFavorites();
      } else {
        fetchFeed();
      }
    }, NATIVE_SUBSCRIBE_DELAY_MS);

    return () => clearTimeout(timer);
  }, [storyManager, feed, uniqueId, favoritesOnly, fetchFeed, fetchFavorites]);

  useEffect(() => {
    if (!showFavorites || favoritesOnly) return;

    const timer = setTimeout(fetchFavorites, NATIVE_SUBSCRIBE_DELAY_MS);
    return () => clearTimeout(timer);
  }, [showFavorites, favoritesOnly, fetchFavorites]);

  const reload = useCallback(() => {
    clearUpdate();
    fetchFeed();
  }, [clearUpdate, fetchFeed]);

  return { uniqueId, reload };
};
