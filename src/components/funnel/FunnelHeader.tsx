import { Link } from 'react-router-dom';
const funnelLogo = '/revoquest%20logo.png';

export function FunnelHeader() {
  return (
    <header className="relative z-10 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-sm">
      <div className="container mx-auto max-w-6xl px-4 py-6">
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-between sm:items-center">
          <Link to="/funnel" className="flex items-center gap-3 group">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-white p-2 sm:h-16 sm:w-16">
              <img
                src={funnelLogo}
                alt="Revo Learn"
                className="h-full w-full object-contain object-center"
              />
            </span>
            <span className="text-xl font-bold tracking-tight text-white sm:text-2xl">
              Revo Learn
            </span>
          </Link>
          <nav className="flex items-center gap-4 sm:gap-6">
            <Link to="/funnel" className="text-sm font-medium text-slate-400 hover:text-orange-400 transition-colors">
              Home
            </Link>
            <Link to="/funnel/about" className="text-sm font-medium text-slate-400 hover:text-orange-400 transition-colors">
              About
            </Link>
            <Link to="/funnel/contact" className="text-sm font-medium text-slate-400 hover:text-orange-400 transition-colors">
              Contact Us
            </Link>
            <Link to="/funnel#courses" className="text-sm font-medium text-slate-400 hover:text-orange-400 transition-colors">
              Courses
            </Link>
            <Link to="/funnel/blog" className="text-sm font-medium text-slate-400 hover:text-orange-400 transition-colors">
              Blog
            </Link>
            <Link to="/funnel/login" className="text-sm font-medium text-orange-400 hover:text-white transition-colors">
              Login
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
