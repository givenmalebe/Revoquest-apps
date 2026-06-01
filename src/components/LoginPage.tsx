import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Eye, EyeOff, LogIn, User, Lock, ArrowLeft, Sparkles } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import revoquestLogo from "@/assets/revoquest-logo.png";

interface LoginPageProps {
  onLogin?: (email: string, password: string) => Promise<void>;
  /** When set, show this back link and use for navigation */
  backHref?: string;
  /** Label for the back link */
  backLabel?: string;
  /** Override logo src (e.g. funnel Revo Learn logo) */
  logoSrc?: string;
  /** Redirect here after successful login (e.g. /lms for funnel) */
  successRedirect?: string;
  /** Subtitle under "Welcome Back" */
  description?: string;
  /** Footer line (e.g. copyright); if omitted, default RevoQuest footer is shown */
  footerText?: string;
  /** If true, hide the back button (e.g. when used inside a layout with its own nav) */
  hideBackButton?: boolean;
  /** If true, hide the small footer line below the card (e.g. when parent shows full Footer) */
  hideFooterLine?: boolean;
}

export const LoginPage = ({
  onLogin,
  backHref = "/",
  backLabel = "Back to Website",
  logoSrc: logoSrcProp,
  successRedirect,
  description = "Sign in to access your learning dashboard",
  footerText,
  hideBackButton = false,
  hideFooterLine = false,
}: LoginPageProps) => {
  const navigate = useNavigate();
  const { login, resetPassword } = useAuth();
  const logo = logoSrcProp ?? revoquestLogo;
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [error, setError] = useState("");
  const [resetMessage, setResetMessage] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError(""); // Clear error when user types
    setResetMessage("");
  };

  const handleForgotPassword = async () => {
    const email = formData.email.trim();
    setError("");
    setResetMessage("");

    if (!email) {
      setError("Enter your email address first, then click Forgot password.");
      return;
    }

    setIsResettingPassword(true);
    try {
      await resetPassword(email);
      setResetMessage("Password reset email sent. Please check your inbox and spam folder.");
    } catch (error: any) {
      if (error.code === 'auth/invalid-email' || error.code === 'functions/invalid-argument') {
        setError("Please enter a valid email address.");
      } else if (error.code === 'auth/user-not-found' || error.code === 'functions/not-found') {
        setError("No account found with this email address.");
      } else if (error.code === 'auth/too-many-requests' || error.code === 'functions/resource-exhausted') {
        setError("Too many reset attempts. Please try again later.");
      } else {
        setError(error.message || "Could not send password reset email. Please try again.");
      }
    } finally {
      setIsResettingPassword(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      if (onLogin) {
        await onLogin(formData.email, formData.password);
      } else {
        await login(formData.email, formData.password);
      }
      if (successRedirect) {
        navigate(successRedirect);
      }
    } catch (error: any) {
      // Handle Firebase auth errors
      if (error.code === 'auth/user-not-found') {
        setError("No account found with this email address.");
      } else if (error.code === 'auth/wrong-password') {
        setError("Incorrect password. Please try again.");
      } else if (error.code === 'auth/invalid-credential') {
        setError("Email or password is incorrect. Please try again.");
      } else if (error.code === 'auth/invalid-email') {
        setError("Please enter a valid email address.");
      } else if (error.code === 'auth/too-many-requests') {
        setError("Too many failed attempts. Please try again later.");
      } else if (error.code === 'auth/user-disabled') {
        setError("This account has been disabled. Please contact support.");
      } else {
        setError(error.message || "Login failed. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-orange-50/50 dark:from-slate-900 dark:via-slate-800 dark:to-orange-900/20 relative overflow-hidden">
      {/* Enhanced Background Elements */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(251,146,60,0.15),transparent_60%)] dark:bg-[radial-gradient(circle_at_20%_30%,rgba(251,146,60,0.2),transparent_60%)]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_70%,rgba(59,130,246,0.1),transparent_60%)] dark:bg-[radial-gradient(circle_at_80%_70%,rgba(59,130,246,0.15),transparent_60%)]"></div>

      {/* Animated background shapes */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-orange-200/30 dark:bg-orange-800/20 rounded-full blur-xl animate-pulse"></div>
      <div className="absolute bottom-20 right-10 w-24 h-24 bg-blue-200/30 dark:bg-blue-800/20 rounded-full blur-xl animate-pulse" style={{ animationDelay: "2s" }}></div>
      <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-green-200/20 dark:bg-green-800/20 rounded-full blur-lg animate-pulse" style={{ animationDelay: "4s" }}></div>

      {/* Back Button */}
      {!hideBackButton && (
        <div className="absolute top-6 left-6 z-20">
          <Button
            variant="outline"
            onClick={() => window.location.href = backHref}
            className="flex items-center gap-2 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm hover:bg-white dark:hover:bg-slate-700 border-orange-200 dark:border-orange-800 shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <ArrowLeft className="w-4 h-4" />
            {backLabel}
          </Button>
        </div>
      )}

      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Logo Section - KEPT EXACTLY AS IS */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-6">
              <img
                src={logo}
                alt="Logo"
                className="w-48 h-48 object-contain"
              />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Welcome Back</h1>
            <p className="text-muted-foreground">{description}</p>
          </div>

          {/* Enhanced Login Form */}
          <Card className="shadow-2xl border-0 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-transparent to-blue-500/5"></div>

            <CardHeader className="relative pb-6 pt-8">
              <div className="text-center">
                <div className="inline-flex items-center gap-2 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-900/40 dark:to-orange-800/40 rounded-2xl flex items-center justify-center shadow-lg">
                    <LogIn className="w-6 h-6 text-orange-600" />
                  </div>
                  <CardTitle className="text-3xl font-bold bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 dark:from-slate-200 dark:via-slate-100 dark:to-slate-200 bg-clip-text text-transparent">
                    Sign In
                  </CardTitle>
                </div>
                <CardDescription className="text-lg text-slate-600 dark:text-slate-300">
                  Enter your credentials to access the LMS
                </CardDescription>
              </div>
            </CardHeader>

            <CardContent className="relative space-y-6 px-8 pb-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email Field */}
                <div className="space-y-3">
                  <Label htmlFor="email" className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Email Address
                  </Label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-slate-400 group-focus-within:text-orange-500 transition-colors" />
                    </div>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="pl-12 h-12 text-base border-2 border-slate-200 dark:border-slate-700 focus:border-orange-500 dark:focus:border-orange-400 rounded-xl transition-all duration-300 hover:border-slate-300 dark:hover:border-slate-600"
                      required
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div className="space-y-3">
                  <Label htmlFor="password" className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    Password
                  </Label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-orange-500 transition-colors" />
                    </div>
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="pl-12 pr-12 h-12 text-base border-2 border-slate-200 dark:border-slate-700 focus:border-orange-500 dark:focus:border-orange-400 rounded-xl transition-all duration-300 hover:border-slate-300 dark:hover:border-slate-600"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-12 px-4 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5 text-slate-400 hover:text-orange-500 transition-colors" />
                      ) : (
                        <Eye className="h-5 w-5 text-slate-400 hover:text-orange-500 transition-colors" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="flex justify-end -mt-2">
                  <Button
                    type="button"
                    variant="link"
                    className="h-auto p-0 text-sm font-semibold text-orange-600 hover:text-orange-700"
                    onClick={handleForgotPassword}
                    disabled={isLoading || isResettingPassword}
                  >
                    {isResettingPassword ? "Sending reset email..." : "Forgot password?"}
                  </Button>
                </div>

                {/* Error Message */}
                {error && (
                  <Alert variant="destructive" className="border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20">
                    <AlertDescription className="text-red-700 dark:text-red-300">{error}</AlertDescription>
                  </Alert>
                )}

                {resetMessage && (
                  <Alert className="border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20">
                    <AlertDescription className="text-emerald-700 dark:text-emerald-300">{resetMessage}</AlertDescription>
                  </Alert>
                )}

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full h-14 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 rounded-xl group"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Signing In...
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <LogIn className="w-5 h-5 group-hover:scale-110 transition-transform" />
                      Sign In
                      <Sparkles className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    </div>
                  )}
                </Button>
              </form>

            </CardContent>
          </Card>

          {/* Enhanced Footer */}
          {!hideFooterLine && (
            <div className="text-center mt-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-full border border-slate-200 dark:border-slate-700 shadow-lg">
                <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                <p className="text-sm text-slate-600 dark:text-slate-300 font-medium">
                  {footerText ?? "© 2024 RevoQuest Institute. All rights reserved."}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};