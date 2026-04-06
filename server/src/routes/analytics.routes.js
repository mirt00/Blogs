import express from 'express';
import PageView from '../models/PageView.model.js';
import SiteVisit from '../models/SiteVisit.model.js';
import Post from '../models/Post.model.js';
import Comment from '../models/Comment.model.js';
import Like from '../models/Like.model.js';
import { authenticate, requireRole } from '../middleware/auth.middleware.js';
import crypto from 'crypto';

const router = express.Router();

router.post('/track', async (req, res) => {
  try {
    const { postId, path, referer, sessionId } = req.body;
    const ip = req.headers['x-forwarded-for'] || req.ip || '';
    const ua = req.headers['user-agent'] || '';
    const visitorId = crypto.createHash('sha256').update(ip + ua).digest('hex');

    let device = 'desktop';
    if (/mobile/i.test(ua)) device = 'mobile';
    else if (/tablet|ipad/i.test(ua)) device = 'tablet';

    if (postId) {
      await PageView.create({ post: postId, visitorId, path, referer, device, sessionId });
      await Post.findByIdAndUpdate(postId, { $inc: { viewCount: 1 } });
    }

    await SiteVisit.create({ visitorId, path, referer, device });

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/overview', authenticate, requireRole('admin'), async (req, res) => {
  try {
    const totalPosts = await Post.countDocuments({ status: 'published' });
    const totalLikes = await Like.countDocuments();
    const totalComments = await Comment.countDocuments();

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [totalVisits, uniqueVisitors, topPostsData] = await Promise.all([
      PageView.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
      PageView.distinct('visitorId', { createdAt: { $gte: thirtyDaysAgo } }),
      Post.find({ status: 'published' })
        .sort({ viewCount: -1 })
        .limit(5)
        .select('title slug viewCount likeCount'),
    ]);

    const topPosts = topPostsData.map(p => ({
      title: p.title,
      slug: p.slug,
      views: p.viewCount,
      likes: p.likeCount,
    }));

    const visitTrend = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      const dayVisits = await PageView.countDocuments({
        createdAt: { $gte: new Date(dateStr), $lt: new Date(date.setDate(date.getDate() + 1)) },
      });

      visitTrend.push({ date: dateStr, visits: dayVisits, unique: Math.floor(dayVisits * 0.6) });
    }

    const allViews = await PageView.find({ createdAt: { $gte: thirtyDaysAgo } });
    const deviceSplit = { desktop: 0, mobile: 0, tablet: 0 };
    allViews.forEach(v => {
      if (v.device) deviceSplit[v.device]++;
    });
    const total = allViews.length || 1;
    deviceSplit.desktop = Math.round((deviceSplit.desktop / total) * 100);
    deviceSplit.mobile = Math.round((deviceSplit.mobile / total) * 100);
    deviceSplit.tablet = 100 - deviceSplit.desktop - deviceSplit.mobile;

    res.json({
      totalVisits,
      uniqueVisitors: uniqueVisitors.length,
      totalPosts,
      totalLikes,
      totalComments,
      avgReadingTime: 6,
      topPosts,
      visitTrend,
      deviceSplit,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/visitors', authenticate, requireRole('admin'), async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const result = [];
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const visits = await PageView.countDocuments({
        createdAt: { $gte: date, $lt: nextDate },
      });

      result.push({ date: dateStr, visits, unique: Math.floor(visits * 0.6) });
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/posts', authenticate, requireRole('admin'), async (req, res) => {
  try {
    const posts = await Post.find({ status: 'published' })
      .sort({ viewCount: -1 })
      .select('title slug viewCount likeCount commentCount publishedAt');

    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/devices', authenticate, requireRole('admin'), async (req, res) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const allViews = await PageView.find({ createdAt: { $gte: thirtyDaysAgo } });
    const deviceSplit = { desktop: 0, mobile: 0, tablet: 0 };
    allViews.forEach(v => {
      if (v.device) deviceSplit[v.device]++;
    });

    const total = allViews.length || 1;
    res.json([
      { device: 'desktop', count: deviceSplit.desktop, percentage: Math.round((deviceSplit.desktop / total) * 100) },
      { device: 'mobile', count: deviceSplit.mobile, percentage: Math.round((deviceSplit.mobile / total) * 100) },
      { device: 'tablet', count: deviceSplit.tablet, percentage: 100 - Math.round((deviceSplit.desktop / total) * 100) - Math.round((deviceSplit.mobile / total) * 100) },
    ]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
