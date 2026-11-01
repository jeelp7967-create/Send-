/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { ArrowUpRight, Sparkles, Filter, RefreshCw, Plus } from 'lucide-react';
import { Post, UserProfile, CategoryType, PageTab } from './types.ts';
import { api } from './utils/api.ts';
import { Header } from './components/Header.tsx';
import { ToolsGrid, ActiveTool } from './components/ToolsGrid.tsx';
import { SearchBar } from './components/SearchBar.tsx';
import { CategoryFilters } from './components/CategoryFilters.tsx';
import { PostCard } from './components/PostCard.tsx';
import { QRModal } from './components/QRModal.tsx';
import { PostDetailModal } from './components/PostDetailModal.tsx';
import { ScannerPage } from './components/ScannerPage.tsx';
import { CreatePostModal } from './components/CreatePostModal.tsx';
import { TrendingPage } from './components/TrendingPage.tsx';
import { ProductPage } from './components/ProductPage.tsx';
import { AccountPage } from './components/AccountPage.tsx';
import { BottomNav } from './components/BottomNav.tsx';

export default function App() {
  const [activeTab, setActiveTab] = useState<PageTab>('home');
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [savedPostIds, setSavedPostIds] = useState<string[]>([]);

  // Filtering & Search
  const [currentCategory, setCurrentCategory] = useState<CategoryType>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [activeTool, setActiveTool] = useState<ActiveTool>(null);
  const [searchMode, setSearchMode] = useState<'general' | 'location' | 'qr'>('general');

  // Modals
  const [selectedPostForQR, setSelectedPostForQR] = useState<Post | null>(null);
  const [selectedPostForDetails, setSelectedPostForDetails] = useState<Post | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Show a momentary toast
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Fetch initial posts and user profile
  const loadInitialData = useCallback(async () => {
    setLoading(true);
    try {
      const [fetchedPosts, profile] = await Promise.all([
        api.getPosts(),
        api.getUserProfile(),
      ]);
      setPosts(fetchedPosts);
      setUser(profile);
      setSavedPostIds(profile.saved_post_ids || []);
    } catch (err) {
      console.error('Failed to load initial data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  // Handle URL deep linking (e.g. #/p/sennd-post-1)
  useEffect(() => {
    const handleHashChange = async () => {
      const hash = window.location.hash;
      const match = hash.match(/#\/p\/([a-zA-Z0-9-]+)/);
      if (match && match[1]) {
        const postId = match[1];
        const post = await api.getPostById(postId);
        if (post) {
          setSelectedPostForDetails(post);
        }
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Handle 4 Home Tools selection
  const handleSelectTool = (tool: 'product' | 'search' | 'location' | 'qr-search') => {
    if (activeTool === tool) {
      setActiveTool(null);
      return;
    }
    setActiveTool(tool);

    if (tool === 'product') {
      setCurrentCategory('Product');
      setSearchMode('general');
    } else if (tool === 'search') {
      setSearchMode('general');
    } else if (tool === 'location') {
      setSearchMode('location');
    } else if (tool === 'qr-search') {
      setSearchMode('qr');
    }
  };

  // Toggle Save post
  const handleToggleSave = async (postId: string) => {
    const res = await api.toggleSave(postId);
    if (res.isSaved) {
      setSavedPostIds((prev) => [...prev, postId]);
      showToast('Saved to your collection');
    } else {
      setSavedPostIds((prev) => prev.filter((id) => id !== postId));
      showToast('Removed from collection');
    }
    // Update local post saves_count
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId ? { ...p, saves_count: res.savesCount } : p
      )
    );
  };

  // Post Created callback
  const handlePostCreated = (newPost: Post) => {
    setPosts((prev) => [newPost, ...prev]);
    setIsCreateOpen(false);
    setSelectedPostForQR(newPost);
    showToast('Post published! Your stickable QR code is ready.');
  };

  // Update profile
  const handleUpdateProfile = async (updates: Partial<UserProfile>) => {
    try {
      const updated = await api.updateUserProfile(updates);
      setUser(updated);
      showToast('Profile updated');
    } catch (err) {
      console.error(err);
    }
  };

  // Filtered posts on Home page
  const homeFilteredPosts = posts.filter((p) => {
    // Category filter
    if (currentCategory !== 'All' && p.category.toLowerCase() !== currentCategory.toLowerCase()) {
      return false;
    }

    // Location filter
    if (locationFilter.trim()) {
      const loc = locationFilter.toLowerCase();
      if (!p.location_name || !p.location_name.toLowerCase().includes(loc)) {
        return false;
      }
    }

    // Text search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = p.title.toLowerCase().includes(q);
      const matchDesc = p.description.toLowerCase().includes(q);
      const matchCat = p.category.toLowerCase().includes(q);
      const matchLoc = p.location_name && p.location_name.toLowerCase().includes(q);
      const matchQR = p.qr_destination && p.qr_destination.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc && !matchCat && !matchLoc && !matchQR) {
        return false;
      }
    }

    return true;
  });

  return (
    <div className="min-h-screen bg-white text-[#171717] flex flex-col font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-[#171717] text-white text-xs font-bold rounded-full shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
          <Sparkles className="w-3.5 h-3.5 text-[#B8F36B]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <Header
        activeTab={activeTab}
        onNavigate={(tab) => {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenCreate={() => setIsCreateOpen(true)}
      />

      {/* Main Content Area based on Tab */}
      <main className="flex-1 w-full max-w-4xl mx-auto">
        {activeTab === 'home' && (
          <div className="px-4 py-4 pb-28">
            {/* 4 Tool Buttons in ONE ROW (Product, Search, Location, QR Code Search) */}
            <ToolsGrid
              activeTool={activeTool}
              onSelectTool={handleSelectTool}
            />

            {/* Interactive Search & Location Area */}
            <SearchBar
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              locationFilter={locationFilter}
              onLocationChange={setLocationFilter}
              activeMode={searchMode}
              onModeChange={setSearchMode}
            />

            {/* Section Heading: "DISCOVER SOMETHING NEW" -> "Trending QRs" */}
            <div className="flex items-end justify-between gap-3 mb-3">
              <div>
                <p className="text-[10px] font-bold text-[#777777] tracking-[2px] uppercase">
                  DISCOVER SOMETHING NEW
                </p>
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#171717]">
                  Trending <span className="text-[#5B8F2B]">QRs</span>
                </h2>
              </div>

              <button
                onClick={() => {
                  setActiveTab('trending');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="text-xs font-bold text-[#171717] hover:text-[#5B8F2B] transition-colors flex items-center gap-1 cursor-pointer py-1"
                aria-label="See all trending QR codes"
              >
                <span>See all</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Category Filters */}
            <CategoryFilters
              currentFilter={currentCategory}
              onSelectCategory={setCurrentCategory}
            />

            {/* Posts Grid */}
            {loading ? (
              <div className="py-20 flex flex-col items-center justify-center text-[#737373] gap-2">
                <RefreshCw className="w-6 h-6 animate-spin text-[#5B8F2B]" />
                <span className="text-xs font-semibold">Loading SENND posts...</span>
              </div>
            ) : homeFilteredPosts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {homeFilteredPosts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    isSaved={savedPostIds.includes(post.id)}
                    onToggleSave={handleToggleSave}
                    onOpenDetails={(p) => setSelectedPostForDetails(p)}
                    onOpenQR={(p) => setSelectedPostForQR(p)}
                  />
                ))}
              </div>
            ) : (
              /* Attractive Empty State */
              <div className="p-10 border border-dashed border-[#DDDDDD] rounded-2xl text-center bg-[#FAFAFA] mt-4">
                <div className="w-12 h-12 rounded-2xl bg-[#F0F0F0] flex items-center justify-center mx-auto mb-3 text-[#737373]">
                  <Filter className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-[#171717]">No posts match your filters</h3>
                <p className="text-xs text-[#737373] mt-1 max-w-sm mx-auto">
                  {locationFilter
                    ? `No QR codes found near "${locationFilter}". Try clearing location or searching another area.`
                    : 'Try selecting another category or resetting your search term.'}
                </p>
                <div className="mt-4 flex items-center justify-center gap-2">
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setLocationFilter('');
                      setCurrentCategory('All');
                      setActiveTool(null);
                    }}
                    className="px-3.5 py-1.5 rounded-xl border border-[#DDDDDD] bg-white text-xs font-bold text-[#171717] hover:bg-[#F5F5F5] cursor-pointer"
                  >
                    Reset All Filters
                  </button>
                  <button
                    onClick={() => setIsCreateOpen(true)}
                    className="px-3.5 py-1.5 rounded-xl bg-[#171717] text-white text-xs font-bold hover:bg-[#333333] cursor-pointer"
                  >
                    Publish a Post
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Scan Page */}
        {activeTab === 'scan' && (
          <ScannerPage
            onBack={() => setActiveTab('home')}
            onOpenPost={(post) => setSelectedPostForDetails(post)}
          />
        )}

        {/* Trending Page */}
        {activeTab === 'trending' && (
          <TrendingPage
            posts={posts}
            savedPostIds={savedPostIds}
            onToggleSave={handleToggleSave}
            onOpenDetails={(p) => setSelectedPostForDetails(p)}
            onOpenQR={(p) => setSelectedPostForQR(p)}
          />
        )}

        {/* Products Page */}
        {activeTab === 'product' && (
          <ProductPage
            posts={posts}
            savedPostIds={savedPostIds}
            onToggleSave={handleToggleSave}
            onOpenDetails={(p) => setSelectedPostForDetails(p)}
            onOpenQR={(p) => setSelectedPostForQR(p)}
            onOpenCreate={() => setIsCreateOpen(true)}
          />
        )}

        {/* Account Page */}
        {activeTab === 'account' && user && (
          <AccountPage
            user={user}
            posts={posts}
            savedPostIds={savedPostIds}
            onToggleSave={handleToggleSave}
            onOpenDetails={(p) => setSelectedPostForDetails(p)}
            onOpenQR={(p) => setSelectedPostForQR(p)}
            onOpenCreate={() => setIsCreateOpen(true)}
            onUpdateProfile={handleUpdateProfile}
          />
        )}
      </main>

      {/* Fixed Bottom Navigation (5 items) */}
      <BottomNav
        activeTab={activeTab}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* Post Detail Modal */}
      {selectedPostForDetails && (
        <PostDetailModal
          post={selectedPostForDetails}
          isSaved={savedPostIds.includes(selectedPostForDetails.id)}
          onToggleSave={handleToggleSave}
          onClose={() => {
            setSelectedPostForDetails(null);
            // Clear hash
            if (window.location.hash.startsWith('#/p/')) {
              window.history.replaceState(null, '', window.location.pathname);
            }
          }}
          onOpenQR={(p) => setSelectedPostForQR(p)}
        />
      )}

      {/* Enlarge QR & Sticker Modal */}
      {selectedPostForQR && (
        <QRModal
          post={selectedPostForQR}
          onClose={() => setSelectedPostForQR(null)}
        />
      )}

      {/* Create New Post Modal */}
      {isCreateOpen && (
        <CreatePostModal
          onClose={() => setIsCreateOpen(false)}
          onPostCreated={handlePostCreated}
        />
      )}
    </div>
  );
}
