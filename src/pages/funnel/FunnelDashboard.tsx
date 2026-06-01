import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useDataSync } from '@/contexts/DataSyncContext';
import { completeEnrollmentForCurrentUser } from '@/services/yocoFunnelService';
import { ChatProvider } from '@/contexts/ChatContext';
import { FunnelLMSLayout } from '@/components/funnel/FunnelLMSLayout';
import { LearnerDashboard } from '@/components/LearnerDashboard';
import { InstructorDashboard } from '@/components/InstructorDashboard';
import { AdminDashboard } from '@/components/AdminDashboard';
import { BookOpen } from 'lucide-react';

export default function FunnelDashboard() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, isAuthenticated, isLoading } = useAuth();
  const { syncData, refreshCourses } = useDataSync();
  const [completingFirstEnrollment, setCompletingFirstEnrollment] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      const paid = searchParams.get('paid');
      navigate(paid === '1' ? '/funnel/login?paid=1' : '/funnel/login', { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate, searchParams]);

  // After payment: complete enrollment first, then show dashboard so the new user sees their course in My Courses.
  const paidHandled = useRef(false);
  useEffect(() => {
    if (!isAuthenticated || !user || user.role !== 'learner') return;
    if (searchParams.get('paid') !== '1' || paidHandled.current) return;
    paidHandled.current = true;
    setCompletingFirstEnrollment(true);
    const run = async () => {
      try {
        await completeEnrollmentForCurrentUser();
      } catch (_) {
        // Ignore: may already be enrolled via webhook
      }
      await refreshCourses?.();
      await syncData?.();
      setCompletingFirstEnrollment(false);
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        next.delete('paid');
        next.set('tab', 'courses');
        return next;
      }, { replace: true });
    };
    run();
    const t2 = window.setTimeout(() => { refreshCourses?.(); syncData?.(); }, 2000);
    const t5 = window.setTimeout(() => { refreshCourses?.(); syncData?.(); }, 5000);
    return () => { clearTimeout(t2); clearTimeout(t5); };
  }, [isAuthenticated, user, searchParams, syncData, refreshCourses]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  // When we just registered (paid=1), show "Setting up your course..." until enrollment is done so My Courses has the course when the dashboard appears.
  if (completingFirstEnrollment && user.role === 'learner') {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-14 h-14 rounded-2xl bg-orange-500/20 flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-8 h-8 text-orange-500" />
          </div>
          <p className="text-slate-200 font-medium">Setting up your course...</p>
          <p className="text-slate-500 text-sm mt-1">You’ll see it in My Courses in a moment.</p>
          <div className="w-10 h-10 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mt-6" />
        </div>
      </div>
    );
  }

  const renderDashboard = () => {
    switch (user.role) {
      case 'admin':
        return <AdminDashboard />;
      case 'instructor':
        return <InstructorDashboard />;
      case 'learner':
      default:
        return <LearnerDashboard />;
    }
  };

  const area = user.role === 'admin' ? 'admin' : user.role === 'instructor' ? 'instructor' : 'learner';

  return (
    <ChatProvider>
      <FunnelLMSLayout area={area}>
        {renderDashboard()}
      </FunnelLMSLayout>
    </ChatProvider>
  );
}
