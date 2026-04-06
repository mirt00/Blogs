import express from 'express';
import { body, validationResult } from 'express-validator';
import Like from '../models/Like.model.js';
import Post from '../models/Post.model.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = express.Router();

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }
  next();
};

router.post('/:id/like', authenticate, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const existing = await Like.findOne({ post: req.params.id, user: req.user.id });

    if (existing) {
      await Like.deleteOne({ _id: existing._id });
      await Post.findByIdAndUpdate(req.params.id, { $inc: { likeCount: -1 } });
      res.json({ liked: false, likeCount: post.likeCount - 1 });
    } else {
      await Like.create({ post: req.params.id, user: req.user.id });
      await Post.findByIdAndUpdate(req.params.id, { $inc: { likeCount: 1 } });
      res.json({ liked: true, likeCount: post.likeCount + 1 });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id/like-status', authenticate, async (req, res) => {
  try {
    const like = await Like.findOne({ post: req.params.id, user: req.user.id });
    res.json({ liked: !!like });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
