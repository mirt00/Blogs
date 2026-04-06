import mongoose from 'mongoose';

const pageViewSchema = new mongoose.Schema({
  post: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true },
  visitorId: { type: String },
  path: { type: String },
  referer: { type: String },
  country: { type: String },
  device: { type: String, enum: ['desktop', 'mobile', 'tablet'] },
  sessionId: { type: String },
  createdAt: { type: Date, default: Date.now, expires: 31536000 },
});

pageViewSchema.index({ post: 1, createdAt: -1 });
pageViewSchema.index({ visitorId: 1, post: 1, createdAt: -1 });

export default mongoose.model('PageView', pageViewSchema);
