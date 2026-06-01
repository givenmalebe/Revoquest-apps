import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  verifyPasswordResetCode,
  confirmPasswordReset,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { auth } from "@/firebase/config";
import { Lock, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import revoquestLogo from "@/assets/revoquest-logo.png";

export default function SetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const oobCode = searchParams.get("oobCode");
  const mode = searchParams.get("mode");
  const rawContinueUrl = searchParams.get("continueUrl") || "/lms";
  const continueUrl = rawContinueUrl.startsWith("http")
    ? (() => {
        try {
          const u = new URL(rawContinueUrl);
          return u.pathname + u.search || "/lms";
        } catch {
          return "/lms";
        }
      })()
    : rawContinueUrl.startsWith("/")
      ? rawContinueUrl
      : "/lms";

  const [email, setEmail] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (mode !== "resetPassword" || !oobCode) {
      setError("Invalid or missing link. Please use the link from your email.");
      setLoading(false);
      return;
    }
    verifyPasswordResetCode(auth, oobCode)
      .then((userEmail) => {
        setEmail(userEmail);
        setError(null);
      })
      .catch(() => {
        setError("This link has expired or is invalid. Please request a new one.");
      })
      .finally(() => setLoading(false));
  }, [mode, oobCode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!oobCode || !password || password !== confirmPassword) {
      setError(
        password !== confirmPassword
          ? "Passwords do not match."
          : "Please enter and confirm your password."
      );
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      await confirmPasswordReset(auth, oobCode, password);
      setSuccess(true);
      if (email) {
        await signInWithEmailAndPassword(auth, email, password);
      }
      setTimeout(() => {
        navigate(continueUrl.startsWith("/") ? continueUrl : "/lms", {
          replace: true,
        });
      }, 1500);
    } catch (err: unknown) {
      const message =
        err && typeof err === "object" && "message" in err
          ? String((err as { message: string }).message)
          : "Failed to set password. The link may have expired.";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <img
            src={revoquestLogo}
            alt="Revo Quest"
            className="h-14 w-auto"
          />
        </div>
        <div className="rounded-2xl border border-slate-700 bg-slate-900/60 p-8">
          {loading && (
            <div className="flex flex-col items-center gap-4 py-8">
              <Loader2 className="h-10 w-10 animate-spin text-orange-500" />
              <p className="text-slate-400">Checking your link…</p>
            </div>
          )}

          {!loading && error && !success && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-red-400">
                <AlertCircle className="h-5 w-5 shrink-0" />
                <p>{error}</p>
              </div>
              <a
                href="https://revoquest.co.za"
                className="block text-center text-orange-500 hover:underline"
              >
                Back to Revo Quest
              </a>
            </div>
          )}

          {!loading && !error && email && !success && (
            <>
              <h1 className="text-xl font-bold text-white">Create your password</h1>
              <p className="mt-2 text-sm text-slate-400">
                Account: <span className="text-slate-300">{email}</span>
              </p>
              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300">
                    New password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    minLength={6}
                    required
                    className="mt-1 w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2.5 text-white placeholder-slate-500 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                    placeholder="At least 6 characters"
                    autoComplete="new-password"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300">
                    Confirm password
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    minLength={6}
                    required
                    className="mt-1 w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2.5 text-white placeholder-slate-500 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                    placeholder="Confirm your password"
                    autoComplete="new-password"
                  />
                </div>
                {error && (
                  <p className="text-sm text-red-400">{error}</p>
                )}
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-orange-500 py-3 font-semibold text-white transition hover:bg-orange-600 disabled:opacity-60"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" /> Setting password…
                    </>
                  ) : (
                    <>
                      <Lock className="h-5 w-5" /> Create password
                    </>
                  )}
                </button>
              </form>
            </>
          )}

          {success && (
            <div className="py-6 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-500/20 text-green-500">
                <CheckCircle className="h-8 w-8" />
              </div>
              <h2 className="mt-4 text-lg font-semibold text-white">
                Password created
              </h2>
              <p className="mt-2 text-slate-400">
                Redirecting you to your dashboard…
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
