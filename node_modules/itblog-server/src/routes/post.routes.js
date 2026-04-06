import express from 'express';
import { body, query, validationResult } from 'express-validator';
import Post from '../models/Post.model.js';
import Category from '../models/Category.model.js';
import { authenticate, requireRole } from '../middleware/auth.middleware.js';
import { trackView } from '../services/analytics.service.js';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';
import rehypeSanitize from 'rehype-sanitize';

const router = express.Router();

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }
  next();
};

const processMarkdown = async (content) => {
  try {
    const result = await unified()
      .use(remarkParse)
      .use(remarkRehype)
      .use(rehypeSanitize)
      .use(rehypeStringify)
      .process(content);
    return String(result);
  } catch {
    return content;
  }
};

router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const query = { status: 'published' };
    if (req.query.category) {
      const cat = await Category.findOne({ slug: req.query.category });
      if (cat) query.categories = cat._id;
    }
    if (req.query.tag) {
      query.tags = req.query.tag;
    }

    const [posts, total] = await Promise.all([
      Post.find(query)
        .populate('author', 'username displayName avatar')
        .populate('categories', 'name slug color')
        .sort({ publishedAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('-content'),
      Post.countDocuments(query),
    ]);

    res.json({ posts, total, page, totalPages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/featured', async (req, res) => {
  try {
    const posts = await Post.find({ status: 'published', isFeatured: true })
      .populate('author', 'username displayName avatar')
      .populate('categories', 'name slug color')
      .sort({ publishedAt: -1 })
      .limit(3)
      .select('-content');
    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.json([]);

    const posts = await Post.find(
      { $text: { $search: q }, status: 'published' },
      { score: { $meta: 'textScore' } }
    )
      .populate('author', 'username displayName avatar')
      .sort({ score: { $meta: 'textScore' } })
      .limit(20)
      .select('-content');
    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/admin/:id', authenticate, requireRole('admin'), async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('author', 'username displayName avatar')
      .populate('categories', 'name slug color');
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    res.json(post);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:slug', async (req, res) => {
  try {
    const post = await Post.findOne({ slug: req.params.slug, status: 'published' })
      .populate('author', 'username displayName avatar bio')
      .populate('categories', 'name slug color');

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    trackView({ req, postId: post._id, path: req.path, sessionId: req.headers['x-session-id'] });

    res.json(post);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', authenticate, requireRole('admin'), [
  body('title').notEmpty().trim(),
  body('content').notEmpty(),
], validate, async (req, res) => {
  try {
    const contentHtml = await processMarkdown(req.body.content);
    const post = await Post.create({
      ...req.body,
      author: req.user.id,
      contentHtml,
      status: req.body.status || 'draft',
      publishedAt: req.body.status === 'published' ? new Date() : undefined,
    });
    res.status(201).json(post);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', authenticate, requireRole('admin'), async (req, res) => {
  try {
    const contentHtml = req.body.content ? await processMarkdown(req.body.content) : undefined;
    const updateData = { ...req.body, contentHtml };

    if (req.body.status === 'published' && !updateData.publishedAt) {
      updateData.publishedAt = new Date();
    }

    const post = await Post.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    res.json(post);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.patch('/:id/status', authenticate, requireRole('admin'), [
  body('status').isIn(['draft', 'published', 'archived']),
], validate, async (req, res) => {
  try {
    const update = { status: req.body.status };
    if (req.body.status === 'published') {
      const post = await Post.findById(req.params.id);
      if (post && !post.publishedAt) update.publishedAt = new Date();
    }

    const post = await Post.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    res.json(post);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', authenticate, requireRole('admin'), async (req, res) => {
  try {
    const post = await Post.findByIdAndUpdate(req.params.id, { status: 'archived' }, { new: true });
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    res.json({ message: 'Post archived' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
