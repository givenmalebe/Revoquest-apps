import { useAuth } from "@/contexts/AuthContext";
import { ChatProvider } from "@/contexts/ChatContext";
import { LoginPage } from "@/components/LoginPage";
import { SmartLMSLayout } from "@/components/SmartLMSLayout";
import { LearnerDashboard } from "@/components/LearnerDashboard";
import { InstructorDashboard } from "@/components/InstructorDashboard";
import { AdminDashboard } from "@/components/AdminDashboard";

export const SmartLMS = () => {
  const { isAuthenticated, user, isLoading, login } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-orange-50/30 dark:from-slate-900 dark:via-slate-800 dark:to-orange-900/10 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading SmartLMS...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage onLogin={login} />;
  }

  // Render appropriate dashboard based on user role
  const renderDashboard = () => {
    switch ((user?.role || '').toLowerCase()) {
      case 'admin':
        return <AdminDashboard />;
      case 'instructor':
        return <InstructorDashboard />;
      case 'learner':
      case 'student':
        return <LearnerDashboard />;
      default:
        return (
          <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-orange-50/30 dark:from-slate-900 dark:via-slate-800 dark:to-orange-900/10 flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-foreground mb-2">Access Denied</h1>
              <p className="text-muted-foreground">You don't have permission to access this area.</p>
            </div>
          </div>
        );
    }
  };

  return (
    <ChatProvider>
      <SmartLMSLayout>
        {renderDashboard()}
      </SmartLMSLayout>
    </ChatProvider>
  );
};
