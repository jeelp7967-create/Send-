import React, { useState } from 'react';
import { ShoppingBag, Search, Tag, Sparkles } from 'lucide-react';
import { Post } from '../types.ts';
import { PostCard } from './PostCard.tsx';

interface ProductPageProps {
  posts: Post[];
  savedPostIds: string[];
  onToggleSave: (postId: string) => void;
  onOpenDetails: (post: Post) => void;
  onOpenQR: (post: Post) => void;
  onOpenCreate: () => void;
}

export const ProductPage: React.FC<ProductPageProps> = ({
  posts,
  savedPostIds,
  onToggleSave,
  onOpenDetails,
  onOpenQR,
  onOpenCreate,
}) => {
  const [productSearch, setProductSearch] = useState('');

  // Filter only Product category posts
  const productPosts = posts.filter((p) => p.category.toLowerCase() === 'product');

  const filtered = productPosts.filter((p) => {
    if (!productSearch.trim()) return true;
    const q = productSearch.toLowerCase();
    return (
      p.title.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      (p.location_name && p.location_name.toLowerCase().includes(q)) ||
      (p.price && p.price.toLowerCase().includes(q))
    );
  });

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-4 pb-24">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-5">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#5B8F2B] uppercase tracking-wider">
            <ShoppingBag className="w-4 h-4" />
            <span>Product Showcase</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#171717] tracking-tight mt-1">
            Products & Hardware
          </h2>
          <p className="text-xs text-[#737373] mt-1">
            Physical merchandise, tech gear, and artisan goods tagged with SENND QR stickers.
          </p>
        </div>

        <button
          onClick={onOpenCreate}
          className="self-start sm:self-auto px-3.5 py-2 rounded-xl bg-[#171717] hover:bg-[#333333] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95 transition-all"
        >
          <Tag className="w-3.5 h-3.5 text-[#B8F36B]" />
          <span>Add Product QR</span>
        </button>
      </div>

      {/* Product Search Bar */}
      <div className="relative mb-5">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#737373]" />
        <input
          type="text"
          value={productSearch}
          onChange={(e) => setProductSearch(e.target.value)}
          placeholder="Filter by product name, price, city..."
          className="w-full h-11 pl-10 pr-4 text-sm bg-white border border-[#DDDDDD] rounded-xl text-[#171717] placeholder:text-[#999999] focus:outline-hidden focus:border-[#171717] transition-all shadow-xs"
        />
      </div>

      {/* Product Cards Grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              isSaved={savedPostIds.includes(post.id)}
              onToggleSave={onToggleSave}
              onOpenDetails={onOpenDetails}
              onOpenQR={onOpenQR}
            />
          ))}
        </div>
      ) : (
        <div className="p-12 border border-dashed border-[#DDDDDD] rounded-2xl text-center text-[#737373] bg-[#FAFAFA]">
          <ShoppingBag className="w-10 h-10 mx-auto text-[#CCCCCC] mb-3" />
          <h3 className="font-bold text-sm text-[#171717]">No products matched your search</h3>
          <p className="text-xs text-[#737373] mt-1">
            Try searching for headphones, desk setups, or artisan items.
          </p>
          <button
            onClick={() => setProductSearch('')}
            className="mt-3 px-3.5 py-1.5 rounded-lg border border-[#DDDDDD] bg-white text-xs font-semibold text-[#171717] hover:bg-[#F5F5F5] cursor-pointer"
          >
            Clear Filter
          </button>
        </div>
      )}
    </div>
  );
};
