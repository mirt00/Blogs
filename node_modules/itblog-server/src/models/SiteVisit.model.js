import mongoose from 'mongoose';

const siteVisitSchema = new mongoose.Schema({
  visitorId: { type: String },
  path: { type: String },
  country: { type: String },
  device: { type: String },
  referer: { type: String },
  isUnique: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now, expires: 31536000 },
});

siteVisitSchema.index({ createdAt: -1 });

export default mongoose.model('SiteVisit', siteVisitSchema);
