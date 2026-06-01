import { FunnelHeader } from '@/components/funnel/FunnelHeader';
import { ContactPage } from '@/components/ContactPage';

export default function FunnelContact() {
  return (
    <div className="min-h-screen bg-slate-950">
      <FunnelHeader />
      <ContactPage showHeader={false} revoLearn />
    </div>
  );
}
