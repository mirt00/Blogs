import crypto from 'crypto';
import PageView from '../models/PageView.model.js';
import Post from '../models/Post.model.js';

export async function trackView({ req, postId, path, referer, sessionId }) {
  const ip = req.headers['x-forwarded-for'] || req.ip || '';
  const ua = req.headers['user-agent'] || '';
  const visitorId = crypto.createHash('sha256').update(ip + ua).digest('hex');
  const device = detectDevice(ua);

  setImmediate(async () => {
    try {
      await PageView.create({ post: postId, visitorId, path, referer, device, sessionId });
      await Post.findByIdAndUpdate(postId, { $inc: { viewCount: 1 } });
    } catch (err) {
      console.error('Tracking error:', err.message);
    }
  });
}

function detectDevice(ua = '') {
  if (/mobile/i.test(ua)) return 'mobile';
  if (/tablet|ipad/i.test(ua)) return 'tablet';
  return 'desktop';
}
