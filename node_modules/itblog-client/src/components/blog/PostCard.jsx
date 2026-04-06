import { Link } from 'react-router-dom';
import Badge from '../ui/Badge';
import Avatar from '../ui/Avatar';
import { formatDate } from '../../utils/formatDate';

export default function PostCard({ post }) {
  const {
    title,
    slug,
    excerpt,
    coverImage,
    author,
    categories,
    tags,
    readingTime,
    viewCount,
    likeCount,
    commentCount,
    publishedAt,
    isFeatured,
  } = post;

  return (
    <Link to={`/blog/${slug}`} className="block group">
      <article className="card overflow-hidden hover:border-accent/30 transition-all duration-300 hover:shadow-glow-sm">
        {coverImage && (
          <div className="aspect-video overflow-hidden">
            <img
              src={coverImage}
              alt={title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </div>
        )}
        <div className="p-6 space-y-4">
          {categories?.[0] && (
            <Badge variant="info" size="sm">{categories[0].name}</Badge>
          )}
          <h2 className="font-display text-xl font-semibold text-txt-primary group-hover:text-accent transition-colors line-clamp-2">
            {title}
          </h2>
          <p className="text-txt-secondary text-sm line-clamp-3">{excerpt}</p>
          <div className="flex items-center gap-4 text-xs text-txt-muted">
            {readingTime && <span>{readingTime} min read</span>}
            {viewCount > 0 && <span>{viewCount.toLocaleString()} views</span>}
            {likeCount > 0 && <span>{likeCount} likes</span>}
            {commentCount > 0 && <span>{commentCount} comments</span>}
          </div>
          <div className="flex items-center justify-between pt-4 border-t border-bg-border">
            <div className="flex items-center gap-3">
              <Avatar src={author?.avatar} name={author?.displayName} size="sm" />
              <div>
                <p className="text-sm font-medium text-txt-primary">{author?.displayName}</p>
                <p className="text-xs text-txt-muted">{formatDate(publishedAt)}</p>
              </div>
            </div>
            {isFeatured && (
              <Badge variant="success" size="sm">Featured</Badge>
            )}
          </div>
        </div>
      </article>
    </Link>
  );
}
