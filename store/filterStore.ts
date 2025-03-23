import { create } from 'zustand';

import type { ForumPost } from '~/lib/types';

type SortOption = 'trending' | 'latest' | 'top';
type SortOrder = 'asc' | 'desc';

export const TRENDING_WEIGHTS = {
  likes: 1,
  comments: 0.8,
  readTime: 0.5,
  recency: 2,
};

interface FilterState {
  sortBy: SortOption;
  sortOrder: SortOrder;
  selectedTags: string[];
  isLoading: boolean;
  setSortBy: (sort: SortOption) => void;
  setSortOrder: (order: SortOrder) => void;
  setSelectedTags: (tags: string[]) => void;
  setIsLoading: (loading: boolean) => void;
  clearFilters: () => void;
  getTrendingScore: (post: ForumPost) => number;
  calculateReadTime: (content: string) => number;
}

export const useFilterStore = create<FilterState>((set) => ({
  sortBy: 'trending',
  sortOrder: 'desc',
  selectedTags: [],
  isLoading: false,
  setSortBy: (sortBy) => set({ sortBy }),
  setSortOrder: (sortOrder) => set({ sortOrder }),
  setSelectedTags: (selectedTags) => set({ selectedTags }),
  setIsLoading: (isLoading) => set({ isLoading }),
  clearFilters: () => set({ sortBy: 'trending', sortOrder: 'desc', selectedTags: [] }),
  calculateReadTime: (content: string): number => {
    if (!content) return 0;
    const words = content.trim().split(/\s+/).length;
    return Math.ceil(words / 200); // minutes to read
  },
  getTrendingScore: (post: ForumPost): number => {
    const hoursAgo = (Date.now() - new Date(post.created_at).getTime()) / (1000 * 60 * 60);
    const recencyFactor = Math.exp(-hoursAgo / 24); // Decay over 24 hours
    const store = useFilterStore.getState();
    const readTimeValue = post.content ? store.calculateReadTime(post.content) : 0;

    return (
      (post.likes?.length || 0) * TRENDING_WEIGHTS.likes +
      readTimeValue * TRENDING_WEIGHTS.readTime +
      recencyFactor * TRENDING_WEIGHTS.recency
    );
  },
}));
