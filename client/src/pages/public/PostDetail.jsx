import { useParams, Link, useNavigate } from 'react-router-dom';
import { usePost } from '../../hooks/usePosts';
import { PostDetailSkeleton } from '../../components/ui/Skeleton';
import Avatar from '../../components/ui/Avatar';
import Badge from '../../components/ui/Badge';
import LikeButton from '../../components/blog/LikeButton';
import ReadingProgress from '../../components/blog/ReadingProgress';
import CommentSection from '../../components/blog/CommentSection';
import { formatDate } from '../../utils/formatDate';

export default function PostDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { data: post, isLoading } = usePost(slug);

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <PostDetailSkeleton />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-display font-bold text-txt-primary mb-4">
            Post Not Found
          </h1>
          <Link to="/" className="text-accent hover:underline">
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg">
      <ReadingProgress />

      <article className="max-w-4xl mx-auto px-4 py-12 animate-in">
        <header className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            {post.categories?.map((cat) => (
              <Link key={cat._id} to={`/category/${cat.slug}`}>
                <Badge variant="info">{cat.name}</Badge>
              </Link>
            ))}
            <span className="text-txt-muted text-sm">
              {post.readingTime} min read
            </span>
          </div>

          <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-txt-primary mb-6 leading-tight">
            {post.title}
          </h1>

          <p className="text-xl text-txt-secondary mb-8">
            {post.excerpt}
          </p>

          <div className="flex items-center justify-between flex-wrap gap-4 pb-8 border-b border-bg-border">
            <div className="flex items-center gap-4">
              <Avatar src={post.author?.avatar} name={post.author?.displayName} size="lg" />
              <div>
                <p className="font-medium text-txt-primary">{post.author?.displayName}</p>
                <p className="text-sm text-txt-muted">
                  {post.author?.bio || 'Tech Writer'}
                </p>
              </div>
            </div>
            <div className="text-sm text-txt-muted">
              {formatDate(post.publishedAt)}
            </div>
          </div>
        </header>

        {post.coverImage && (
          <div className="mb-12 rounded-xl overflow-hidden">
            <img
              src={post.coverImage}
              alt={post.title}
              className="w-full h-auto"
            />
          </div>
        )}

        <div className="prose prose-invert prose-lg max-w-none mb-12">
          <div dangerouslySetInnerHTML={{ __html: post.contentHtml || post.content }} />
        </div>

        <footer className="border-t border-bg-border pt-8">
          <div className="flex items-center justify-between flex-wrap gap-4 mb-12">
            <div className="flex flex-wrap gap-2">
              {post.tags?.map((tag) => (
                <Link key={tag} to={`/tag/${tag}`}>
                  <Badge variant="secondary" size="sm">#{tag}</Badge>
                </Link>
              ))}
            </div>
            <div className="flex items-center gap-4 text-sm text-txt-muted">
              <span>{post.viewCount?.toLocaleString() || 0} views</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <LikeButton
              postId={post._id}
              initialCount={post.likeCount || 0}
              onLoginRequired={() => navigate('/login')}
            />
            <span className="text-txt-muted text-sm">
              {post.commentCount || 0} comments
            </span>
          </div>
        </footer>

        <section className="mt-16">
          <CommentSection postSlug={slug} />
        </section>
      </article>
    </div>
  );
}
