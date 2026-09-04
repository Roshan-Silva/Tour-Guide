import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarDays, Car, Check, MapPin, Phone, Search, ShieldCheck, Star, Users, X } from 'lucide-react';
import api, { getImageUrl, getStoredUser } from '../api';

const initialForm = { destination: '', tripDate: '', partySize: 1, notes: '' };

export default function Drivers() {
  const [drivers, setDrivers] = useState([]);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [formData, setFormData] = useState(initialForm);
  const [query, setQuery] = useState('');
  const [vehicleType, setVehicleType] = useState('All');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const params = formData.tripDate ? { tripDate: formData.tripDate } : {};
    setLoading(true);
    api.get('/drivers', { params }).then((response) => setDrivers(response.data)).catch(() => setError('We could not load drivers. Please check the API connection.')).finally(() => setLoading(false));
  }, [formData.tripDate]);

  const vehicleTypes = useMemo(() => ['All', ...new Set(drivers.map((driver) => driver.vehicleType))], [drivers]);
  const filteredDrivers = drivers.filter((driver) => (vehicleType === 'All' || driver.vehicleType === vehicleType) && `${driver.name} ${driver.vehicleType}`.toLowerCase().includes(query.toLowerCase()));

  const openBooking = (driver) => {
    if (!localStorage.getItem('token')) { navigate('/login', { state: { from: '/drivers' } }); return; }
    setError(''); setSuccess(''); setSelectedDriver(driver);
  };

  const submitBooking = async (event) => {
    event.preventDefault(); setSubmitting(true); setError('');
    try {
      const user = getStoredUser();
      await api.post('/bookings/add', { ...formData, customerName: user?.name || 'Customer', driverId: selectedDriver._id });
      setSuccess(`Your journey with ${selectedDriver.name} is confirmed for ${formData.tripDate}.`);
      setSelectedDriver(null); setFormData(initialForm);
    } catch (requestError) {
      if (requestError.response?.status === 401) { navigate('/login'); return; }
      setError(requestError.response?.data?.message || 'Booking failed. Please try again.');
    } finally { setSubmitting(false); }
  };

  const minimumDate = new Date().toISOString().split('T')[0];

  return <main>
    <section className="bg-[#102f27] py-20 text-white"><div className="page-shell"><p className="mb-4 text-xs font-bold uppercase tracking-[.24em] text-amber-300">Your journey, your pace</p><h1 className="max-w-3xl font-serif text-5xl font-semibold sm:text-6xl">Meet the locals behind the wheel.</h1><p className="mt-5 max-w-2xl text-lg leading-8 text-white/65">Choose a trusted tour driver and travel with the freedom to stop, wander, and discover more.</p></div></section>
    <section className="page-shell py-14">
      <div className="card mb-10 grid gap-4 p-4 md:grid-cols-[1fr_220px_220px]">
        <label className="relative"><span className="sr-only">Search drivers</span><Search className="absolute left-4 top-3.5 text-slate-400" size={19} /><input className="field !pl-11" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by name or vehicle" /></label>
        <label><span className="sr-only">Vehicle type</span><select className="field" value={vehicleType} onChange={(e) => setVehicleType(e.target.value)}>{vehicleTypes.map((type) => <option key={type}>{type}</option>)}</select></label>
        <label className="relative"><span className="sr-only">Travel date</span><CalendarDays className="absolute left-4 top-3.5 text-slate-400" size={19} /><input className="field !pl-11" type="date" min={minimumDate} value={formData.tripDate} onChange={(e) => setFormData({ ...formData, tripDate: e.target.value })} /></label>
      </div>
      {success && <div className="mb-8 flex items-start gap-3 rounded-2xl bg-emerald-50 p-4 text-emerald-800"><Check className="mt-0.5 shrink-0" /> <div><b>Booking confirmed</b><p className="text-sm">{success} View it under My trips.</p></div></div>}
      {error && <div className="mb-8 rounded-2xl bg-red-50 p-4 text-red-700">{error}</div>}
      <div className="mb-7 flex items-end justify-between"><div><p className="eyebrow">Available guides</p><h2 className="mt-2 font-serif text-3xl font-semibold">Find your perfect match</h2></div><span className="text-sm text-slate-500">{filteredDrivers.length} {filteredDrivers.length === 1 ? 'driver' : 'drivers'}</span></div>
      {loading ? <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">{[1,2,3].map((n) => <div key={n} className="h-[430px] animate-pulse rounded-3xl bg-slate-200" />)}</div> : <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">{filteredDrivers.map((driver) => <article key={driver._id} className="card group overflow-hidden"><div className="relative h-60 overflow-hidden bg-slate-100"><img src={getImageUrl(driver.image)} alt={driver.name} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" /><span className="absolute left-4 top-4 flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 text-xs font-bold text-emerald-700 backdrop-blur"><span className="h-2 w-2 rounded-full bg-emerald-500" /> Available</span></div><div className="p-6"><div className="flex items-start justify-between"><div><h3 className="font-serif text-2xl font-bold">{driver.name}</h3><p className="mt-1 flex items-center gap-1 text-sm text-amber-600"><Star size={15} fill="currentColor" /> Local travel specialist</p></div><span className="grid h-11 w-11 place-items-center rounded-2xl bg-teal-50 text-teal-700"><Car size={20} /></span></div><div className="my-5 space-y-2 border-y border-slate-100 py-4 text-sm text-slate-600"><p className="flex items-center gap-2"><Car size={16} /> {driver.vehicleType}</p><p className="flex items-center gap-2"><Phone size={16} /> {driver.phoneNumber}</p><p className="flex items-center gap-2"><ShieldCheck size={16} /> Verified profile</p></div><button onClick={() => openBooking(driver)} className="primary-button w-full">Choose {driver.name.split(' ')[0]}</button></div></article>)}</div>}
      {!loading && filteredDrivers.length === 0 && <div className="card py-16 text-center"><Car className="mx-auto mb-4 text-teal-700" size={34} /><h3 className="text-xl font-bold">No matching drivers</h3><p className="mt-2 text-slate-500">Try another vehicle type, date, or search term.</p></div>}
    </section>

    {selectedDriver && <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-slate-950/65 p-4 backdrop-blur-sm" role="dialog" aria-modal="true"><form onSubmit={submitBooking} className="my-8 w-full max-w-xl rounded-[2rem] bg-white p-6 shadow-2xl sm:p-8"><div className="mb-7 flex items-start justify-between"><div><p className="eyebrow">Complete your booking</p><h3 className="mt-2 font-serif text-3xl font-bold">Travel with {selectedDriver.name}</h3></div><button type="button" onClick={() => setSelectedDriver(null)} className="grid h-10 w-10 place-items-center rounded-full bg-slate-100" aria-label="Close"><X size={19} /></button></div><div className="grid gap-5 sm:grid-cols-2"><label className="sm:col-span-2"><span className="mb-2 flex items-center gap-2 text-sm font-bold"><MapPin size={16} /> Destination</span><input className="field" value={formData.destination} onChange={(e) => setFormData({ ...formData, destination: e.target.value })} placeholder="Where would you like to go?" required /></label><label><span className="mb-2 flex items-center gap-2 text-sm font-bold"><CalendarDays size={16} /> Travel date</span><input className="field" type="date" min={minimumDate} value={formData.tripDate} onChange={(e) => setFormData({ ...formData, tripDate: e.target.value })} required /></label><label><span className="mb-2 flex items-center gap-2 text-sm font-bold"><Users size={16} /> Travellers</span><input className="field" type="number" min="1" max="20" value={formData.partySize} onChange={(e) => setFormData({ ...formData, partySize: e.target.value })} required /></label><label className="sm:col-span-2"><span className="mb-2 block text-sm font-bold">Anything your driver should know? <span className="font-normal text-slate-400">Optional</span></span><textarea className="field min-h-24 resize-y" maxLength="500" value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} placeholder="Pickup area, interests, accessibility needs..." /></label></div><div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end"><button type="button" onClick={() => setSelectedDriver(null)} className="secondary-button">Keep browsing</button><button disabled={submitting} className="primary-button">{submitting ? 'Confirming...' : 'Confirm booking'}</button></div></form></div>}
  </main>;
}
