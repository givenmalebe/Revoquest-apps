import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { funnelPath } from '@/utils/funnelPath';

/** Redirect to learner dashboard. Kept for backwards compatibility with old success URLs. */
export default function FunnelSuccess() {
  const navigate = useNavigate();
  useEffect(() => {
    navigate(funnelPath('/dashboard'), { replace: true });
  }, [navigate]);
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="w-10 h-10 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
