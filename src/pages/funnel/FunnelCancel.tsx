import { Link } from 'react-router-dom';
import { XCircle, ArrowRight } from 'lucide-react';
import { funnelPath } from '@/utils/funnelPath';

export default function FunnelCancel() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center px-4">
      <div className="max-w-md w-full rounded-xl border border-slate-700 bg-slate-900/50 p-8 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-500/20 text-amber-500">
          <XCircle className="h-10 w-10" />
        </div>
        <h1 className="mt-6 text-2xl font-bold text-white">Payment cancelled</h1>
        <p className="mt-3 text-slate-400">
          No charge was made. You can return to the course list and try again when you’re ready.
        </p>
        <div className="mt-8">
          <Link
            to={funnelPath('')}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-orange-500 py-3 font-semibold text-white transition hover:bg-orange-600"
          >
            Back to courses <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
