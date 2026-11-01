import React, { useState } from 'react';
import { User, Bookmark, QrCode, Plus, Edit3, Settings, ShieldCheck, Check, LogOut } from 'lucide-react';
import { UserProfile, Post } from '../types.ts';
import { PostCard } from './PostCard.tsx';

interface AccountPageProps {
  user: UserProfile;
  posts: Post[];
  savedPostIds: string[];
  onToggleSave: (postId: string) => void;
  onOpenDetails: (post: Post) => void;
  onOpenQR: (post: Post) => void;
  onOpenCreate: () => void;
  onUpdateProfile: (updates: Partial<UserProfile>) => void;
}

export const AccountPage: React.FC<AccountPageProps> = ({
  user,
  posts,
  savedPostIds,
  onToggleSave,
  onOpenDetails,
  onOpenQR,
  onOpenCreate,
  onUpdateProfile,
}) => {
  const [activeTab, setActiveTab] = useState<'saved' | 'my-posts'>('saved');
  const [isEditing, setIsEditing] = useState(false);
  const [nameInput, setNameInput] = useState(user.display_name);
  const [bioInput, setBioInput] = useState(user.bio);
  const [showSettings, setShowSettings] = useState(false);

  // Filter posts
  const savedPosts = posts.filter((p) => savedPostIds.includes(p.id));
  const myPosts = posts.filter((p) => p.user_id === user.id);

  // Calculate total scans across my posts
  const totalMyScans = myPosts.reduce((acc, curr) => acc + curr.scans, 0);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile({
      display_name: nameInput.trim() || user.display_name,
      bio: bioInput.trim() || user.bio,
    });
    setIsEditing(false);
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-4 pb-28">
      {/* Profile Card Header */}
      <div className="bg-white border border-[#E5E5E5] rounded-3xl p-5 sm:p-6 shadow-xs mb-6 relative overflow-hidden">
        {/* Accent strip */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#B8F36B] via-[#FF8C42] to-[#171717]" />

        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 text-center sm:text-left mt-2">
          {/* Avatar with initial or photo */}
          <div className="relative group">
            <img
              src={user.avatar_url}
              alt={user.display_name}
              className="w-20 h-20 rounded-2xl object-cover border-2 border-[#171717] shadow-sm"
            />
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#B8F36B] border-2 border-white flex items-center justify-center text-[10px] font-bold text-[#171717]">
              ✓
            </div>
          </div>

          {/* Profile Bio & Details */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-xl font-bold text-[#171717] flex items-center justify-center sm:justify-start gap-1.5">
                  <span>{user.display_name}</span>
                  <ShieldCheck className="w-4 h-4 text-[#5B8F2B]" />
                </h2>
                <p className="text-xs text-[#737373] font-mono">@{user.username}</p>
              </div>

              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-3 py-1.5 rounded-xl border border-[#E5E5E5] bg-white text-xs font-semibold text-[#171717] hover:bg-[#F5F5F5] flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5 text-[#737373]" />
                  <span>Edit Profile</span>
                </button>

                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className="p-1.5 rounded-xl border border-[#E5E5E5] bg-white text-[#737373] hover:text-[#171717] hover:bg-[#F5F5F5] transition-colors cursor-pointer"
                  title="Account Settings"
                >
                  <Settings className="w-4 h-4" />
                </button>
              </div>
            </div>

            <p className="text-xs text-[#555555] mt-2.5 max-w-md">
              {user.bio}
            </p>

            {/* Metrics Row */}
            <div className="mt-4 pt-3 border-t border-[#EEEEEE] grid grid-cols-3 gap-2 text-center sm:text-left">
              <div>
                <span className="block text-lg font-black text-[#171717] leading-none">
                  {myPosts.length}
                </span>
                <span className="text-[10px] text-[#737373] uppercase font-bold tracking-wider">
                  Created QRs
                </span>
              </div>

              <div>
                <span className="block text-lg font-black text-[#5B8F2B] leading-none">
                  {totalMyScans}
                </span>
                <span className="text-[10px] text-[#737373] uppercase font-bold tracking-wider">
                  Total Scans
                </span>
              </div>

              <div>
                <span className="block text-lg font-black text-[#171717] leading-none">
                  {savedPostIds.length}
                </span>
                <span className="text-[10px] text-[#737373] uppercase font-bold tracking-wider">
                  Saved Items
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Account Settings Drawer / Box */}
      {showSettings && (
        <div className="mb-6 p-4 bg-[#F8F9FA] border border-[#E5E5E5] rounded-2xl text-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#EEEEEE]">
            <h4 className="font-bold text-[#171717]">Account & Storage Preferences</h4>
            <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-semibold">Active Session</span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-[#171717]">Persistent Cloud Storage</p>
              <p className="text-[11px] text-[#737373]">Saves and post records are synced with SENND database.</p>
            </div>
            <span className="text-[11px] text-[#5B8F2B] font-bold">Enabled</span>
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-[#EEEEEE]">
            <p className="text-[11px] text-[#737373]">SENND Applet v2.4 · Mobile First</p>
            <button
              onClick={() => {
                alert('Session reset. Local caches synced.');
              }}
              className="text-[11px] text-red-600 hover:underline font-semibold"
            >
              Reset Local Caches
            </button>
          </div>
        </div>
      )}

      {/* Tabs: Saved Posts vs My Posts */}
      <div className="flex items-center justify-between gap-2 mb-4 border-b border-[#EEEEEE]">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveTab('saved')}
            className={`pb-3 px-3 text-xs font-bold transition-all relative cursor-pointer ${
              activeTab === 'saved'
                ? 'text-[#171717]'
                : 'text-[#737373] hover:text-[#171717]'
            }`}
          >
            <div className="flex items-center gap-1.5">
              <Bookmark className="w-3.5 h-3.5" />
              <span>Saved Posts ({savedPosts.length})</span>
            </div>
            {activeTab === 'saved' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#171717]" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('my-posts')}
            className={`pb-3 px-3 text-xs font-bold transition-all relative cursor-pointer ${
              activeTab === 'my-posts'
                ? 'text-[#171717]'
                : 'text-[#737373] hover:text-[#171717]'
            }`}
          >
            <div className="flex items-center gap-1.5">
              <QrCode className="w-3.5 h-3.5" />
              <span>My Created QRs ({myPosts.length})</span>
            </div>
            {activeTab === 'my-posts' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#171717]" />
            )}
          </button>
        </div>

        <button
          onClick={onOpenCreate}
          className="mb-2 px-3 py-1.5 rounded-xl bg-[#171717] hover:bg-[#333333] text-white text-xs font-semibold flex items-center gap-1 shadow-xs cursor-pointer active:scale-95 transition-all"
        >
          <Plus className="w-3.5 h-3.5 text-[#B8F36B]" />
          <span>New Post</span>
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'saved' ? (
        savedPosts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {savedPosts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                isSaved={true}
                onToggleSave={onToggleSave}
                onOpenDetails={onOpenDetails}
                onOpenQR={onOpenQR}
              />
            ))}
          </div>
        ) : (
          <div className="p-12 border border-dashed border-[#DDDDDD] rounded-2xl text-center text-[#737373] bg-[#FAFAFA]">
            <Bookmark className="w-8 h-8 mx-auto text-[#CCCCCC] mb-2" />
            <p className="text-sm font-bold text-[#171717]">No saved posts yet</p>
            <p className="text-xs text-[#737373] mt-1">
              Tap the bookmark icon on any post card to save it for later quick access.
            </p>
          </div>
        )
      ) : (
        myPosts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {myPosts.map((post) => (
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
            <QrCode className="w-8 h-8 mx-auto text-[#CCCCCC] mb-2" />
            <p className="text-sm font-bold text-[#171717]">You haven't published any QR posts yet</p>
            <p className="text-xs text-[#737373] mt-1 mb-3">
              Generate your first physical QR code sticker for your product, video, or location.
            </p>
            <button
              onClick={onOpenCreate}
              className="px-4 py-2 bg-[#171717] text-white rounded-xl text-xs font-bold hover:bg-[#333333] cursor-pointer"
            >
              Create My First QR Post
            </button>
          </div>
        )
      )}

      {/* Edit Profile Modal */}
      {isEditing && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => setIsEditing(false)}
        >
          <div
            className="w-full max-w-sm bg-white rounded-3xl p-5 shadow-2xl border border-[#E5E5E5]"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-bold text-lg text-[#171717] mb-3">Edit Profile</h3>
            <form onSubmit={handleSaveProfile} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-[#171717] mb-1">Display Name</label>
                <input
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  className="w-full h-10 px-3 text-sm rounded-xl border border-[#DDDDDD] focus:outline-hidden focus:border-[#171717]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#171717] mb-1">Bio</label>
                <textarea
                  rows={3}
                  value={bioInput}
                  onChange={(e) => setBioInput(e.target.value)}
                  className="w-full p-2.5 text-xs rounded-xl border border-[#DDDDDD] focus:outline-hidden focus:border-[#171717]"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="flex-1 py-2 text-xs font-bold text-[#737373] bg-[#F5F5F5] rounded-xl hover:bg-[#EAEAEA]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 text-xs font-bold text-white bg-[#171717] rounded-xl hover:bg-[#333333]"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
