export type CategoryType = 'All' | 'Product' | 'Place' | 'Video' | 'Audio' | 'Document' | 'Link';

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

export type PageTab = 'home' | 'scan' | 'trending' | 'product' | 'account';
