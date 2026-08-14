import { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { DatabaseService } from '@/firebase/database';
import type { Course } from '@/firebase/database';
import { BookOpen, Clock, ArrowRight, Loader2, GraduationCap, Shield, Zap, Search, X, Users, BarChart3, CheckCircle2, Star, Gift, Timer } from 'lucide-react';
import { funnelPath } from '@/utils/funnelPath';

export default function FunnelLanding() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [courseSearch, setCourseSearch] = useState('');
  const [courseCategoryFilter, setCourseCategoryFilter] = useState('all');
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  const closeModal = useCallback(() => setSelectedCourse(null), []);

  // 6-hour countdown timer (persisted per session via sessionStorage)
  const [timeLeft, setTimeLeft] = useState(() => {
    const key = 'revo_free_course_deadline';
    const stored = sessionStorage.getItem(key);
    if (stored) {
      const remaining = Math.max(0, parseInt(stored, 10) - Date.now());
      return remaining;
    }
    const deadline = Date.now() + 6 * 60 * 60 * 1000;
    sessionStorage.setItem(key, String(deadline));
    return 6 * 60 * 60 * 1000;
  });

  useEffect(() => {
    if (timeLeft <= 0) return;
    const interval = setInterval(() => {
      const key = 'revo_free_course_deadline';
      const deadline = parseInt(sessionStorage.getItem(key) || '0', 10);
      const remaining = Math.max(0, deadline - Date.now());
      setTimeLeft(remaining);
      if (remaining <= 0) clearInterval(interval);
    }, 1000);
    return () => clearInterval(interval);
  }, [timeLeft > 0]);

  const formatCountdown = (ms: number) => {
    const h = Math.floor(ms / 3600000);
    const m = Math.floor((ms % 3600000) / 60000);
    const s = Math.floor((ms % 60000) / 1000);
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    if (selectedCourse) {
      document.body.style.overflow = 'hidden';
      const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') closeModal(); };
      window.addEventListener('keydown', handleEsc);
      return () => { document.body.style.overflow = ''; window.removeEventListener('keydown', handleEsc); };
    }
  }, [selectedCourse, closeModal]);

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
    const filtered = courses.filter((course) => {
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
    return DatabaseService.sortCoursesNewestFirst(filtered);
  }, [courses, courseSearch, courseCategoryFilter]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
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
                  src="/revoquest%20logo.png"
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
              <Link to={funnelPath('/login')} className="text-sm font-medium text-orange-400 hover:text-white transition-colors">
                Login
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero section */}
      <section className="relative z-10 min-h-[85vh] flex items-center justify-center overflow-hidden">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover -z-20"
        >
          <source src="/The_class_must_be_busy_099ffbf5e4.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/90 via-slate-950/75 to-slate-950" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_0%,rgba(249,115,22,0.12),transparent)]" />

        <div className="relative z-10 container mx-auto max-w-5xl px-4 py-20 text-center">
          {timeLeft > 0 && (
            <div className="inline-flex items-center gap-3 rounded-full border border-green-500/50 bg-green-500/10 px-5 py-2.5 text-sm font-semibold text-green-300 mb-4 shadow-lg shadow-green-500/10 animate-pulse">
              <Gift className="h-5 w-5 text-green-400" />
              <span>You qualify for a FREE course!</span>
              <span className="flex items-center gap-1.5 rounded-full bg-green-500/20 px-3 py-1 text-xs font-bold text-green-200 tabular-nums">
                <Timer className="h-3.5 w-3.5" />
                {formatCountdown(timeLeft)}
              </span>
            </div>
          )}
          <div className="inline-flex items-center gap-2 rounded-full border border-orange-500/40 bg-orange-500/15 px-4 py-2 text-sm font-medium text-orange-300 mb-8 shadow-lg shadow-orange-500/10">
            <Shield className="h-4 w-4" />
            <span>Accredited qualifications | Secure payment | Instant access</span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl max-w-4xl mx-auto leading-tight">
            Start your journey with{' '}
            <span className="bg-gradient-to-r from-orange-400 via-orange-500 to-amber-500 bg-clip-text text-transparent">
              Revo Learn
            </span>
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Earn accredited qualifications from industry experts, advance your career, and get instant access to your learner dashboard. Choose from our courses below and pay securely.
          </p>

          {/* Trust row */}
          <div className="mt-12 flex flex-wrap justify-center gap-8 sm:gap-12 text-slate-400">
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
            {timeLeft > 0 && (
              <div className="mb-6 rounded-xl border border-green-600/40 bg-gradient-to-r from-green-900/30 to-emerald-900/20 p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-green-500/20">
                  <Gift className="h-6 w-6 text-green-400" />
                </div>
                <div className="flex-1">
                  <p className="text-base font-bold text-green-300">Your first course is FREE!</p>
                  <p className="text-sm text-green-400/80 mt-0.5">New users get their first course at no cost. Choose any course below and enroll with your ID number.</p>
                </div>
                <div className="flex items-center gap-2 rounded-lg bg-green-500/15 border border-green-500/30 px-4 py-2">
                  <Timer className="h-4 w-4 text-green-400" />
                  <span className="text-lg font-bold text-green-300 tabular-nums">{formatCountdown(timeLeft)}</span>
                </div>
              </div>
            )}
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
                    onClick={() => setSelectedCourse(course)}
                    className="group flex flex-col rounded-2xl border border-slate-700/80 bg-slate-900/60 backdrop-blur-sm p-6 transition-all duration-300 hover:border-orange-500/40 hover:shadow-xl hover:shadow-orange-500/5 cursor-pointer"
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
                        onClick={(e) => e.stopPropagation()}
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

      {/* Course Detail Modal */}
      {selectedCourse && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={closeModal}
        >
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
          <div
            className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-700/80 bg-slate-900 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-700 transition"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Thumbnail */}
            {selectedCourse.thumbnail ? (
              <img
                src={selectedCourse.thumbnail}
                alt=""
                className="h-56 w-full object-cover rounded-t-2xl"
              />
            ) : (
              <div className="flex h-56 items-center justify-center rounded-t-2xl bg-gradient-to-br from-slate-800 to-slate-800/80">
                <BookOpen className="h-16 w-16 text-slate-600" />
              </div>
            )}

            <div className="p-6 sm:p-8">
              {/* Category & Level */}
              <div className="flex flex-wrap items-center gap-2 mb-3">
                {selectedCourse.category && (
                  <span className="rounded-md bg-orange-500/15 border border-orange-500/30 px-2.5 py-1 text-xs font-medium text-orange-300">
                    {selectedCourse.category}
                  </span>
                )}
                {selectedCourse.level && (
                  <span className="rounded-md bg-slate-800 px-2.5 py-1 text-xs font-medium text-slate-400">
                    {selectedCourse.level}
                  </span>
                )}
                {selectedCourse.complianceStatus && (
                  <span className={`rounded-md px-2.5 py-1 text-xs font-medium ${
                    selectedCourse.complianceStatus === 'Compliant'
                      ? 'bg-green-500/15 border border-green-500/30 text-green-300'
                      : 'bg-yellow-500/15 border border-yellow-500/30 text-yellow-300'
                  }`}>
                    {selectedCourse.complianceStatus}
                  </span>
                )}
              </div>

              <h2 className="text-2xl font-bold text-white">{selectedCourse.title}</h2>
              <p className="mt-3 text-slate-300 leading-relaxed">{selectedCourse.description}</p>
              {selectedCourse.shortDescription && selectedCourse.shortDescription !== selectedCourse.description && (
                <p className="mt-2 text-sm text-slate-400 italic">{selectedCourse.shortDescription}</p>
              )}

              {/* Stats row */}
              <div className="mt-6 flex flex-wrap items-center gap-5 text-sm text-slate-400">
                {selectedCourse.duration && (
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4 text-slate-500" />
                    {selectedCourse.duration}
                  </span>
                )}
                {(selectedCourse.lessons > 0) && (
                  <span className="flex items-center gap-1.5">
                    <BookOpen className="h-4 w-4 text-slate-500" />
                    {selectedCourse.lessons} lessons
                  </span>
                )}
                {((selectedCourse.enrolledLearners ?? 0) > 0 || (selectedCourse.enrolledStudents ?? 0) > 0) && (
                  <span className="flex items-center gap-1.5">
                    <Users className="h-4 w-4 text-slate-500" />
                    {(selectedCourse.enrolledLearners || selectedCourse.enrolledStudents || 0).toLocaleString()} enrolled
                  </span>
                )}
                {selectedCourse.rating > 0 && (
                  <span className="flex items-center gap-1.5">
                    <Star className="h-4 w-4 text-amber-500" />
                    {selectedCourse.rating.toFixed(1)}
                  </span>
                )}
                {selectedCourse.language && (
                  <span className="flex items-center gap-1.5">
                    <BarChart3 className="h-4 w-4 text-slate-500" />
                    {selectedCourse.language}
                  </span>
                )}
              </div>

              {/* SAQA / SETA info */}
              {selectedCourse.saqaId && (
                <p className="mt-4 text-sm text-slate-400">
                  <span className="font-medium text-slate-300">SAQA ID:</span> {selectedCourse.saqaId}
                </p>
              )}

              {/* Requirements */}
              {selectedCourse.requirements && selectedCourse.requirements.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider mb-2">Requirements</h3>
                  <ul className="space-y-1.5">
                    {selectedCourse.requirements.map((req, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-400">
                        <CheckCircle2 className="h-4 w-4 text-orange-500/70 mt-0.5 shrink-0" />
                        {req}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Learning Outcomes */}
              {selectedCourse.learningOutcomes && selectedCourse.learningOutcomes.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider mb-2">What you'll learn</h3>
                  <ul className="grid gap-1.5 sm:grid-cols-2">
                    {selectedCourse.learningOutcomes.map((outcome, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-400">
                        <CheckCircle2 className="h-4 w-4 text-green-500/70 mt-0.5 shrink-0" />
                        {outcome}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Modules / Units overview */}
              {(selectedCourse.modules ?? selectedCourse.units ?? []).length > 0 && (
                <div className="mt-6">
                  <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider mb-2">Course content</h3>
                  <div className="space-y-2">
                    {(selectedCourse.modules ?? selectedCourse.units ?? []).map((mod, i) => (
                      <div key={mod.id ?? i} className="rounded-lg border border-slate-700/60 bg-slate-800/40 px-4 py-3">
                        <p className="text-sm font-medium text-slate-200">{mod.title}</p>
                        {mod.description && (
                          <p className="mt-1 text-xs text-slate-500">{mod.description}</p>
                        )}
                        {mod.lessons?.length > 0 && (
                          <p className="mt-1 text-xs text-slate-500">{mod.lessons.length} lessons</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Price & Enroll */}
              <div className="mt-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-6 border-t border-slate-700/80">
                <p className="text-3xl font-bold text-orange-400">
                  {formatPrice(selectedCourse.price ?? 0)}
                  {(selectedCourse.price ?? 0) > 0 && (
                    <span className="text-sm font-normal text-slate-500 ml-1">one-time</span>
                  )}
                </p>
                <Link
                  to={funnelPath(`/checkout/${selectedCourse.id}`)}
                  onClick={closeModal}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-6 py-3.5 font-semibold text-white shadow-lg shadow-orange-500/20 transition hover:bg-orange-600 hover:shadow-orange-500/30 text-lg"
                >
                  Enroll Now
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}