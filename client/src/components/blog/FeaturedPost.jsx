import { Link } from 'react-router-dom';
import Badge from '../ui/Badge';
import Avatar from '../ui/Avatar';
import { formatDate } from '../../utils/formatDate';

export default function FeaturedPost({ post }) {
  const {
    title,
    slug,
    excerpt,
    coverImage,
    author,
    categories,
    readingTime,
    publishedAt,
  } = post;

  return (
    <Link to={`/blog/${slug}`} className="block group">
      <article className="relative overflow-hidden rounded-2xl">
        <div className="aspect-[21/9] lg:aspect-[3/1]">
          <img
            src={coverImage || 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200'}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/60 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 lg:p-10">
          <div className="flex items-center gap-3 mb-4">
            <Badge variant="primary" size="sm">Featured</Badge>
            {categories?.[0] && (
              <Badge variant="info" size="sm">{categories[0].name}</Badge>
            )}
          </div>
          <h2 className="font-display text-2xl lg:text-4xl font-bold text-white mb-4 group-hover:text-accent-hover transition-colors">
            {title}
          </h2>
          <p className="text-txt-secondary text-sm lg:text-base mb-6 max-w-2xl line-clamp-2">
            {excerpt}
          </p>
          <div className="flex items-center gap-4">
            <Avatar src={author?.avatar} name={author?.displayName} size="md" />
            <div>
              <p className="text-sm font-medium text-txt-primary">{author?.displayName}</p>
              <p className="text-xs text-txt-muted">
                {formatDate(publishedAt)} · {readingTime} min read
              </p>
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}
