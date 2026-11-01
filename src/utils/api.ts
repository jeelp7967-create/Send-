import { Post, UserProfile } from '../types.ts';

const LOCAL_STORAGE_SAVED_KEY = 'sennd_saved_posts_local';

export const api = {
  async getPosts(params?: {
    category?: string;
    search?: string;
    location?: string;
    sort?: 'trending' | 'recent' | 'scans';
    userId?: string;
  }): Promise<Post[]> {
    try {
      const query = new URLSearchParams();
      if (params?.category && params.category !== 'All') query.set('category', params.category);
      if (params?.search) query.set('search', params.search);
      if (params?.location) query.set('location', params.location);
      if (params?.sort) query.set('sort', params.sort);
      if (params?.userId) query.set('userId', params.userId);

      const res = await fetch(`/api/posts?${query.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch posts');
      return await res.json();
    } catch (err) {
      console.warn('API error fetching posts, checking local fallback:', err);
      return [];
    }
  },

  async getPostById(id: string): Promise<Post | null> {
    try {
      const res = await fetch(`/api/posts/${encodeURIComponent(id)}`);
      if (!res.ok) return null;
      return await res.json();
    } catch (err) {
      console.error('Error fetching post:', err);
      return null;
    }
  },

  async createPost(postData: Partial<Post>): Promise<Post> {
    const res = await fetch('/api/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(postData),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to create post');
    }
    return await res.json();
  },

  async toggleSave(postId: string): Promise<{ isSaved: boolean; savesCount: number }> {
    try {
      const res = await fetch(`/api/posts/${encodeURIComponent(postId)}/save`, {
        method: 'POST',
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      console.warn('Server toggle save failed, falling back to local storage:', err);
    }

    // Local storage fallback
    const saved = JSON.parse(localStorage.getItem(LOCAL_STORAGE_SAVED_KEY) || '[]');
    const idx = saved.indexOf(postId);
    let isSaved = false;
    if (idx > -1) {
      saved.splice(idx, 1);
      isSaved = false;
    } else {
      saved.push(postId);
      isSaved = true;
    }
    localStorage.setItem(LOCAL_STORAGE_SAVED_KEY, JSON.stringify(saved));
    return { isSaved, savesCount: isSaved ? 1 : 0 };
  },

  async recordScan(postId: string): Promise<{ scans: number }> {
    try {
      const res = await fetch(`/api/posts/${encodeURIComponent(postId)}/scan`, {
        method: 'POST',
      });
      if (res.ok) return await res.json();
    } catch (err) {
      console.error('Error recording scan:', err);
    }
    return { scans: 0 };
  },

  async getUserProfile(): Promise<UserProfile> {
    try {
      const res = await fetch('/api/user/profile');
      if (res.ok) return await res.json();
    } catch (err) {
      console.warn('Error fetching user profile:', err);
    }
    return {
      id: 'guest_user',
      display_name: 'SENND Explorer',
      username: 'explorer',
      avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
      bio: 'Discovering and scanning QR stickers across town.',
      saved_post_ids: JSON.parse(localStorage.getItem(LOCAL_STORAGE_SAVED_KEY) || '[]'),
      created_at: new Date().toISOString(),
    };
  },

  async updateUserProfile(updates: Partial<UserProfile>): Promise<UserProfile> {
    const res = await fetch('/api/user/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error('Failed to update profile');
    return await res.json();
  },
};
