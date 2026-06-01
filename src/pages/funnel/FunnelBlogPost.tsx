import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FunnelHeader } from '@/components/funnel/FunnelHeader';
import { Footer } from '@/components/Footer';
import { getBlogBySlug, type BlogPost } from '@/services/blogService';
import { Loader2, Calendar, User, ArrowLeft, Clock, Share2 } from 'lucide-react';

export default function FunnelBlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const [blog, setBlog] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadBlog() {
      if (!slug) return;
      try {
        const data = await getBlogBySlug(slug);
        setBlog(data);
      } catch (err) {
        console.error('Error fetching blog post:', err);
        setError('Failed to load the article. Please try again later.');
      } finally {
        setLoading(false);
      }
    }
    loadBlog();
  }, [slug]);

  const readTime = blog ? Math.ceil(blog.content.split(' ').length / 200) : 0;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <FunnelHeader />
      
      <main className="flex-grow container mx-auto max-w-4xl px-4 py-12">
        <div className="mb-10">
          <Link 
            to="/funnel/blog" 
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-orange-400 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Blog
          </Link>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <Loader2 className="h-12 w-12 animate-spin text-orange-500" />
            <p className="text-slate-500">Loading article...</p>
          </div>
        ) : error ? (
          <div className="rounded-xl border border-red-800/50 bg-red-950/30 p-8 text-center">
            <p className="text-red-200 mb-4">{error}</p>
            <Link to="/funnel/blog" className="px-6 py-2 bg-red-800 hover:bg-red-700 rounded-lg transition-colors text-white font-medium">
              Return to Blog
            </Link>
          </div>
        ) : !blog ? (
          <div className="text-center py-24 border border-dashed border-slate-800 rounded-2xl bg-slate-900/50">
            <h2 className="text-2xl font-bold text-white mb-4">Article Not Found</h2>
            <p className="text-slate-400 mb-8">The blog post you're looking for doesn't exist or has been moved.</p>
            <Link to="/funnel/blog" className="px-6 py-2 bg-orange-600 hover:bg-orange-500 rounded-lg transition-colors text-white font-medium">
              Browse All Articles
            </Link>
          </div>
        ) : (
          <article className="animate-in fade-in duration-500">
            <div className="mb-10">
              <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl md:text-5xl mb-6 leading-tight">
                {blog.title}
              </h1>
              
              <div className="flex flex-wrap items-center gap-6 text-sm text-slate-400 border-y border-slate-800 py-6">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-400 font-bold border border-orange-500/30">
                    {blog.author?.[0] || 'R'}
                  </div>
                  <span className="font-medium text-slate-200">{blog.author || 'Revo Learn Team'}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {blog.publishedAt ? new Date(blog.publishedAt).toLocaleDateString() : 'Recently'}
                </div>
                
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  {readTime} min read
                </div>
                
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    alert('Link copied to clipboard!');
                  }}
                  className="ml-auto flex items-center gap-2 text-orange-400 hover:text-orange-300 transition-colors"
                >
                  <Share2 className="h-4 w-4" />
                  Share
                </button>
              </div>
            </div>

            <div className="prose prose-invert prose-orange max-w-none prose-p:text-slate-300 prose-p:leading-relaxed prose-headings:text-white prose-a:text-orange-400 prose-strong:text-white prose-blockquote:border-orange-500 prose-blockquote:bg-slate-900/50 prose-blockquote:py-1 prose-blockquote:px-4 prose-blockquote:rounded-r-lg prose-img:rounded-2xl">
              {/* This is a simple markdown-to-html renderer substitute for now */}
              {blog.content.split('\n').map((para, i) => {
                if (!para.trim()) return <br key={i} />;
                if (para.startsWith('# ')) return <h1 key={i}>{para.substring(2)}</h1>;
                if (para.startsWith('## ')) return <h2 key={i}>{para.substring(3)}</h2>;
                if (para.startsWith('### ')) return <h3 key={i}>{para.substring(4)}</h3>;
                if (para.startsWith('> ')) return <blockquote key={i}>{para.substring(2)}</blockquote>;
                return <p key={i}>{para}</p>;
              })}
            </div>

            <div className="mt-16 pt-8 border-t border-slate-800">
              <div className="bg-gradient-to-r from-orange-600/10 to-amber-600/10 rounded-2xl p-8 border border-orange-500/20 flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">Ready to start learning?</h3>
                  <p className="text-slate-400">Explore our short courses and take the next step in your career.</p>
                </div>
                <Link 
                  to="/funnel#courses" 
                  className="px-8 py-3 bg-orange-600 hover:bg-orange-500 rounded-xl transition-all font-bold text-white shadow-lg shadow-orange-600/20 hover:scale-105"
                >
                  Browse Courses
                </Link>
              </div>
            </div>
          </article>
        )}
      </main>

      <Footer logoSrc="/revoquest%20logo.png" />
    </div>
  );
}
