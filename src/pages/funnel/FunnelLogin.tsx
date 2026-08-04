import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { FunnelHeader } from "@/components/funnel/FunnelHeader";
import { LoginPage } from "@/components/LoginPage";
import { funnelPath } from "@/utils/funnelPath";

const funnelLogo = "/revoquest%20logo.png";

export default function FunnelLogin() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      const paid = searchParams.get("paid");
      navigate(paid === "1" ? `${funnelPath('/dashboard')}?paid=1` : funnelPath("/dashboard"), { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate, searchParams]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <FunnelHeader />
      <main className="flex-1">
        <LoginPage
          backHref={funnelPath("")}
          backLabel="Back to Revo Learn"
          logoSrc={funnelLogo}
          successRedirect={funnelPath("/dashboard")}
          description="Sign in to access your courses and learner dashboard"
          hideFooterLine
        />
      </main>
    </div>
  );
}
