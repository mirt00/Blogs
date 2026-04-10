import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import api from '../../lib/api';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { formatDate } from '../../utils/formatDate';

export default function Posts() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-posts'],
    queryFn: () => api.get('/posts?limit=100').then((res) => res.data),
  });

  const posts = data?.posts || [];

  const getStatusVariant = (status) => {
    switch (status) {
      case 'published': return 'success';
      case 'draft': return 'warning';
      case 'archived': return 'secondary';
      default: return 'secondary';
    }
  };

  return (
    <div className="space-y-6 animate-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-txt-primary">Posts</h1>
          <p className="text-txt-secondary">Manage your blog posts</p>
        </div>
        <Link to="/admin/posts/new">
          <Button>New Post</Button>
        </Link>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-txt-muted border-b border-bg-border bg-bg-surface">
              <th className="px-6 py-4 font-medium">Title</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium">Views</th>
              <th className="px-6 py-4 font-medium">Date</th>
              <th className="px-6 py-4 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-bg-border">
            {isLoading ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-txt-muted">Loading...</td>
              </tr>
            ) : posts.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-txt-muted">No posts yet</td>
              </tr>
            ) : (
              posts.map((post) => (
                <tr key={post._id} className="hover:bg-bg-hover transition-colors">
                  <td className="px-6 py-4">
                    <Link to={`/blog/${post.slug}`} className="text-txt-primary hover:text-accent font-medium">
                      {post.title}
                    </Link>
                    {post.isFeatured && (
                      <Badge variant="info" size="sm" className="ml-2">Featured</Badge>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={getStatusVariant(post.status)}>{post.status}</Badge>
                  </td>
                  <td className="px-6 py-4 text-txt-secondary">{post.viewCount || 0}</td>
                  <td className="px-6 py-4 text-txt-secondary">{formatDate(post.publishedAt)}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Link to={`/admin/posts/${post._id}/edit`} className="text-accent hover:underline text-sm">
                        Edit
                      </Link>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
