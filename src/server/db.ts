import fs from 'fs';
import path from 'path';

export interface Post {
  id: string;
  user_id: string;
  creator_name: string;
  creator_avatar: string;
  title: string;
  description: string;
  category: 'Product' | 'Place' | 'Video' | 'Audio' | 'Document' | 'Link';
  media_type: 'image' | 'video' | 'audio' | 'pdf' | 'url';
  media_url: string;
  thumbnail_url: string;
  qr_destination: string;
  location_name: string;
  latitude: number | null;
  longitude: number | null;
  visibility: 'public' | 'unlisted';
  views: number;
  scans: number;
  saves_count: number;
  created_at: string;
  updated_at: string;
  color?: string;
  details?: string;
  price?: string;
}

export interface UserProfile {
  id: string;
  display_name: string;
  username: string;
  avatar_url: string;
  bio: string;
  saved_post_ids: string[];
  created_at: string;
}

interface DBData {
  posts: Post[];
  user: UserProfile;
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'db.json');

const INITIAL_POSTS: Post[] = [
  {
    id: 'sennd-post-1',
    user_id: 'user_alex',
    creator_name: 'SoundCraft India',
    creator_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    title: 'Premium Orange Wireless Headphones',
    category: 'Product',
    description: 'Explore studio-grade wireless audio with active noise cancellation and punchy acoustic drivers.',
    qr_destination: 'https://example.com/products/orange-headphones',
    location_name: 'Ahmedabad, Gujarat',
    latitude: 23.0225,
    longitude: 72.5714,
    media_type: 'image',
    media_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
    thumbnail_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=400&q=80',
    visibility: 'public',
    views: 1420,
    scans: 685,
    saves_count: 89,
    created_at: '2026-10-24T10:00:00.000Z',
    updated_at: '2026-10-24T10:00:00.000Z',
    color: '#ff8c42',
    price: '$149.00',
    details: 'A premium product showcase. Scan the QR code to open the product catalog and claim special launch pricing.'
  },
  {
    id: 'sennd-post-2',
    user_id: 'user_priya',
    creator_name: 'Gujarat Wanderlust',
    creator_avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80',
    title: 'Great Rann of Kutch Desert Experience',
    category: 'Place',
    description: 'White salt desert safari, heritage stay, and local artisan village tours in western India.',
    qr_destination: 'https://example.com/places/kutch-desert-safari',
    location_name: 'Kutch, Gujarat, India',
    latitude: 23.8342,
    longitude: 69.8315,
    media_type: 'image',
    media_url: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=800&q=80',
    thumbnail_url: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=400&q=80',
    visibility: 'public',
    views: 3120,
    scans: 1420,
    saves_count: 240,
    created_at: '2026-10-25T14:30:00.000Z',
    updated_at: '2026-10-25T14:30:00.000Z',
    color: '#b8f36b',
    details: 'Travel inspiration with a GPS pinned location, cultural itinerary, and curated homestay map.'
  },
  {
    id: 'sennd-post-3',
    user_id: 'user_dev',
    creator_name: 'Minimal Workspace Co.',
    creator_avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    title: 'Solid Oak Minimalist Desk Setup',
    category: 'Product',
    description: 'A clean ergonomic workspace with built-in magnetic cable routing and wireless charging pad.',
    qr_destination: 'https://example.com/workspace/oak-desk',
    location_name: 'Surat, Gujarat',
    latitude: 21.1702,
    longitude: 72.8311,
    media_type: 'image',
    media_url: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=800&q=80',
    thumbnail_url: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=400&q=80',
    visibility: 'public',
    views: 980,
    scans: 412,
    saves_count: 73,
    created_at: '2026-10-26T08:15:00.000Z',
    updated_at: '2026-10-26T08:15:00.000Z',
    color: '#b8f36b',
    price: '$389.00',
    details: 'A workspace inspiration post. Scan the sticker QR on the timber packaging to download the CAD assembly guide.'
  },
  {
    id: 'sennd-post-4',
    user_id: 'user_kavita',
    creator_name: 'Studio Bombay Motion',
    creator_avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
    title: 'Urban Rhythm: Mumbai Motion Reel',
    category: 'Video',
    description: 'Explore fast-paced kinetic cinematography and street vibes captured across Mumbai.',
    qr_destination: 'https://example.com/videos/mumbai-motion-reel',
    location_name: 'Mumbai, Maharashtra, India',
    latitude: 19.0760,
    longitude: 72.8777,
    media_type: 'video',
    media_url: 'https://images.unsplash.com/photo-1492619375914-88005aa9e8fb?auto=format&fit=crop&w=800&q=80',
    thumbnail_url: 'https://images.unsplash.com/photo-1492619375914-88005aa9e8fb?auto=format&fit=crop&w=400&q=80',
    visibility: 'public',
    views: 2480,
    scans: 1105,
    saves_count: 184,
    created_at: '2026-10-27T11:45:00.000Z',
    updated_at: '2026-10-27T11:45:00.000Z',
    color: '#ff8c42',
    details: 'Exclusive behind-the-scenes 4K cut and color grading presets available through this QR portal.'
  },
  {
    id: 'sennd-post-5',
    user_id: 'user_rohit',
    creator_name: 'Heritage Guild',
    creator_avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
    title: 'Old Ahmedabad Heritage Pols Walking Map',
    category: 'Place',
    description: 'Self-guided audio tour of 600-year-old carved wooden facades, secret passages, and stepwells.',
    qr_destination: 'https://example.com/places/ahmedabad-pols',
    location_name: 'Old City, Ahmedabad',
    latitude: 23.0258,
    longitude: 72.5873,
    media_type: 'image',
    media_url: 'https://images.unsplash.com/photo-1596178065887-1198b6148b2b?auto=format&fit=crop&w=800&q=80',
    thumbnail_url: 'https://images.unsplash.com/photo-1596178065887-1198b6148b2b?auto=format&fit=crop&w=400&q=80',
    visibility: 'public',
    views: 1890,
    scans: 950,
    saves_count: 145,
    created_at: '2026-10-27T16:20:00.000Z',
    updated_at: '2026-10-27T16:20:00.000Z',
    color: '#b8f36b',
    details: 'Physical QR stickers placed at 12 historical monuments unlock audio commentary in English and Gujarati.'
  },
  {
    id: 'sennd-post-6',
    user_id: 'user_alex',
    creator_name: 'Monsoon Records',
    creator_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    title: 'Seaside Rain: Ambient Vinyl EP',
    category: 'Audio',
    description: 'Warm analog synthesizer harmonies blended with field recordings from the Arabian Sea shoreline.',
    qr_destination: 'https://example.com/audio/seaside-rain',
    location_name: 'Goa Coast, India',
    latitude: 15.2993,
    longitude: 74.1240,
    media_type: 'audio',
    media_url: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80',
    thumbnail_url: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=400&q=80',
    visibility: 'public',
    views: 740,
    scans: 330,
    saves_count: 62,
    created_at: '2026-10-28T09:10:00.000Z',
    updated_at: '2026-10-28T09:10:00.000Z',
    color: '#ff8c42',
    details: 'Scan sticker on vinyl sleeve for 24-bit lossless FLAC download and interactive cover art.'
  }
];

