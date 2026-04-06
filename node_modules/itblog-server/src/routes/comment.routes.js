import express from 'express';
import { body, validationResult } from 'express-validator';
import Comment from '../models/Comment.model.js';
import Post from '../models/Post.model.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { commentLimiter } from '../middleware/rateLimit.js';

const router = express.Router();

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }
  next();
};

const sanitizeContent = (content) => {
  return content.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]+>/g, '')
    .trim();
};

router.get('/post/:slug', async (req, res) => {
  try {
    const post = await Post.findOne({ slug: req.params.slug });
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const comments = await Comment.find({ post: post._id, parent: null })
      .populate('author', 'username displayName avatar')
      .sort({ createdAt: -1 });

    const commentsWithReplies = await Promise.all(
      comments.map(async (comment) => {
        const replies = await Comment.find({ parent: comment._id })
          .populate('author', 'username displayName avatar')
          .sort({ createdAt: 1 });
        return { ...comment.toObject(), replies };
      })
    );

    res.json(commentsWithReplies);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/post/:slug', authenticate, commentLimiter, [
  body('content').notEmpty().isLength({ max: 2000 }),
], validate, async (req, res) => {
  try {
    const post = await Post.findOne({ slug: req.params.slug });
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const content = sanitizeContent(req.body.content);
    const comment = await Comment.create({
      post: post._id,
      author: req.user.id,
      content,
      parent: req.body.parentId || null,
    });

    await Post.findByIdAndUpdate(post._id, { $inc: { commentCount: 1 } });

    const populated = await Comment.findById(comment._id).populate('author', 'username displayName avatar');
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', authenticate, [
  body('content').notEmpty().isLength({ max: 2000 }),
], validate, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    if (comment.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    comment.content = sanitizeContent(req.body.content);
    await comment.save();

    const populated = await Comment.findById(comment._id).populate('author', 'username displayName avatar');
    res.json(populated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', authenticate, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    if (comment.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    await Comment.deleteOne({ _id: req.params.id });
    await Comment.deleteMany({ parent: req.params.id });
    await Post.findByIdAndUpdate(comment.post, { $inc: { commentCount: -1 } });

    res.json({ message: 'Comment deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
