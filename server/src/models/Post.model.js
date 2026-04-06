import mongoose from 'mongoose';
import slugify from 'slugify';

const postSchema = new mongoose.Schema({
  title: { type: String, required: true, maxlength: 200 },
  slug: { type: String, unique: true },
  excerpt: { type: String, maxlength: 300 },
  content: { type: String, required: true },
  contentHtml: { type: String },
  coverImage: { type: String },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  categories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }],
  tags: [{ type: String, lowercase: true, trim: true }],
  status: { type: String, enum: ['draft', 'published', 'archived'], default: 'draft' },
  isFeatured: { type: Boolean, default: false },
  readingTime: { type: Number },
  viewCount: { type: Number, default: 0 },
  likeCount: { type: Number, default: 0 },
  commentCount: { type: Number, default: 0 },
  publishedAt: { type: Date },
  metaTitle: { type: String, maxlength: 70 },
  metaDesc: { type: String, maxlength: 160 },
  ogImage: { type: String },
  canonicalUrl: { type: String },
  schemaType: { type: String, default: 'TechArticle' },
}, { timestamps: true });

postSchema.pre('validate', function (next) {
  if (!this.slug && this.title) {
    this.slug = slugify(this.title, { lower: true, strict: true });
  }
  const words = (this.content || '').split(/\s+/).length;
  this.readingTime = Math.ceil(words / 200);
  next();
});

postSchema.index({ title: 'text', excerpt: 'text', content: 'text', tags: 'text' });
postSchema.index({ status: 1, publishedAt: -1 });

export default mongoose.model('Post', postSchema);
