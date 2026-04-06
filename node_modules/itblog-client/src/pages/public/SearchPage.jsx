import { useState } from 'react';
import { useSearchPosts } from '../../hooks/usePosts';
import PostCard from '../../components/blog/PostCard';
import Button from '../../components/ui/Button';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const { data: posts, isLoading } = useSearchPosts(searchTerm);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchTerm(query);
  };

  return (
    <div className="min-h-screen">
      <header className="border-b border-bg-border">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <h1 className="font-display text-3xl font-bold text-txt-primary mb-6">
            Search Articles
          </h1>
          <form onSubmit={handleSearch} className="flex gap-3">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for posts..."
              className="input flex-1"
            />
            <Button type="submit" disabled={!query.trim()}>
              Search
            </Button>
          </form>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12">
        {isLoading ? (
          <div className="text-center text-txt-muted py-8">Searching...</div>
        ) : posts?.length > 0 ? (
          <>
            <p className="text-txt-secondary mb-6">
              Found {posts.length} result{posts.length !== 1 ? 's' : ''} for "{searchTerm}"
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {posts.map((post) => (
                <PostCard key={post._id} post={post} />
              ))}
            </div>
          </>
        ) : searchTerm ? (
          <div className="text-center py-16">
            <p className="text-txt-muted text-lg">
              No results found for "{searchTerm}"
            </p>
            <p className="text-txt-muted text-sm mt-2">
              Try different keywords or check your spelling
            </p>
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-txt-muted text-lg">
              Enter a search term to find articles
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
