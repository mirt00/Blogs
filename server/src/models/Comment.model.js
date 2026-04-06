import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema({
  post: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  parent: { type: mongoose.Schema.Types.ObjectId, ref: 'Comment', default: null },
  content: { type: String, required: true, maxlength: 2000 },
  isApproved: { type: Boolean, default: true },
  likeCount: { type: Number, default: 0 },
}, { timestamps: true });

commentSchema.index({ post: 1, createdAt: -1 });
commentSchema.index({ parent: 1 });

export default mongoose.model('Comment', commentSchema);
