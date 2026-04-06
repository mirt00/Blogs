import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreatePost } from '../../hooks/usePosts';
import Button from '../../components/ui/Button';

export default function PostEditor() {
  const navigate = useNavigate();
  const createPost = useCreatePost();
  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    content: '',
    status: 'draft',
    isFeatured: false,
    tags: '',
    metaTitle: '',
    metaDesc: '',
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.content.trim()) newErrors.content = 'Content is required';
    if (formData.excerpt && formData.excerpt.length > 300) newErrors.excerpt = 'Excerpt must be under 300 characters';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e, status = formData.status) => {
    e.preventDefault();
    if (!validate()) return;

    const tags = formData.tags.split(',').map(t => t.trim()).filter(Boolean);

    try {
      const post = await createPost.mutateAsync({
        ...formData,
        status,
        tags,
      });
      navigate('/admin/posts');
    } catch (error) {
      setErrors({ submit: error.message });
    }
  };

  return (
    <div className="max-w-4xl animate-in">
      <h1 className="font-display text-2xl font-bold text-txt-primary mb-6">New Post</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {errors.submit && (
          <div className="p-3 rounded-lg bg-status-danger/10 border border-status-danger/20 text-status-danger text-sm">
            {errors.submit}
          </div>
        )}

        <div className="card p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-txt-primary mb-2">Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className={`input ${errors.title ? 'border-status-danger' : ''}`}
              placeholder="Enter post title"
            />
            {errors.title && <p className="text-status-danger text-xs mt-1">{errors.title}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-txt-primary mb-2">Excerpt</label>
            <textarea
              name="excerpt"
              value={formData.excerpt}
              onChange={handleChange}
              className={`input min-h-[80px] ${errors.excerpt ? 'border-status-danger' : ''}`}
              placeholder="Brief description of your post"
              maxLength={300}
            />
            <p className="text-xs text-txt-muted mt-1">{formData.excerpt.length}/300</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-txt-primary mb-2">Content * (Markdown)</label>
            <textarea
              name="content"
              value={formData.content}
              onChange={handleChange}
              className={`input min-h-[400px] font-mono text-sm ${errors.content ? 'border-status-danger' : ''}`}
              placeholder="# Hello World

Write your content here using Markdown..."
            />
            {errors.content && <p className="text-status-danger text-xs mt-1">{errors.content}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-txt-primary mb-2">Tags (comma-separated)</label>
            <input
              type="text"
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              className="input"
              placeholder="react, javascript, tutorial"
            />
          </div>
        </div>

        <div className="card p-6 space-y-4">
          <h3 className="font-medium text-txt-primary">SEO Settings</h3>

          <div>
            <label className="block text-sm font-medium text-txt-primary mb-2">Meta Title</label>
            <input
              type="text"
              name="metaTitle"
              value={formData.metaTitle}
              onChange={handleChange}
              className="input"
              placeholder="SEO title (defaults to post title)"
              maxLength={70}
            />
            <p className="text-xs text-txt-muted mt-1">{formData.metaTitle.length}/70</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-txt-primary mb-2">Meta Description</label>
            <textarea
              name="metaDesc"
              value={formData.metaDesc}
              onChange={handleChange}
              className="input min-h-[80px]"
              placeholder="SEO description (defaults to excerpt)"
              maxLength={160}
            />
            <p className="text-xs text-txt-muted mt-1">{formData.metaDesc.length}/160</p>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              name="isFeatured"
              id="isFeatured"
              checked={formData.isFeatured}
              onChange={handleChange}
              className="w-4 h-4 rounded border-bg-border bg-bg-card text-accent focus:ring-accent"
            />
            <label htmlFor="isFeatured" className="text-sm text-txt-primary">Featured Post</label>
          </div>
        </div>

        <div className="flex items-center justify-end gap-4">
          <Button type="button" variant="secondary" onClick={() => handleSubmit({ preventDefault: () => {} }, 'draft')}>
            Save as Draft
          </Button>
          <Button type="submit" onClick={(e) => handleSubmit(e, 'published')}>
            Publish
          </Button>
        </div>
      </form>
    </div>
  );
}
