import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { db } from './src/server/db.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isProduction = process.env.NODE_ENV === 'production';
const PORT = process.env.PORT || 3000;

async function startServer() {
  const app = express();

  // Support JSON payload up to 50mb for image uploads
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // Static icons serving
  app.use('/icons', express.static(path.resolve(__dirname, 'public/icons')));
  app.use('/icons', express.static(path.resolve(__dirname, 'icons')));

  // PWABuilder & W3C PWA Standards: Manifest & Service Worker with scope header
  app.get('/manifest.json', (_req: Request, res: Response) => {
    res.setHeader('Content-Type', 'application/manifest+json; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
    const manifestPath = path.resolve(__dirname, 'manifest.json');
    res.sendFile(manifestPath);
  });

  app.get('/service-worker.js', (_req: Request, res: Response) => {
    res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
    res.setHeader('Service-Worker-Allowed', '/');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    const swPath = path.resolve(__dirname, 'service-worker.js');
    res.sendFile(swPath);
  });

  // API Routes
  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok', app: 'SENND', time: new Date().toISOString() });
  });

  // Get all posts with filtering & search
  app.get('/api/posts', (req: Request, res: Response) => {
    try {
      const { category, search, location, sort, userId } = req.query;
      const posts = db.getPosts({
        category: category as string,
        search: search as string,
        location: location as string,
        sort: sort as 'trending' | 'recent' | 'scans',
        userId: userId as string
      });
      res.json(posts);
    } catch (err) {
      console.error('Error fetching posts:', err);
      res.status(500).json({ error: 'Failed to fetch posts' });
    }
  });

  // Get single post
  app.get('/api/posts/:id', (req: Request, res: Response) => {
    try {
      const post = db.getPostById(req.params.id);
      if (!post) {
        return res.status(404).json({ error: 'Post not found' });
      }
      res.json(post);
    } catch (err) {
      console.error('Error fetching post:', err);
      res.status(500).json({ error: 'Failed to fetch post' });
    }
  });

  // Create post
  app.post('/api/posts', (req: Request, res: Response) => {
    try {
      const {
        title,
        description,
        category,
        media_type,
        media_url,
        thumbnail_url,
        qr_destination,
        location_name,
        latitude,
        longitude,
        visibility,
        price,
        details,
        color
      } = req.body;

      if (!title || !category || !qr_destination) {
        return res.status(400).json({ error: 'Title, category, and QR destination are required' });
      }

      const currentUser = db.getUserProfile();

      const newPost = db.createPost({
        user_id: currentUser.id,
        creator_name: currentUser.display_name,
        creator_avatar: currentUser.avatar_url,
        title: title.trim(),
        description: (description || '').trim(),
        category: category,
        media_type: media_type || 'image',
        media_url: media_url || thumbnail_url || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
        thumbnail_url: thumbnail_url || media_url || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80',
        qr_destination: qr_destination.trim(),
        location_name: (location_name || '').trim(),
        latitude: latitude ? Number(latitude) : null,
        longitude: longitude ? Number(longitude) : null,
        visibility: visibility === 'unlisted' ? 'unlisted' : 'public',
        price: price ? price.trim() : undefined,
        details: details ? details.trim() : undefined,
        color: color || '#b8f36b'
      });

      res.status(201).json(newPost);
    } catch (err) {
      console.error('Error creating post:', err);
      res.status(500).json({ error: 'Failed to create post' });
    }
  });

  // Toggle save post
  app.post('/api/posts/:id/save', (req: Request, res: Response) => {
    try {
      const result = db.toggleSave(req.params.id);
      res.json(result);
    } catch (err) {
      console.error('Error toggling save:', err);
      res.status(500).json({ error: 'Failed to toggle save' });
    }
  });

  // Record scan
  app.post('/api/posts/:id/scan', (req: Request, res: Response) => {
    try {
      const result = db.recordScan(req.params.id);
      res.json(result);
    } catch (err) {
      console.error('Error recording scan:', err);
      res.status(500).json({ error: 'Failed to record scan' });
    }
  });

  // Get user profile
  app.get('/api/user/profile', (_req: Request, res: Response) => {
    try {
      const profile = db.getUserProfile();
      res.json(profile);
    } catch (err) {
      console.error('Error fetching profile:', err);
      res.status(500).json({ error: 'Failed to fetch profile' });
    }
  });

  // Update user profile
  app.put('/api/user/profile', (req: Request, res: Response) => {
    try {
      const updated = db.updateUserProfile(req.body);
      res.json(updated);
    } catch (err) {
      console.error('Error updating profile:', err);
      res.status(500).json({ error: 'Failed to update profile' });
    }
  });

  // In development, hook up Vite middleware
  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    // In production, serve static assets
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`[SENND] Server listening on http://0.0.0.0:${PORT} (env: ${isProduction ? 'prod' : 'dev'})`);
  });
}

startServer().catch((err) => {
  console.error('Fatal error starting SENND server:', err);
  process.exit(1);
});
