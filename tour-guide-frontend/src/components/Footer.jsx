import { ArrowUpRight, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="mt-20 bg-[#10231d] text-white">
      <div className="page-shell grid gap-10 py-14 md:grid-cols-[1.5fr_1fr_1fr]">
        <div>
          <div className="mb-4 flex items-center gap-2 text-xl font-bold"><MapPin className="text-amber-300" /> Ceylon Explorer</div>
          <p className="max-w-sm text-sm leading-6 text-white/65">Thoughtful journeys, trusted local drivers, and Sri Lanka&apos;s most memorable places—all in one simple travel companion.</p>
        </div>
        <div>
          <p className="mb-4 text-xs font-bold uppercase tracking-[.2em] text-amber-300">Explore</p>
          <div className="space-y-3 text-sm text-white/70"><Link className="block hover:text-white" to="/">Destinations</Link><Link className="block hover:text-white" to="/drivers">Find a driver</Link><Link className="block hover:text-white" to="/bookings">My bookings</Link></div>
        </div>
        <div>
          <p className="mb-4 text-xs font-bold uppercase tracking-[.2em] text-amber-300">Start planning</p>
          <Link to="/drivers" className="inline-flex items-center gap-2 text-sm font-bold hover:text-amber-200">Browse local drivers <ArrowUpRight size={16} /></Link>
        </div>
      </div>
      <div className="border-t border-white/10 py-5 text-center text-xs text-white/45">© {new Date().getFullYear()} Ceylon Explorer. Built for remarkable journeys.</div>
    </footer>
  );
}
