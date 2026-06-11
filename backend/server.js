import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import {
  initDatabase,
  dbAll,
  dbGet,
  dbRun
} from './database.js';
import { authenticateToken, generateToken } from './auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5001;

// Middlewares
app.use(cors({
  origin: '*', // In development, allow all origins or map to http://localhost:5173
  credentials: true
}));
app.use(express.json());

// Ensure uploads folder exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Serve uploaded images statically
app.use('/uploads', express.static(uploadsDir));

// Multer Storage Configuration for Image Uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif|webp/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only images (jpeg, jpg, png, gif, webp) are allowed!'));
  },
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Initialize database
initDatabase()
  .then(() => console.log('SQLite Database initialised successfully.'))
  .catch(err => console.error('Database initialisation error:', err));

// ==========================================
// PUBLIC API ENDPOINTS
// ==========================================

// Get all categories
app.get('/api/categories', async (req, res) => {
  try {
    const categories = await dbAll('SELECT * FROM categories');
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get articles (with search, category filter, and pagination)
app.get('/api/articles', async (req, res) => {
  try {
    const { category, search, limit = 10, page = 1 } = req.query;
    const offset = (page - 1) * limit;
    const nowIso = new Date().toISOString();

    let query = `
      SELECT a.*, u.name as author_name, u.avatar as author_avatar, c.name as category_name
      FROM articles a
      LEFT JOIN users u ON a.author_id = u.id
      LEFT JOIN categories c ON a.category_slug = c.slug
      WHERE (a.status = 'published' OR (a.status = 'scheduled' AND datetime(a.scheduled_at) <= datetime(?)))
    `;
    const params = [nowIso];

    if (category) {
      query += ' AND a.category_slug = ?';
      params.push(category);
    }

    if (search) {
      query += ' AND (a.title LIKE ? OR a.summary LIKE ? OR a.content LIKE ?)';
      const searchParam = `%${search}%`;
      params.push(searchParam, searchParam, searchParam);
    }

    // Get total count
    let countQuery = `
      SELECT COUNT(*) as count 
      FROM articles a 
      WHERE (a.status = 'published' OR (a.status = 'scheduled' AND datetime(a.scheduled_at) <= datetime(?)))
    `;
    const countParams = [nowIso];
    if (category) {
      countQuery += ' AND a.category_slug = ?';
      countParams.push(category);
    }
    if (search) {
      countQuery += ' AND (a.title LIKE ? OR a.summary LIKE ? OR a.content LIKE ?)';
      const searchParam = `%${search}%`;
      countParams.push(searchParam, searchParam, searchParam);
    }
    const countResult = await dbGet(countQuery, countParams);
    const totalArticles = countResult.count;

    // Order and apply pagination
    query += ' ORDER BY datetime(a.created_at) DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const articles = await dbAll(query, params);
    res.json({
      articles,
      pagination: {
        total: totalArticles,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(totalArticles / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get trending articles (most viewed)
app.get('/api/articles/trending', async (req, res) => {
  try {
    const nowIso = new Date().toISOString();
    const query = `
      SELECT a.*, u.name as author_name, u.avatar as author_avatar, c.name as category_name
      FROM articles a
      LEFT JOIN users u ON a.author_id = u.id
      LEFT JOIN categories c ON a.category_slug = c.slug
      WHERE (a.status = 'published' OR (a.status = 'scheduled' AND datetime(a.scheduled_at) <= datetime(?)))
      ORDER BY a.views DESC
      LIMIT 5
    `;
    const articles = await dbAll(query, [nowIso]);
    res.json(articles);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single article by ID or Slug
app.get('/api/articles/:identifier', async (req, res) => {
  try {
    const { identifier } = req.params;
    const nowIso = new Date().toISOString();
    
    // Check if it's an ID or slug
    const isId = /^\d+$/.test(identifier);
    let query = `
      SELECT a.*, u.name as author_name, u.avatar as author_avatar, u.bio as author_bio, c.name as category_name
      FROM articles a
      LEFT JOIN users u ON a.author_id = u.id
      LEFT JOIN categories c ON a.category_slug = c.slug
      WHERE ${isId ? 'a.id = ?' : 'a.slug = ?'}
    `;
    const article = await dbGet(query, [identifier]);

    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }

    // Increment view counter
    await dbRun('UPDATE articles SET views = views + 1 WHERE id = ?', [article.id]);

    res.json({ ...article, views: article.views + 1 });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// AUTHENTICATION ENDPOINT
// ==========================================

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required' });
    }

    const user = await dbGet('SELECT * FROM users WHERE username = ?', [username]);
    if (!user) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const token = generateToken({ id: user.id, username: user.username });
    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        bio: user.bio
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// ADMIN SECURED ENDPOINTS
// ==========================================

// Get stats
app.get('/api/admin/stats', authenticateToken, async (req, res) => {
  try {
    const totalCount = await dbGet('SELECT COUNT(*) as count FROM articles');
    const draftCount = await dbGet("SELECT COUNT(*) as count FROM articles WHERE status = 'draft'");
    const scheduledCount = await dbGet("SELECT COUNT(*) as count FROM articles WHERE status = 'scheduled'");
    const reviewCount = await dbGet("SELECT COUNT(*) as count FROM articles WHERE status = 'in-review'");
    const publishedCount = await dbGet("SELECT COUNT(*) as count FROM articles WHERE status = 'published'");
    const totalViews = await dbGet('SELECT SUM(views) as total FROM articles');

    res.json({
      total: totalCount.count,
      draft: draftCount.count,
      scheduled: scheduledCount.count,
      inReview: reviewCount.count,
      published: publishedCount.count,
      views: totalViews.total || 0
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get admin articles (all articles with statuses, no time limit check)
app.get('/api/admin/articles', authenticateToken, async (req, res) => {
  try {
    const { status, search } = req.query;
    let query = `
      SELECT a.*, u.name as author_name, c.name as category_name
      FROM articles a
      LEFT JOIN users u ON a.author_id = u.id
      LEFT JOIN categories c ON a.category_slug = c.slug
      WHERE 1=1
    `;
    const params = [];

    if (status && status !== 'all') {
      query += ' AND a.status = ?';
      params.push(status);
    }

    if (search) {
      query += ' AND (a.title LIKE ? OR a.summary LIKE ?)';
      const searchParam = `%${search}%`;
      params.push(searchParam, searchParam);
    }

    query += ' ORDER BY datetime(a.created_at) DESC';
    const articles = await dbAll(query, params);
    res.json(articles);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create article
app.post('/api/admin/articles', authenticateToken, async (req, res) => {
  try {
    const { title, summary, content, category_slug, cover_image, status, scheduled_at } = req.body;
    
    if (!title || !content || !category_slug) {
      return res.status(400).json({ error: 'Title, content, and category are required' });
    }

    // Generate slug from title
    let slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
    
    // Ensure slug is unique by suffixing if necessary
    let slugExists = await dbGet('SELECT id FROM articles WHERE slug = ?', [slug]);
    let suffix = 1;
    let originalSlug = slug;
    while (slugExists) {
      slug = `${originalSlug}-${suffix}`;
      slugExists = await dbGet('SELECT id FROM articles WHERE slug = ?', [slug]);
      suffix++;
    }

    const author_id = req.user.id;
    const nowIso = new Date().toISOString();

    const result = await dbRun(
      `INSERT INTO articles (title, slug, summary, content, category_slug, cover_image, status, scheduled_at, author_id, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title,
        slug,
        summary || '',
        content,
        category_slug,
        cover_image || '',
        status || 'draft',
        scheduled_at || null,
        author_id,
        nowIso,
        nowIso
      ]
    );

    const newArticle = await dbGet('SELECT * FROM articles WHERE id = ?', [result.id]);
    res.status(201).json(newArticle);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update article
app.put('/api/admin/articles/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, summary, content, category_slug, cover_image, status, scheduled_at } = req.body;

    const article = await dbGet('SELECT * FROM articles WHERE id = ?', [id]);
    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }

    // Generate slug if title changed
    let slug = article.slug;
    if (title && title !== article.title) {
      slug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
      
      let slugExists = await dbGet('SELECT id FROM articles WHERE slug = ? AND id != ?', [slug, id]);
      let suffix = 1;
      let originalSlug = slug;
      while (slugExists) {
        slug = `${originalSlug}-${suffix}`;
        slugExists = await dbGet('SELECT id FROM articles WHERE slug = ? AND id != ?', [slug, id]);
        suffix++;
      }
    }

    const nowIso = new Date().toISOString();

    await dbRun(
      `UPDATE articles 
       SET title = ?, slug = ?, summary = ?, content = ?, category_slug = ?, cover_image = ?, status = ?, scheduled_at = ?, updated_at = ?
       WHERE id = ?`,
      [
        title !== undefined ? title : article.title,
        slug,
        summary !== undefined ? summary : article.summary,
        content !== undefined ? content : article.content,
        category_slug !== undefined ? category_slug : article.category_slug,
        cover_image !== undefined ? cover_image : article.cover_image,
        status !== undefined ? status : article.status,
        scheduled_at !== undefined ? scheduled_at : article.scheduled_at,
        nowIso,
        id
      ]
    );

    const updatedArticle = await dbGet('SELECT * FROM articles WHERE id = ?', [id]);
    res.json(updatedArticle);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete article
app.delete('/api/admin/articles/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const article = await dbGet('SELECT * FROM articles WHERE id = ?', [id]);
    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }

    await dbRun('DELETE FROM articles WHERE id = ?', [id]);
    res.json({ message: 'Article deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Profile - get current info
app.get('/api/admin/profile', authenticateToken, async (req, res) => {
  try {
    const user = await dbGet('SELECT id, username, email, name, avatar, bio FROM users WHERE id = ?', [req.user.id]);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Profile - update info
app.put('/api/admin/profile', authenticateToken, async (req, res) => {
  try {
    const { email, name, avatar, bio } = req.body;
    if (!email || !name) {
      return res.status(400).json({ error: 'Email and Name are required' });
    }

    // Check if email already taken by someone else
    const emailCheck = await dbGet('SELECT id FROM users WHERE email = ? AND id != ?', [email, req.user.id]);
    if (emailCheck) {
      return res.status(400).json({ error: 'Email already in use' });
    }

    await dbRun(
      'UPDATE users SET email = ?, name = ?, avatar = ?, bio = ? WHERE id = ?',
      [email, name, avatar || '', bio || '', req.user.id]
    );

    const updatedUser = await dbGet('SELECT id, username, email, name, avatar, bio FROM users WHERE id = ?', [req.user.id]);
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Profile - change password
app.put('/api/admin/profile/change-password', authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current password and new password are required' });
    }

    const user = await dbGet('SELECT password FROM users WHERE id = ?', [req.user.id]);
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Incorrect current password' });
    }

    const hashedNewPassword = bcrypt.hashSync(newPassword, 10);
    await dbRun('UPDATE users SET password = ? WHERE id = ?', [hashedNewPassword, req.user.id]);

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Upload Cover Image
app.post('/api/admin/upload', authenticateToken, upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Please upload an image file' });
    }
    // Return relative url path
    const fileUrl = `/uploads/${req.file.filename}`;
    res.json({ url: fileUrl });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Global Error Handler for Upload / multer errors
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ error: `Upload error: ${err.message}` });
  } else if (err) {
    return res.status(400).json({ error: err.message });
  }
  next();
});

// Start Server
app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
