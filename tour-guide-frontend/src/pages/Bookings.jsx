import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CalendarDays, Car, MapPin, Phone, Route, Users } from 'lucide-react';
import api, { clearSession, getImageUrl } from '../api';

export default function Bookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancelling, setCancelling] = useState('');
  const navigate = useNavigate();

  const loadBookings = useCallback(async () => {
    try { const response = await api.get('/bookings/mine'); setBookings(response.data); }
    catch (requestError) { if (requestError.response?.status === 401) { clearSession(); navigate('/login'); } else setError('Could not load your trips. Please try again.'); }
    finally { setLoading(false); }
  }, [navigate]);

  useEffect(() => { if (!localStorage.getItem('token')) navigate('/login'); else loadBookings(); }, [loadBookings, navigate]);

  const cancelBooking = async (booking) => {
    if (!window.confirm(`Cancel your trip to ${booking.destination}?`)) return;
    setCancelling(booking._id); setError('');
    try { await api.patch(`/bookings/${booking._id}/cancel`); await loadBookings(); }
    catch (requestError) { setError(requestError.response?.data?.message || 'Could not cancel this booking.'); }
    finally { setCancelling(''); }
  };

  const active = bookings.filter((item) => item.status !== 'cancelled');
  const cancelled = bookings.filter((item) => item.status === 'cancelled');

  const BookingCard = ({ booking }) => <article className={`card overflow-hidden ${booking.status === 'cancelled' ? 'opacity-65' : ''}`}><div className="grid md:grid-cols-[220px_1fr]"><div className="h-52 bg-slate-100 md:h-full">{booking.driver?.image ? <img src={getImageUrl(booking.driver.image)} alt={booking.driver.name} className="h-full w-full object-cover" /> : <div className="grid h-full place-items-center text-slate-400"><Car /></div>}</div><div className="p-6 sm:p-7"><div className="flex flex-wrap items-start justify-between gap-3"><div><span className={`inline-block rounded-full px-3 py-1 text-xs font-bold ${booking.status === 'cancelled' ? 'bg-slate-100 text-slate-600' : 'bg-emerald-50 text-emerald-700'}`}>{booking.status === 'cancelled' ? 'Cancelled' : 'Confirmed'}</span><h3 className="mt-3 font-serif text-3xl font-bold">{booking.destination}</h3></div><p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Ref {booking._id.slice(-6).toUpperCase()}</p></div><div className="mt-5 grid gap-3 text-sm text-slate-600 sm:grid-cols-2"><p className="flex items-center gap-2"><CalendarDays size={17} className="text-teal-700" /> {new Date(booking.tripDate).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })}</p><p className="flex items-center gap-2"><Users size={17} className="text-teal-700" /> {booking.partySize || 1} traveller{booking.partySize === 1 ? '' : 's'}</p><p className="flex items-center gap-2"><Car size={17} className="text-teal-700" /> {booking.driver?.name || 'Driver unavailable'}</p>{booking.driver?.phoneNumber && <p className="flex items-center gap-2"><Phone size={17} className="text-teal-700" /> {booking.driver.phoneNumber}</p>}</div>{booking.notes && <p className="mt-5 rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-600">“{booking.notes}”</p>}{booking.status !== 'cancelled' && <div className="mt-6 border-t border-slate-100 pt-5"><button disabled={cancelling === booking._id} onClick={() => cancelBooking(booking)} className="text-sm font-bold text-red-700 hover:text-red-800">{cancelling === booking._id ? 'Cancelling...' : 'Cancel booking'}</button></div>}</div></div></article>;

  return <main><section className="bg-[#eadfca] py-16"><div className="page-shell"><p className="eyebrow">Your travel dashboard</p><h1 className="mt-3 font-serif text-5xl font-semibold text-slate-900">My trips</h1><p className="mt-4 max-w-xl text-slate-600">Everything you need for your upcoming journeys, organised in one place.</p></div></section><section className="page-shell py-14">{error && <div className="mb-7 rounded-2xl bg-red-50 p-4 text-red-700">{error}</div>}{loading ? <div className="space-y-5">{[1,2].map((n) => <div key={n} className="h-72 animate-pulse rounded-3xl bg-slate-200" />)}</div> : bookings.length === 0 ? <div className="card px-6 py-20 text-center"><span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-teal-50 text-teal-700"><Route size={30} /></span><h2 className="mt-5 font-serif text-3xl font-bold">Your next story is waiting</h2><p className="mx-auto mt-3 max-w-md text-slate-500">Choose a trusted local driver and start planning a journey across the island.</p><Link to="/drivers" className="primary-button mt-7"><MapPin size={17} /> Find a driver</Link></div> : <div className="space-y-12">{active.length > 0 && <div><div className="mb-6 flex items-end justify-between"><div><p className="eyebrow">Coming up</p><h2 className="mt-2 font-serif text-3xl font-bold">Upcoming journeys</h2></div><span className="text-sm text-slate-500">{active.length} active</span></div><div className="space-y-5">{active.map((booking) => <BookingCard key={booking._id} booking={booking} />)}</div></div>}{cancelled.length > 0 && <div><h2 className="mb-5 font-serif text-2xl font-bold text-slate-600">Past cancellations</h2><div className="space-y-5">{cancelled.map((booking) => <BookingCard key={booking._id} booking={booking} />)}</div></div>}</div>}</section></main>;
}
