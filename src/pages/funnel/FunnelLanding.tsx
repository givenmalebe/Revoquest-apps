import { useState, useEffect, useRef, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { DatabaseService } from '@/firebase/database';
import type { Course } from '@/firebase/database';
import { BookOpen, Clock, ArrowRight, Loader2, GraduationCap, Shield, Zap, Sparkles, X, Search } from 'lucide-react';
import { funnelPath } from '@/utils/funnelPath';
const funnelLogo = '/revoquest%20logo.png';

const WELCOME_VIDEO_SRC = '/choose_your_short_202603271307.mp4';

export default function FunnelLanding() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showWelcomeVideo, setShowWelcomeVideo] = useState(false);
  const [hasStartedVideo, setHasStartedVideo] = useState(false);
  const [courseSearch, setCourseSearch] = useState('');
  const [courseCategoryFilter, setCourseCategoryFilter] = useState('all');
  const welcomeVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const list = await DatabaseService.getCourses({ isPublished: true, limit: 50 });
        if (mounted) setCourses(list);
      } catch (e) {
        if (mounted) setError(e instanceof Error ? e.message : 'Failed to load courses');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  // Show video popup after 5 seconds on landing
  useEffect(() => {
    const t = setTimeout(() => setShowWelcomeVideo(true), 5000);
    return () => clearTimeout(t);
  }, []);

  // Scroll to courses section when landing with #courses hash (e.g. from other funnel pages)
  useEffect(() => {
    if (window.location.hash === '#courses') {
      const el = document.getElementById('courses');
      el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  const formatPrice = (price: number) =>
    price > 0 ? `R ${Number(price).toLocaleString()}` : 'Free';

  const courseCategories = useMemo(() => {
    const cats = new Set<string>();
    courses.forEach((c) => {
      if (c.category?.trim()) cats.add(c.category.trim());
    });
    return Array.from(cats).sort((a, b) => a.localeCompare(b));
  }, [courses]);

  const filteredCourses = useMemo(() => {
    const normalizedSearch = courseSearch.trim().toLowerCase();
    return courses.filter((course) => {
      const matchesCategory =
        courseCategoryFilter === 'all' ||
        (course.category?.trim() || 'General') === courseCategoryFilter;
      if (!matchesCategory) return false;
      if (!normalizedSearch) return true;
      const searchable = [
        course.title,
        course.description,
        course.level,
        course.duration,
        course.category,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return searchable.includes(normalizedSearch);
    });
  }, [courses, courseSearch, courseCategoryFilter]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Welcome video popup - appears after 5s; one click starts video with sound */}
      {showWelcomeVideo && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-in fade-in duration-300">
          <div className="relative w-full max-w-4xl max-h-[90vh] bg-slate-900 rounded-2xl overflow-hidden shadow-2xl flex flex-col animate-in zoom-in-95 duration-300">
            {/* Logo bar at top */}
            <div className="flex-shrink-0 flex items-center justify-center py-4 px-6 bg-slate-900/95 border-b border-slate-700/50">
              <img
                src={funnelLogo}
                alt="Revo Learn"
                className="h-12 w-auto object-contain sm:h-14"
              />
            </div>
            {/* Video - click overlay starts playback with sound (browser allows sound after user click) */}
            <div className="relative flex-1 min-h-0 aspect-video">
              {!hasStartedVideo && (
                <button
                  type="button"
                  onClick={() => {
                    setHasStartedVideo(true);
                    const v = welcomeVideoRef.current;
                    if (v) {
                      v.muted = false;
                      v.play().catch(() => {});
                    }
                  }}
                  className="absolute inset-0 z-20 flex items-center justify-center w-full h-full bg-black/70 cursor-pointer focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-slate-900"
                  aria-label="Play video with sound"
                >
                  <span className="text-2xl sm:text-3xl md:text-4xl font-semibold text-white px-8 py-4 rounded-xl bg-orange-500 hover:bg-orange-600 transition-colors shadow-lg">
                    Click to play
                  </span>
                </button>
              )}
              <button
                type="button"
                onClick={() => setShowWelcomeVideo(false)}
                className="absolute top-3 right-3 z-10 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                aria-label="Close"
              >
                <X className="h-6 w-6" />
              </button>
              <video
                ref={welcomeVideoRef}
                className="w-full h-full object-contain"
                src={WELCOME_VIDEO_SRC}
                muted={false}
                playsInline
                onEnded={() => setShowWelcomeVideo(false)}
                controls
              />
              {/* Blur strip at bottom to hide watermark/branding */}
              <div
                className="absolute bottom-0 left-0 right-0 h-10 sm:h-12 pointer-events-none bg-gradient-to-t from-slate-900/95 via-slate-900/70 to-transparent backdrop-blur-md"
                aria-hidden
              />
            </div>
          </div>
        </div>
      )}

      {/* Background accents */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-0 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px]" />
      </div>

      <header className="relative z-10 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-sm">
        <div className="container mx-auto max-w-6xl px-4 py-6">
          <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-between sm:items-center">
            <Link to={funnelPath('')} className="flex items-center gap-3 group">
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-white p-2 sm:h-16 sm:w-16">
                <img
                  src={funnelLogo}
                  alt="Revo Learn"
                  className="h-full w-full object-contain object-center"
                />
              </span>
              <span className="text-xl font-bold tracking-tight text-white sm:text-2xl">
                Revo Learn
              </span>
            </Link>
            <nav className="flex items-center gap-4 sm:gap-6">
              <Link to={funnelPath('')} className="text-sm font-medium text-slate-400 hover:text-orange-400 transition-colors">
                Home
              </Link>
              <Link to={funnelPath('/about')} className="text-sm font-medium text-slate-400 hover:text-orange-400 transition-colors">
                About
              </Link>
              <Link to={funnelPath('/contact')} className="text-sm font-medium text-slate-400 hover:text-orange-400 transition-colors">
                Contact Us
              </Link>
              <a href="#courses" className="text-sm font-medium text-slate-400 hover:text-orange-400 transition-colors">
                Courses
              </a>
              <Link to={funnelPath('/blog')} className="text-sm font-medium text-slate-400 hover:text-orange-400 transition-colors">
                Blog
              </Link>
              <Link to={funnelPath('/login')} className="text-sm font-medium text-orange-400 hover:text-white transition-colors">
                Login
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero with video background */}
      <section className="relative z-10 min-h-[85vh] flex items-center justify-center overflow-hidden">
        {/* Video background */}
        <div className="absolute inset-0">
          <video
            autoPlay
            muted
            loop
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
          >
            <source src="/The_class_must_be_busy_099ffbf5e4.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/90 via-slate-950/75 to-slate-950" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_0%,rgba(249,115,22,0.12),transparent)]" />
        </div>

        <div className="relative z-10 container mx-auto max-w-5xl px-4 py-20 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-orange-500/40 bg-orange-500/15 px-4 py-2 text-sm font-medium text-orange-300 mb-8 shadow-lg shadow-orange-500/10">
            <Sparkles className="h-4 w-4" />
            <span>Smart learning · AI-powered · Accredited qualifications</span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl max-w-4xl mx-auto leading-tight">
            Start your journey with{' '}
            <span className="bg-gradient-to-r from-orange-400 via-orange-500 to-amber-500 bg-clip-text text-transparent">
              Revo Learn
            </span>
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Learn with our smart AI, earn accredited qualifications, and advance your career—at your own pace. Choose from the courses below, pay securely, and get instant access to your learner dashboard.
          </p>

          {/* Trust row */}
          <div className="mt-12 flex flex-wrap justify-center gap-8 sm:gap-12 text-slate-400">
            <span className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-orange-500/90" />
              <span className="text-sm font-medium">Smart AI learning</span>
            </span>
            <span className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-orange-500/90" />
              <span className="text-sm font-medium">Accredited qualifications</span>
            </span>
            <span className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-orange-500/90" />
              <span className="text-sm font-medium">Secure payment</span>
            </span>
            <span className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-orange-500/90" />
              <span className="text-sm font-medium">Instant access</span>
            </span>
          </div>

          <p className="mt-10 text-sm text-slate-500">
            Scroll to explore accredited courses
          </p>
          <div className="mt-4 flex justify-center">
            <div className="w-8 h-10 rounded-full border-2 border-slate-500/50 flex items-start justify-center p-2 animate-bounce">
              <div className="w-1.5 h-1.5 rounded-full bg-orange-500" />
            </div>
          </div>
        </div>
      </section>

      {/* Courses */}
      <main id="courses" className="relative z-10 container mx-auto max-w-6xl px-4 pb-20 scroll-mt-24">
        {loading && (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <Loader2 className="h-12 w-12 animate-spin text-orange-500" />
            <p className="text-slate-500">Loading courses…</p>
          </div>
        )}

        {error && (
          <div className="mb-8 rounded-xl border border-red-800/50 bg-red-950/30 p-6 text-red-200 text-center max-w-xl mx-auto">
            {error}
          </div>
        )}

        {!loading && !error && courses.length > 0 && (
          <>
            <div className="mb-8 flex flex-col gap-4">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-2xl font-semibold text-white">
                  Available online courses
                </h2>
                <label className="relative w-full sm:w-80">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                  <input
                    type="search"
                    value={courseSearch}
                    onChange={(e) => setCourseSearch(e.target.value)}
                    placeholder="Search courses..."
                    className="w-full rounded-xl border border-slate-700/80 bg-slate-900/70 py-2.5 pl-9 pr-3 text-sm text-slate-100 placeholder:text-slate-500 outline-none transition focus:border-orange-500/60 focus:ring-2 focus:ring-orange-500/20"
                    aria-label="Search available courses"
                  />
                </label>
              </div>
              {courseCategories.length > 0 && (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm text-slate-500 mr-1">Category</span>
                  <button
                    type="button"
                    onClick={() => setCourseCategoryFilter('all')}
                    className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition ${
                      courseCategoryFilter === 'all'
                        ? 'bg-orange-500 text-white shadow-md shadow-orange-500/25'
                        : 'border border-slate-700/80 bg-slate-900/70 text-slate-400 hover:border-orange-500/40 hover:text-slate-200'
                    }`}
                  >
                    All
                  </button>
                  {courseCategories.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setCourseCategoryFilter(cat)}
                      className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition ${
                        courseCategoryFilter === cat
                          ? 'bg-orange-500 text-white shadow-md shadow-orange-500/25'
                          : 'border border-slate-700/80 bg-slate-900/70 text-slate-400 hover:border-orange-500/40 hover:text-slate-200'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {filteredCourses.length > 0 ? (
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {filteredCourses.map((course) => (
                  <article
                    key={course.id}
                    className="group flex flex-col rounded-2xl border border-slate-700/80 bg-slate-900/60 backdrop-blur-sm p-6 transition-all duration-300 hover:border-orange-500/40 hover:shadow-xl hover:shadow-orange-500/5"
                  >
                    <div className="relative overflow-hidden rounded-xl mb-5">
                      {course.thumbnail ? (
                        <img
                          src={course.thumbnail}
                          alt=""
                          className="h-44 w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-44 items-center justify-center rounded-xl bg-gradient-to-br from-slate-800 to-slate-800/80">
                          <BookOpen className="h-14 w-14 text-slate-600" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent pointer-events-none" />
                    </div>
                    {course.category && (
                      <span className="inline-block rounded-md bg-orange-500/15 border border-orange-500/30 px-2 py-0.5 text-xs font-medium text-orange-300 mb-2">
                        {course.category}
                      </span>
                    )}
                    <h3 className="text-lg font-semibold text-white line-clamp-2 leading-snug">
                      {course.title}
                    </h3>
                    <p className="mt-2 text-sm text-slate-400 line-clamp-2 leading-relaxed">
                      {course.description}
                    </p>
                    <div className="mt-4 flex items-center gap-4 text-sm text-slate-500">
                      {course.duration && (
                        <span className="flex items-center gap-1.5">
                          <Clock className="h-4 w-4 text-slate-600" />
                          {course.duration}
                        </span>
                      )}
                      {course.level && (
                        <span className="rounded-md bg-slate-800 px-2 py-0.5 text-xs font-medium text-slate-400">
                          {course.level}
                        </span>
                      )}
                    </div>
                    <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-4 border-t border-slate-700/80">
                      <p className="text-2xl font-bold text-orange-400">
                        {formatPrice(course.price ?? 0)}
                        {(course.price ?? 0) > 0 && (
                          <span className="text-sm font-normal text-slate-500 ml-1">
                            one-time
                          </span>
                        )}
                      </p>
                      <Link
                        to={funnelPath(`/checkout/${course.id}`)}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-5 py-3 font-semibold text-white shadow-lg shadow-orange-500/20 transition hover:bg-orange-600 hover:shadow-orange-500/30"
                      >
                        Enroll in this course
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-slate-700/80 bg-slate-900/40 p-10 text-center">
                <BookOpen className="mx-auto h-12 w-12 text-slate-600" />
                <p className="mt-4 text-slate-300">
                  {courseSearch.trim()
                    ? `No courses match "${courseSearch.trim()}".`
                    : courseCategoryFilter !== 'all'
                      ? `No courses in "${courseCategoryFilter}".`
                      : 'No courses match your filters.'}
                </p>
                {(courseSearch.trim() || courseCategoryFilter !== 'all') && (
                  <button
                    type="button"
                    onClick={() => {
                      setCourseSearch('');
                      setCourseCategoryFilter('all');
                    }}
                    className="mt-4 text-sm font-medium text-orange-400 hover:text-orange-300 transition"
                  >
                    Clear filters
                  </button>
                )}
              </div>
            )}
          </>
        )}

        {!loading && !error && courses.length === 0 && (
          <div className="rounded-2xl border border-slate-700/80 bg-slate-900/40 p-12 text-center">
            <BookOpen className="mx-auto h-14 w-14 text-slate-600" />
            <p className="mt-4 text-slate-500">No published courses available yet.</p>
            <a
              href="https://revoquest.co.za"
              className="mt-6 inline-block text-orange-500 font-medium hover:underline"
            >
              Visit Revo Learn
            </a>
          </div>
        )}
      </main>

    </div>
  );
}
