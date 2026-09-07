import { useCallback, useEffect, useState } from 'react';
import { ArrowLeft, CalendarDays, Car, Edit3, MapPin, Plus, Route, Save, Trash2, Users, X } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api, { getImageUrl } from '../api';
import { Alert, EmptyState, SkeletonCards, Toast } from '../components/ui';

const formatDate = (value) => new Date(value).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });
const dateOnly = (value) => value?.slice(0, 10);

export default function SavedItineraries() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [plans, setPlans] = useState([]);
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState('');
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState('');

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const response = await api.get(id ? `/trip-planner/mine/${id}` : '/trip-planner/mine');
      if (id) { setPlan(response.data); setTitle(response.data.title); } else setPlans(response.data);
    } catch (e) { setError(e.response?.data?.message || 'Could not load saved itineraries'); }
    finally { setLoading(false); }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const rename = async (event) => {
    event.preventDefault(); setBusy(true); setError('');
    try { const response = await api.patch(`/trip-planner/mine/${id}`, { title }); setPlan(response.data); setTitle(response.data.title); setEditing(false); setToast('Itinerary renamed.'); }
    catch (e) { setError(e.response?.data?.message || 'Could not rename itinerary'); }
    finally { setBusy(false); }
  };

  const remove = async (planId, planTitle) => {
    if (!window.confirm(`Delete “${planTitle}”? This cannot be undone.`)) return;
    setBusy(true); setError('');
    try {
      await api.delete(`/trip-planner/mine/${planId}`);
      if (id) navigate('/traveler/itineraries', { replace: true });
      else { setPlans((current) => current.filter((item) => item._id !== planId)); setToast('Itinerary deleted.'); }
    } catch (e) { setError(e.response?.data?.message || 'Could not delete itinerary'); }
    finally { setBusy(false); }
  };

  if (loading) return <main className="page-shell py-16"><SkeletonCards count={3} /></main>;
  if (id && !plan) return <main className="page-shell py-16"><Alert>{error || 'Itinerary not found'}</Alert><Link className="secondary-button mt-6" to="/traveler/itineraries"><ArrowLeft size={17}/>Back to itineraries</Link></main>;
  return id ? <ItineraryDetail plan={plan} editing={editing} setEditing={setEditing} title={title} setTitle={setTitle} rename={rename} remove={remove} busy={busy} error={error} toast={toast} setToast={setToast} /> : <ItineraryList plans={plans} remove={remove} busy={busy} error={error} toast={toast} setToast={setToast} />;
}

