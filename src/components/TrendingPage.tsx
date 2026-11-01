import React, { useState } from 'react';
import { Flame, QrCode, Sparkles, TrendingUp, Clock } from 'lucide-react';
import { Post, CategoryType } from '../types.ts';
import { PostCard } from './PostCard.tsx';
import { CategoryFilters } from './CategoryFilters.tsx';

interface TrendingPageProps {
  posts: Post[];
  savedPostIds: string[];
  onToggleSave: (postId: string) => void;
  onOpenDetails: (post: Post) => void;
  onOpenQR: (post: Post) => void;
}

export const TrendingPage: React.FC<TrendingPageProps> = ({
  posts,
  savedPostIds,
  onToggleSave,
  onOpenDetails,
  onOpenQR,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>('All');
  const [sortBy, setSortBy] = useState<'trending' | 'scans' | 'recent'>('trending');

  // Filter posts
  const filtered = posts.filter((p) => {
    if (selectedCategory === 'All') return true;
    return p.category.toLowerCase() === selectedCategory.toLowerCase();
  });

  // Sort posts
  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'scans') {
      return b.scans - a.scans;
    }
    if (sortBy === 'recent') {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
    // Trending score = scans * 3 + saves * 2 + views
    const scoreA = a.scans * 3 + a.saves_count * 2 + a.views;
    const scoreB = b.scans * 3 + b.saves_count * 2 + b.views;
    return scoreB - scoreA;
  });

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-4 pb-24">
      {/* Header */}
      <div className="mb-5">
        <div className="flex items-center gap-2 text-xs font-bold text-[#FF8C42] tracking-wider uppercase">
          <Flame className="w-4 h-4 fill-[#FF8C42]" />
          <span>Real-time Discovery</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#171717] tracking-tight mt-1">
          Trending <span className="text-[#5B8F2B]">QR Codes</span>
        </h2>
        <p className="text-xs text-[#737373] mt-1">
          Ranked by verified scan frequency, community saves, and engagement.
        </p>
      </div>

      {/* Sort Buttons Bar */}
      <div className="flex items-center justify-between gap-2 pb-3 mb-3 border-b border-[#EEEEEE] overflow-x-auto">
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => setSortBy('trending')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              sortBy === 'trending'
                ? 'bg-[#171717] text-white'
                : 'bg-[#F5F5F5] text-[#555555] hover:bg-[#EAEAEA]'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Top Trending</span>
          </button>

          <button
            onClick={() => setSortBy('scans')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              sortBy === 'scans'
                ? 'bg-[#171717] text-white'
                : 'bg-[#F5F5F5] text-[#555555] hover:bg-[#EAEAEA]'
            }`}
          >
            <QrCode className="w-3.5 h-3.5 text-[#B8F36B]" />
            <span>Most Scanned</span>
          </button>

          <button
            onClick={() => setSortBy('recent')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              sortBy === 'recent'
                ? 'bg-[#171717] text-white'
                : 'bg-[#F5F5F5] text-[#555555] hover:bg-[#EAEAEA]'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Newest</span>
          </button>
        </div>

        <span className="text-[11px] text-[#737373] shrink-0 font-medium">
          {sorted.length} active codes
        </span>
      </div>

      {/* Categories */}
      <CategoryFilters
        currentFilter={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />

      {/* Posts Grid */}
      {sorted.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sorted.map((post, idx) => (
            <div key={post.id} className="relative">
              {/* Rank Badge */}
              <div className="absolute top-2.5 right-2.5 z-10 w-7 h-7 rounded-full bg-[#171717] text-white text-xs font-black flex items-center justify-center shadow-md">
                #{idx + 1}
              </div>
              <PostCard
                post={post}
                isSaved={savedPostIds.includes(post.id)}
                onToggleSave={onToggleSave}
                onOpenDetails={onOpenDetails}
                onOpenQR={onOpenQR}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="p-10 border border-dashed border-[#DDDDDD] rounded-2xl text-center text-[#737373]">
          <p className="text-sm font-semibold">No trending posts in this category yet.</p>
          <p className="text-xs mt-1">Be the first to create and publish a scannable sticker!</p>
        </div>
      )}
    </div>
  );
};
