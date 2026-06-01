import { FunnelHeader } from '@/components/funnel/FunnelHeader';
import { AboutUs } from '@/pages/AboutUs';

export default function FunnelAbout() {
  return (
    <div className="min-h-screen bg-slate-950">
      <FunnelHeader />
      <AboutUs skipHeader skipFooter revoLearn />
    </div>
  );
}