function ItineraryList({ plans, remove, busy, error, toast, setToast }) {
  return <main className="min-h-screen bg-[#f4f1e9]"><header className="bg-[#123a30] py-14 text-white"><div className="page-shell"><p className="text-xs font-bold uppercase tracking-[.22em] text-amber-300">Traveler workspace</p><h1 className="mt-3 font-serif text-5xl font-semibold">Saved itineraries</h1><p className="mt-4 max-w-2xl text-white/65">Return to your ideas, review each day, and continue into driver booking when you are ready.</p></div></header><section className="page-shell py-12">{error&&<div className="mb-6"><Alert>{error}</Alert></div>}<div className="mb-8 flex items-end justify-between gap-4"><div><p className="eyebrow">Your plans</p><h2 className="mt-2 font-serif text-3xl font-bold">{plans.length} saved {plans.length===1?'journey':'journeys'}</h2></div><Link className="primary-button" to="/trip-planner"><Plus size={17}/>New itinerary</Link></div>{plans.length?<div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">{plans.map((item)=><article key={item._id} className="card overflow-hidden"><div className="relative h-48 bg-[#dfeae4]">{item.days?.[0]?.destination?.image?<img className="h-full w-full object-cover" src={getImageUrl(item.days[0].destination.image)} alt=""/>:<Route className="absolute left-6 top-6 text-teal-700" size={36}/>}<span className="absolute bottom-4 left-4 rounded-full bg-slate-950/70 px-3 py-1 text-xs font-bold text-white backdrop-blur">{item.days?.length || 0} days</span></div><div className="p-6"><h3 className="font-serif text-2xl font-bold">{item.title}</h3><p className="mt-3 flex items-center gap-2 text-sm text-slate-600"><CalendarDays size={16}/>{formatDate(item.startDate)} – {formatDate(item.endDate)}</p><p className="mt-2 flex items-center gap-2 text-sm text-slate-600"><MapPin size={16}/>{item.startingLocation} · {item.partySize} travelers</p><p className="mt-4 line-clamp-1 text-sm text-slate-500">{item.days?.map((day)=>day.destinationName).join(' → ')}</p><div className="mt-6 grid grid-cols-[1fr_auto] gap-2"><Link className="primary-button" to={`/traveler/itineraries/${item._id}`}>View plan</Link><button aria-label={`Delete ${item.title}`} disabled={busy} className="secondary-button !px-4 !text-red-700" onClick={()=>remove(item._id,item.title)}><Trash2 size={17}/></button></div></div></article>)}</div>:<EmptyState icon={Route} title="No saved itineraries yet" description="Use the trip planner to create and save your first island journey." action={<Link className="primary-button" to="/trip-planner">Plan a trip</Link>}/>}</section><Toast message={toast} onClose={()=>setToast('')}/></main>;
}

function ItineraryDetail({ plan, editing, setEditing, title, setTitle, rename, remove, busy, error, toast, setToast }) {
  const destinations = plan.days.map((day)=>day.destinationName).join(', ');
  const driverUrl = `/drivers?startDate=${dateOnly(plan.startDate)}&endDate=${dateOnly(plan.endDate)}&vehicleType=${encodeURIComponent(plan.preferredVehicle||'')}&partySize=${plan.partySize}&destination=${encodeURIComponent(destinations)}&itineraryId=${plan._id}`;
  return <main className="min-h-screen bg-[#f4f1e9]"><header className="bg-[#123a30] py-12 text-white"><div className="page-shell"><Link to="/traveler/itineraries" className="flex items-center gap-2 text-sm font-bold text-emerald-100/75 hover:text-white"><ArrowLeft size={17}/>All saved itineraries</Link><div className="mt-7 flex flex-col justify-between gap-6 lg:flex-row lg:items-end"><div>{editing?<form onSubmit={rename} className="flex max-w-xl gap-2"><input autoFocus maxLength="120" required className="field !bg-white !text-slate-900" value={title} onChange={(e)=>setTitle(e.target.value)}/><button disabled={busy} className="primary-button !bg-amber-300 !text-slate-950"><Save size={17}/>Save</button><button type="button" className="secondary-button !border-white/25 !text-white" onClick={()=>{setTitle(plan.title);setEditing(false)}}><X size={17}/></button></form>:<><p className="text-xs font-bold uppercase tracking-[.22em] text-amber-300">Saved itinerary</p><h1 className="mt-3 font-serif text-5xl font-semibold">{plan.title}</h1></>}<p className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-white/65"><span className="flex gap-2"><CalendarDays size={17}/>{formatDate(plan.startDate)} – {formatDate(plan.endDate)}</span><span className="flex gap-2"><Users size={17}/>{plan.partySize} travelers</span><span className="flex gap-2"><MapPin size={17}/>From {plan.startingLocation}</span></p></div><div className="flex flex-wrap gap-2"><button className="secondary-button !border-white/20 !bg-white/5 !text-white" onClick={()=>setEditing(true)}><Edit3 size={17}/>Rename</button><button disabled={busy} className="secondary-button !border-red-300/30 !bg-red-950/20 !text-red-100" onClick={()=>remove(plan._id,plan.title)}><Trash2 size={17}/>Delete</button><Link className="primary-button !bg-amber-300 !text-slate-950" to={driverUrl}><Car size={17}/>Find driver</Link></div></div></div></header><section className="page-shell py-12">{error&&<div className="mb-6"><Alert>{error}</Alert></div>}<div className="mb-8 grid gap-4 sm:grid-cols-3"><Summary label="Duration" value={`${plan.days.length} days`}/><Summary label="Interests" value={plan.interests?.join(', ')||'General exploration'}/><Summary label="Budget" value={plan.budget?`LKR ${Number(plan.budget).toLocaleString()}`:'Not specified'}/></div><div className="space-y-5">{plan.days.map((day)=><article key={day.dayNumber} className="card overflow-hidden md:grid md:grid-cols-[240px_1fr]">{day.destination?.image?<img src={getImageUrl(day.destination.image)} alt={day.destinationName} className="h-56 w-full object-cover md:h-full"/>:<div className="grid h-48 place-items-center bg-[#dfeae4]"><Route className="text-teal-700" size={36}/></div>}<div className="p-6 sm:p-8"><p className="text-xs font-bold uppercase tracking-wider text-teal-700">Day {day.dayNumber} · {formatDate(day.date)}</p><h2 className="mt-2 font-serif text-3xl font-bold">{day.destinationName}</h2>{day.destination?.location&&<p className="mt-2 flex items-center gap-2 text-sm text-slate-500"><MapPin size={15}/>{day.destination.location}</p>}<div className="mt-5 flex flex-wrap gap-2">{day.activities?.map((activity)=><span key={activity} className="rounded-full bg-teal-50 px-3 py-1.5 text-xs font-semibold text-teal-900">{activity}</span>)}</div>{day.notes&&<p className="mt-5 text-sm italic leading-6 text-slate-500">{day.notes}</p>}{day.destination?.slug&&<Link className="mt-5 inline-block text-sm font-bold text-teal-700" to={`/destinations/${day.destination.slug}`}>Explore destination →</Link>}</div></article>)}</div></section><Toast message={toast} onClose={()=>setToast('')}/></main>;
}

function Summary({ label, value }) { return <article className="card p-5"><p className="text-xs font-bold uppercase tracking-wider text-slate-400">{label}</p><p className="mt-2 font-semibold capitalize text-slate-800">{value}</p></article>; }
