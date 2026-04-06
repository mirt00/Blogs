import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
  name: { type: String, unique: true, required: true },
  slug: { type: String, unique: true, required: true },
  desc: { type: String },
  color: { type: String, default: '#6366f1' },
  postCount: { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.model('Category', categorySchema);
