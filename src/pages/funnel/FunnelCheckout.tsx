import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { DatabaseService } from '@/firebase/database';
import type { Course } from '@/firebase/database';
import { createYocoCheckout, checkFunnelEmailRegistered } from '@/services/yocoFunnelService';
import { BookOpen, Loader2, ArrowLeft, CreditCard } from 'lucide-react';
import { Link } from 'react-router-dom';
const funnelLogo = '/revoquest%20logo.png';

export default function FunnelCheckout() {
  const { courseId } = useParams<{ courseId: string }>();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [identityNumber, setIdentityNumber] = useState('');

  useEffect(() => {
    if (!courseId) return;
    let mounted = true;
    (async () => {
      try {
        const c = await DatabaseService.getCourse(courseId);
        if (mounted) setCourse(c ?? null);
      } catch (e) {
        if (mounted) setError(e instanceof Error ? e.message : 'Failed to load course');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [courseId]);

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const successUrl = `${baseUrl}/funnel/dashboard?paid=1`;
  const cancelUrl = `${baseUrl}/funnel/cancel`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!course || !courseId) return;
    setError(null);
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Password and Confirm password do not match.');
      return;
    }
    setSubmitting(true);
    try {
      const { registered } = await checkFunnelEmailRegistered(email.trim());
      if (registered) {
        setError('This email is already registered. Please log in to add a course, or use a different email.');
        setSubmitting(false);
        return;
      }
      const amountCents = Math.round((course.price ?? 0) * 100);
      if (amountCents <= 0) {
        setError('This course has no price set. Please contact support.');
        setSubmitting(false);
        return;
      }
      const result = await createYocoCheckout({
        courseId,
        courseTitle: course.title,
        amountCents,
        customerEmail: email.trim(),
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        identityNumber: identityNumber.trim() || undefined,
        password: password.trim(),
        successUrl,
        cancelUrl,
      });
      if (result.success && result.redirectUrl) {
        setError(null);
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

  const formatPrice = (price: number) =>
    price > 0 ? `R ${Number(price).toLocaleString()}` : 'Free';

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <Loader2 className="h-10 w-10 animate-spin text-orange-500" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-slate-950 px-4 py-12 text-center text-slate-300">
        <p>Course not found.</p>
        <Link to="/funnel" className="mt-4 inline-block text-orange-500 hover:underline">
          Back to courses
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800">
        <div className="container mx-auto max-w-2xl px-4 py-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <Link to="/funnel" className="flex items-center gap-3">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white p-2">
                <img
                  src={funnelLogo}
                  alt="Revo Learn"
                  className="h-full w-full object-contain object-center"
                />
              </span>
              <span className="text-lg font-bold text-white">Revo Learn</span>
            </Link>
            <nav className="flex flex-wrap items-center gap-3 sm:gap-4">
              <Link to="/funnel" className="text-sm text-slate-400 hover:text-orange-400 transition-colors">Home</Link>
              <Link to="/funnel/about" className="text-sm text-slate-400 hover:text-orange-400 transition-colors">About</Link>
              <Link to="/funnel/contact" className="text-sm text-slate-400 hover:text-orange-400 transition-colors">Contact Us</Link>
              <Link to="/funnel/login" className="text-sm text-orange-400 hover:text-white transition-colors">Login</Link>
              <Link to="/funnel" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white">
                <ArrowLeft className="h-4 w-4" /> Back to courses
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="container mx-auto max-w-2xl px-4 py-10">
        <div className="rounded-xl border border-slate-700 bg-slate-900/50 p-6">
          <h1 className="text-2xl font-bold text-white">Checkout</h1>
          <div className="mt-4 flex gap-4">
            {course.thumbnail ? (
              <img
                src={course.thumbnail}
                alt=""
                className="h-24 w-32 rounded-lg object-cover"
              />
            ) : (
              <div className="flex h-24 w-32 items-center justify-center rounded-lg bg-slate-800">
                <BookOpen className="h-8 w-8 text-slate-600" />
              </div>
            )}
            <div>
              <p className="font-medium text-white">{course.title}</p>
              <p className="mt-1 text-lg font-bold text-orange-500">
                {formatPrice(course.price ?? 0)}
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            {error && (
              <div className="rounded-lg bg-red-900/30 border border-red-800 p-3 text-sm text-red-200">
                {error}
                {error.includes('already registered') && (
                  <p className="mt-2">
                    <Link to="/funnel/login" className="underline font-medium text-orange-300 hover:text-orange-200">
                      Log in here
                    </Link>
                  </p>
                )}
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-slate-300">First name *</label>
              <input
                type="text"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-white placeholder-slate-500 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                placeholder="Your first name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300">Last name *</label>
              <input
                type="text"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-white placeholder-slate-500 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                placeholder="Your last name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300">Identity Number (ID NO)</label>
              <input
                type="text"
                value={identityNumber}
                onChange={(e) => setIdentityNumber(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-white placeholder-slate-500 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                placeholder="Your ID number (for the certificate)"
              />
              <p className="mt-0.5 text-xs text-slate-500">
                This will be stored on your learner profile and shown as <span className="font-semibold">ID NO</span> on your certificate.
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300">Email *</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-white placeholder-slate-500 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300">Password *</label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-white placeholder-slate-500 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                placeholder="At least 6 characters"
              />
              <p className="mt-0.5 text-xs text-slate-500">You will use this to log in after confirming your email.</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300">Confirm password *</label>
              <input
                type="password"
                required
                minLength={6}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-white placeholder-slate-500 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                placeholder="Re-enter your password"
              />
            </div>
            <p className="text-xs text-slate-500">
              After payment we’ll create your Revo Learn account and enroll you. You can log in with this email and password at the learner dashboard. We’ll also send a verification link to this email—click it to confirm your address.
            </p>
            <button
              type="submit"
              disabled={submitting}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-orange-500 py-3 font-semibold text-white transition hover:bg-orange-600 disabled:opacity-60"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" /> Opening payment page…
                </>
              ) : (
                <>
                  <CreditCard className="h-5 w-5" /> Pay with Yoco
                </>
              )}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
