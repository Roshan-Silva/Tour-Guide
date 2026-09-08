import { useEffect, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, MapPin, Menu, X } from 'lucide-react';
import { clearSession, getStoredUser } from '../api';

const linkClass = ({ isActive }) => `text-sm font-semibold ${isActive ? 'text-teal-800' : 'text-slate-600 hover:text-slate-950'}`;

export default function Navbar() {
  const [user, setUser] = useState(getStoredUser());
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const updateUser = () => setUser(getStoredUser());
    window.addEventListener('auth-change', updateUser);
    window.addEventListener('storage', updateUser);
    return () => { window.removeEventListener('auth-change', updateUser); window.removeEventListener('storage', updateUser); };
  }, []);

  const logout = () => { clearSession(); setOpen(false); navigate('/'); };

  return (
    <header className="sticky top-0 z-40 border-b border-stone-200/80 bg-[#f4f1e9]/90 backdrop-blur-xl">
      <div className="page-shell flex h-20 items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5" onClick={() => setOpen(false)}>
          <span className="grid h-10 w-10 place-items-center rounded-full bg-teal-800 text-white"><MapPin size={20} /></span>
          <span><span className="block font-serif text-xl font-bold leading-none text-slate-900">Ceylon</span><span className="text-[10px] font-bold uppercase tracking-[.28em] text-teal-700">Explorer</span></span>
        </Link>
        <nav className="hidden items-center gap-7 md:flex">
          <NavLink to="/" className={linkClass}>Discover</NavLink>
          <NavLink to="/destinations" className={linkClass}>Destinations</NavLink>
          <NavLink to="/trip-planner" className={linkClass}>Trip planner</NavLink>
          <NavLink to="/drivers" className={linkClass}>Drivers</NavLink>
          {user?.role === 'traveler' && <NavLink to="/traveler" className={linkClass}>My dashboard</NavLink>}
          {user?.role === 'driver' && <NavLink to="/driver" className={linkClass}>Driver portal</NavLink>}
          {user?.role === 'driver' && <NavLink to="/driver/earnings" className={linkClass}>Earnings</NavLink>}
          {user?.role === 'admin' && <NavLink to="/admin" className={linkClass}>Admin</NavLink>}
          {user?.role === 'admin' && <NavLink to="/admin/payments" className={linkClass}>Finance</NavLink>}
        </nav>
        <div className="hidden items-center gap-3 md:flex">
          {user ? <><span className="text-sm text-slate-500">Hello, <b className="text-slate-800">{user.name?.split(' ')[0]}</b></span><button onClick={logout} className="secondary-button !px-4 !py-2">Log out</button></> : <><Link to="/login" className="px-3 py-2 text-sm font-bold text-slate-700">Sign in</Link><Link to="/signup" className="primary-button !px-5 !py-2.5">Join explorer</Link></>}
        </div>
        <button className="grid h-11 w-11 place-items-center rounded-full border border-slate-300 md:hidden" onClick={() => setOpen(!open)} aria-label="Toggle navigation">{open ? <X /> : <Menu />}</button>
      </div>
      {open && <nav className="page-shell space-y-1 border-t border-slate-200 py-4 md:hidden">
        <NavLink to="/" onClick={() => setOpen(false)} className="block rounded-xl px-4 py-3 font-semibold">Discover</NavLink>
        <NavLink to="/destinations" onClick={() => setOpen(false)} className="block rounded-xl px-4 py-3 font-semibold">Destinations</NavLink>
        <NavLink to="/trip-planner" onClick={() => setOpen(false)} className="block rounded-xl px-4 py-3 font-semibold">Trip planner</NavLink>
        <NavLink to="/drivers" onClick={() => setOpen(false)} className="block rounded-xl px-4 py-3 font-semibold">Drivers</NavLink>
        {user?.role === 'traveler' && <NavLink to="/traveler" onClick={() => setOpen(false)} className="block rounded-xl px-4 py-3 font-semibold">My dashboard</NavLink>}
        {user?.role === 'driver' && <NavLink to="/driver" onClick={() => setOpen(false)} className="block rounded-xl px-4 py-3 font-semibold">Driver portal</NavLink>}
        {user?.role === 'driver' && <NavLink to="/driver/earnings" onClick={() => setOpen(false)} className="block rounded-xl px-4 py-3 font-semibold">Earnings & payouts</NavLink>}
        {user?.role === 'admin' && <NavLink to="/admin" onClick={() => setOpen(false)} className="flex items-center gap-2 rounded-xl px-4 py-3 font-semibold"><LayoutDashboard size={18} /> Admin dashboard</NavLink>}
        {user?.role === 'admin' && <NavLink to="/admin/payments" onClick={() => setOpen(false)} className="block rounded-xl px-4 py-3 font-semibold">Finance</NavLink>}
        {user ? <button onClick={logout} className="w-full rounded-xl px-4 py-3 text-left font-semibold text-red-700">Log out</button> : <div className="grid grid-cols-2 gap-3 pt-3"><Link onClick={() => setOpen(false)} to="/login" className="secondary-button">Sign in</Link><Link onClick={() => setOpen(false)} to="/signup" className="primary-button">Join</Link></div>}
      </nav>}
    </header>
  );
}