const INITIAL_USER: UserProfile = {
  id: 'user_current',
  display_name: 'Shyam Patel',
  username: 'shyamp',
  avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
  bio: 'QR creator & explorer. Sticking SENND codes on physical spots around Ahmedabad.',
  saved_post_ids: ['sennd-post-1', 'sennd-post-2'],
  created_at: '2026-09-15T00:00:00.000Z'
};

function ensureData(): DBData {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(DATA_FILE)) {
      const initial: DBData = {
        posts: INITIAL_POSTS,
        user: INITIAL_USER
      };
      fs.writeFileSync(DATA_FILE, JSON.stringify(initial, null, 2), 'utf-8');
      return initial;
    }
    const content = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(content) as DBData;
  } catch (err) {
    console.error('Error reading DB data, using fallback memory state:', err);
    return { posts: INITIAL_POSTS, user: INITIAL_USER };
  }
}

function saveData(data: DBData): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving DB data:', err);
  }
}

export const db = {
  getPosts(filters?: {
    category?: string;
    search?: string;
    location?: string;
    sort?: 'trending' | 'recent' | 'scans';
    userId?: string;
  }): Post[] {
    const data = ensureData();
    let result = [...data.posts];

    if (filters?.userId) {
      result = result.filter(p => p.user_id === filters.userId);
    }

    if (filters?.category && filters.category !== 'All') {
      result = result.filter(p => p.category.toLowerCase() === filters.category!.toLowerCase());
    }

    if (filters?.location && filters.location.trim()) {
      const loc = filters.location.toLowerCase();
      result = result.filter(p => p.location_name && p.location_name.toLowerCase().includes(loc));
    }

    if (filters?.search && filters.search.trim()) {
      const q = filters.search.toLowerCase();
      result = result.filter(p =>
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        (p.location_name && p.location_name.toLowerCase().includes(q)) ||
        p.qr_destination.toLowerCase().includes(q)
      );
    }

    if (filters?.sort === 'recent') {
      result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    } else if (filters?.sort === 'scans') {
      result.sort((a, b) => b.scans - a.scans);
    } else {
      // Default: Trending score calculated from scans (weight 3), saves (weight 2), views (weight 1)
      result.sort((a, b) => {
        const scoreA = (a.scans * 3) + (a.saves_count * 2) + a.views;
        const scoreB = (b.scans * 3) + (b.saves_count * 2) + b.views;
        return scoreB - scoreA;
      });
    }

    return result;
  },

  getPostById(id: string): Post | null {
    const data = ensureData();
    const post = data.posts.find(p => p.id === id);
    if (post) {
      // Increment view count on single fetch
      post.views += 1;
      saveData(data);
      return post;
    }
    return null;
  },

  createPost(newPost: Omit<Post, 'id' | 'views' | 'scans' | 'saves_count' | 'created_at' | 'updated_at'>): Post {
    const data = ensureData();
    const post: Post = {
      ...newPost,
      id: `sennd-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      views: 1,
      scans: 0,
      saves_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    data.posts.unshift(post);
    saveData(data);
    return post;
  },

  toggleSave(postId: string): { isSaved: boolean; savesCount: number } {
    const data = ensureData();
    const post = data.posts.find(p => p.id === postId);
    const index = data.user.saved_post_ids.indexOf(postId);
    let isSaved = false;

    if (index > -1) {
      data.user.saved_post_ids.splice(index, 1);
      if (post && post.saves_count > 0) post.saves_count -= 1;
      isSaved = false;
    } else {
      data.user.saved_post_ids.push(postId);
      if (post) post.saves_count += 1;
      isSaved = true;
    }

    saveData(data);
    return {
      isSaved,
      savesCount: post ? post.saves_count : 0
    };
  },

  recordScan(postId: string): { scans: number } {
    const data = ensureData();
    const post = data.posts.find(p => p.id === postId);
    if (post) {
      post.scans += 1;
      saveData(data);
      return { scans: post.scans };
    }
    return { scans: 0 };
  },

  getUserProfile(): UserProfile {
    const data = ensureData();
    return data.user;
  },

  updateUserProfile(updates: Partial<UserProfile>): UserProfile {
    const data = ensureData();
    data.user = {
      ...data.user,
      ...updates
    };
    saveData(data);
    return data.user;
  }
};
