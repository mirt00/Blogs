import { useState } from 'react';
import { usePosts, useFeaturedPosts } from '../../hooks/usePosts';
import PostCard from '../../components/blog/PostCard';
import FeaturedPost from '../../components/blog/FeaturedPost';
import { PostCardSkeleton } from '../../components/ui/Skeleton';
import Button from '../../components/ui/Button';

export default function Home() {
  const [page, setPage] = useState(1);
  const { data: featuredData } = useFeaturedPosts();
  const { data: postsData, isLoading, isPreviousData } = usePosts({ page, limit: 6 });

  const featuredPosts = featuredData || [];
  const posts = postsData?.posts || [];
  const totalPages = postsData?.totalPages || 1;

  return (
    <div className="min-h-screen">
      <div className="border-b border-bg-border">
        <div className="max-w-7xl mx-auto px-4 py-16 text-center">
          <h1 className="font-display text-4xl md:text-5xl font-bold text-txt-primary mb-4 animate-in">
            Tech Insights for <span className="text-accent">Developers</span>
          </h1>
          <p className="text-txt-secondary text-lg max-w-2xl mx-auto animate-in" style={{ animationDelay: '100ms' }}>
            Deep dives into DevOps, Backend, Frontend, and Security. Written by developers, for developers.
          </p>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-12">
        {featuredPosts.length > 0 && !isLoading && page === 1 && (
          <section className="mb-16 animate-in" style={{ animationDelay: '200ms' }}>
            <FeaturedPost post={featuredPosts[0]} />
          </section>
        )}

        <section>
          <h2 className="font-display text-2xl font-semibold text-txt-primary mb-8">
            Latest Articles
          </h2>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <PostCardSkeleton key={i} />
              ))}
            </div>
          ) : posts.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {posts.map((post, index) => (
                  <div key={post._id} className="animate-in" style={{ animationDelay: `${(index + 3) * 50}ms` }}>
                    <PostCard post={post} />
                  </div>
                ))}
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-4 mt-12">
                  <Button
                    variant="secondary"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1 || isPreviousData}
                  >
                    Previous
                  </Button>
                  <span className="text-txt-muted text-sm">
                    Page {page} of {totalPages}
                  </span>
                  <Button
                    variant="secondary"
                    onClick={() => setPage((p) => p + 1)}
                    disabled={page >= totalPages || isPreviousData}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-16">
              <p className="text-txt-muted text-lg">No posts yet. Check back soon!</p>
            </div>
          )}
        </section>
      </main>

      <footer className="border-t border-bg-border mt-16">
        <div className="max-w-7xl mx-auto px-4 py-12 text-center">
          <p className="text-txt-muted text-sm">
            Built with passion · Powered by developer curiosity
          </p>
        </div>
      </footer>
    </div>
  );
}
