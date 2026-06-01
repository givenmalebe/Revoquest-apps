import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { DatabaseService } from '@/firebase/database';
import type { Course } from '@/firebase/database';
import { createYocoCheckoutForLearner } from '@/services/yocoFunnelService';
import { useAuth } from '@/contexts/AuthContext';
import { BookOpen, Loader2, CreditCard, ArrowLeft } from 'lucide-react';

export default function LMSCheckout() {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      navigate('/lms', { replace: true });
      return;
    }
    if (user.role !== 'learner') {
      navigate('/lms', { replace: true });
      return;
    }
    if (!courseId) {
      setError('No course selected.');
      setLoading(false);
      return;
    }
    let mounted = true;
    DatabaseService.getCourse(courseId)
      .then((c) => {
        if (mounted) setCourse(c ?? null);
      })
      .catch(() => {
        if (mounted) setError('Failed to load course.');
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => { mounted = false; };
  }, [courseId, user, navigate]);

  const handlePay = async () => {
    if (!course || !courseId) return;
    const price = Number(course.price ?? 0);
    if (price < 0.01) {
      setError('This course has no price set. Contact support.');
      return;
    }
    setError(null);
    setSubmitting(true);
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    const successUrl = `${baseUrl}/lms?tab=courses&paid=1`;
    const cancelUrl = `${baseUrl}/lms?tab=marketplace`;
    try {
      const result = await createYocoCheckoutForLearner({
        courseId,
        successUrl,
        cancelUrl,
      });
      if (result.success && result.redirectUrl) {
        window.location.href = result.redirectUrl;
        return;
      }
      setError(result.error || 'Could not start checkout. Please try again.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Checkout failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatPrice = (p: number) =>
    p > 0 ? `R ${Number(p).toLocaleString()}` : 'Free';

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <Loader2 className="h-10 w-10 animate-spin text-orange-500" />
      </div>
    );
  }

  if (!user || user.role !== 'learner') {
    return null;
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 px-4 py-12 text-center">
        <p className="text-slate-600 dark:text-slate-300">Course not found.</p>
        <Link to="/lms?tab=marketplace" className="mt-4 inline-block text-orange-500 hover:underline">
          Back to courses
        </Link>
      </div>
    );
  }

  const price = Number(course.price ?? 0);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100">
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/50">
        <div className="max-w-2xl mx-auto px-4 py-6">
          <Link
            to="/lms?tab=marketplace"
            className="inline-flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 hover:text-orange-600 dark:hover:text-orange-400"
          >
            <ArrowLeft className="h-4 w-4" /> Back to courses
          </Link>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-10">
        <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 shadow-lg p-6 sm:p-8">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Pay to enroll</h1>
          <p className="mt-1 text-slate-500 dark:text-slate-400">
            Complete payment to add this course to My Courses.
          </p>

          <div className="mt-6 flex gap-4">
            {course.thumbnail && course.thumbnail !== '/api/placeholder/300/200' ? (
              <img
                src={course.thumbnail}
                alt=""
                className="h-24 w-32 rounded-xl object-cover shrink-0"
              />
            ) : (
              <div className="flex h-24 w-32 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-orange-600">
                <BookOpen className="h-10 w-10 text-white" />
              </div>
            )}
            <div className="min-w-0">
              <p className="font-semibold text-slate-900 dark:text-white">{course.title}</p>
              <p className="mt-1 text-lg font-bold text-orange-600 dark:text-orange-400">
                {formatPrice(price)}
              </p>
              {course.shortDescription && (
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 line-clamp-2">
                  {course.shortDescription}
                </p>
              )}
            </div>
          </div>

          {/* Learner identity number for billing/certificate */}
          <div className="mt-6 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/40 px-4 py-3 text-sm">
            {user.identityNumber ? (
              <p className="text-slate-700 dark:text-slate-200">
                <span className="font-semibold">Identity Number (ID NO):</span>{' '}
                <span className="font-mono tracking-wide">{user.identityNumber}</span>
              </p>
            ) : (
              <p className="text-amber-700 dark:text-amber-300">
                <span className="font-semibold">Identity Number (ID NO) missing.</span>{' '}
                Please add your ID number on your profile so it appears correctly on your certificate.
              </p>
            )}
          </div>

          {price < 0.01 ? (
            <p className="mt-4 text-sm text-amber-600 dark:text-amber-400">
              This course has no price set. Please contact support to enroll.
            </p>
          ) : (
            <>
              {error && (
                <div className="mt-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-3 text-sm text-red-700 dark:text-red-200">
                  {error}
                </div>
              )}
              <button
                type="button"
                onClick={handlePay}
                disabled={submitting}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 py-3.5 font-semibold text-white shadow-lg shadow-orange-500/25 hover:bg-orange-600 disabled:opacity-60 transition-colors"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" /> Opening payment…
                  </>
                ) : (
                  <>
                    <CreditCard className="h-5 w-5" /> Pay {formatPrice(price)} with Yoco
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
