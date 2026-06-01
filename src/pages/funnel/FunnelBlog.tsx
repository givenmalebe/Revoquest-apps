import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FunnelHeader } from '@/components/funnel/FunnelHeader';
import { getPublishedBlogs, type BlogPost } from '@/services/blogService';
import { Loader2, Calendar, User, ArrowRight } from 'lucide-react';

export default function FunnelBlog() {
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadBlogs() {
      try {
        const data = await getPublishedBlogs();
        setBlogs(data);
      } catch (err) {
        console.error('Error fetching blogs:', err);
        setError('Failed to load blog posts. Please try again later.');
      } finally {
        setLoading(false);
      }
    }
    loadBlogs();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <FunnelHeader />
      
      <main className="flex-grow container mx-auto max-w-6xl px-4 py-12">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl mb-4">
            Our <span className="bg-gradient-to-r from-orange-400 to-amber-500 bg-clip-text text-transparent">Blog</span>
          </h1>
          <p className="text-slate-400 max-w-2xl mx-auto text-lg">
            Stay updated with the latest news, insights, and educational tips from Revo Learn.
          </p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <Loader2 className="h-12 w-12 animate-spin text-orange-500" />
            <p className="text-slate-500">Loading articles...</p>
          </div>
        ) : error ? (
          <div className="rounded-xl border border-red-800/50 bg-red-950/30 p-8 text-center max-w-2xl mx-auto">
            <p className="text-red-200 mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-red-800 hover:bg-red-700 rounded-lg transition-colors text-white font-medium"
            >
              Try Again
            </button>
          </div>
        ) : blogs.length === 0 ? (
          <div className="text-center py-24 border border-dashed border-slate-800 rounded-2xl bg-slate-900/50">
            <p className="text-slate-400 text-lg">No blog posts found yet. Check back soon!</p>
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {blogs.map((blog) => (
              <article 
                key={blog.id} 
                className="group flex flex-col bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden hover:border-orange-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-orange-500/5"
              >
                <div className="p-6 flex flex-col flex-grow">
                  <div className="flex items-center gap-4 text-xs text-slate-500 mb-4">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {blog.publishedAt ? new Date(blog.publishedAt).toLocaleDateString() : 'Recently'}
                    </span>
                    {blog.author && (
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {blog.author}
                      </span>
                    )}
                  </div>
                  
                  <h2 className="text-xl font-bold text-white mb-3 group-hover:text-orange-400 transition-colors">
                    <Link to={`/funnel/blog/${blog.slug}`}>
                      {blog.title}
                    </Link>
                  </h2>
                  
                  <p className="text-slate-400 text-sm line-clamp-3 mb-6 flex-grow">
                    {blog.excerpt || blog.content.substring(0, 150).replace(/[#*`]/g, '') + '...'}
                  </p>
                  
                  <Link 
                    to={`/funnel/blog/${blog.slug}`}
                    className="inline-flex items-center gap-2 text-sm font-semibold text-orange-400 hover:text-orange-300 transition-colors"
                  >
                    Read Article
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>

    </div>
  );
}
