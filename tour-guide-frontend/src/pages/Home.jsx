import { ArrowRight, Binoculars, Camera, CarFront, CheckCircle2, Compass, Footprints, Map, MapPin, Palmtree, Search, ShieldCheck, Sparkles, Star, Waves } from 'lucide-react';
import { createElement, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api, { getImageUrl } from '../api';

const categories = [
  { label: 'Wild nature', value: 'nature', icon: Palmtree, tone: 'bg-emerald-950 text-emerald-50' },
  { label: 'Coastal calm', value: 'beaches', icon: Waves, tone: 'bg-[#dce9e4] text-teal-950' },
  { label: 'Living culture', value: 'culture', icon: Map, tone: 'bg-[#f0dfbd] text-amber-950' },
  { label: 'Trails & peaks', value: 'hiking', icon: Footprints, tone: 'bg-[#d8ddd0] text-slate-900' },
  { label: 'Photo stories', value: 'photography', icon: Camera, tone: 'bg-[#c9d8de] text-slate-900' },
];

export default function Home() {
  const [places, setPlaces] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([api.get('/places'), api.get('/drivers')])
      .then(([placeResult, driverResult]) => { setPlaces(placeResult.data); setDrivers(driverResult.data); })
      .catch(() => { setPlaces([]); setDrivers([]); })
      .finally(() => setLoading(false));
  }, []);

  const filteredPlaces = useMemo(() => places.filter((place) => `${place.name} ${place.location} ${(place.tags || []).join(' ')}`.toLowerCase().includes(query.toLowerCase())), [places, query]);
  const search = (event) => { event.preventDefault(); navigate(`/destinations${query ? `?q=${encodeURIComponent(query)}` : ''}`); };

  return <main className="overflow-hidden bg-[#f4f1e9]">
    <section className="relative overflow-hidden bg-[#0d342a] text-white">
      <div className="absolute -right-40 -top-52 h-[34rem] w-[34rem] rounded-full border border-white/10" />
      <div className="absolute -bottom-80 left-[38%] h-[42rem] w-[42rem] rounded-full border border-white/[.07]" />
      <div className="page-shell relative grid min-h-[720px] items-center gap-14 py-16 lg:grid-cols-[1.02fr_.98fr] lg:py-20">
        <div className="max-w-3xl">
          <p className="mb-6 flex items-center gap-2 text-xs font-bold uppercase tracking-[.24em] text-amber-300"><Sparkles size={15} /> Your island story starts here</p>
          <h1 className="font-serif text-5xl font-semibold leading-[.98] tracking-tight sm:text-6xl lg:text-[5.25rem]">Sri Lanka,<br />beyond the guidebook.</h1>
          <p className="mt-7 max-w-xl text-lg leading-8 text-emerald-50/70">Discover remarkable places and travel with trusted local drivers who know every scenic road, hidden café, and sunrise worth waking for.</p>
          <div className="mt-9 flex flex-wrap gap-3"><Link to="/trip-planner" className="primary-button !bg-amber-300 !px-6 !text-slate-950 hover:!bg-amber-200">Plan my trip <ArrowRight size={17} /></Link><Link to="/destinations" className="secondary-button !border-white/25 !bg-white/5 !text-white hover:!bg-white/10">Explore destinations</Link></div>
          <div className="mt-11 flex flex-wrap gap-x-8 gap-y-3 text-sm text-emerald-50/60"><span className="flex items-center gap-2"><CheckCircle2 size={16} className="text-amber-300" /> Verified local drivers</span><span className="flex items-center gap-2"><CheckCircle2 size={16} className="text-amber-300" /> Explainable trip planning</span></div>
        </div>
        <div className="relative mx-auto w-full max-w-[490px] lg:ml-auto">
          <div className="aspect-[4/5] overflow-hidden rounded-[3.25rem] border-[10px] border-white/10 bg-emerald-950 shadow-[0_35px_90px_-25px_rgba(0,0,0,.65)]"><img className="h-full w-full object-cover" src="/images/ceylon-hero-train.jpg" alt="Blue train winding through Sri Lankan tea country at sunrise" fetchPriority="high" /></div>
          <div className="absolute -bottom-5 -left-3 flex items-center gap-4 rounded-2xl border border-white/60 bg-[#fffaf0] p-4 text-slate-900 shadow-xl sm:-left-10"><span className="grid h-11 w-11 place-items-center rounded-xl bg-amber-100 text-amber-700"><Star fill="currentColor" size={20} /></span><span><b className="block">Local-first travel</b><small className="text-slate-500">Made for meaningful journeys</small></span></div>
        </div>
      </div>
    </section>

    <section className="page-shell relative z-10 -mt-8">
      <form onSubmit={search} className="rounded-[2rem] border border-stone-200 bg-[#fffdf8] p-4 shadow-[0_25px_70px_-35px_rgba(15,55,45,.45)] sm:flex sm:items-center sm:gap-4 sm:p-5"><div className="relative flex-1"><Search className="absolute left-4 top-3.5 text-teal-700" size={20}/><input className="field !border-stone-200 !bg-white !pl-12" value={query} onChange={(event)=>setQuery(event.target.value)} placeholder="Where in Sri Lanka would you like to explore?" aria-label="Search destinations" /></div><button className="primary-button mt-3 w-full sm:mt-0 sm:w-auto">Search the island <ArrowRight size={17}/></button></form>
    </section>

    <section className="page-shell py-24">
      <div className="mb-10 flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="eyebrow">Choose your rhythm</p><h2 className="mt-3 font-serif text-4xl font-semibold sm:text-5xl">Explore by feeling</h2></div><p className="max-w-md text-sm leading-6 text-slate-600">Start with what moves you. We’ll connect the places into a journey that makes geographic and personal sense.</p></div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">{categories.map(({label,value,icon,tone})=><Link to={`/destinations?category=${value}`} key={value} className={`group min-h-44 rounded-[1.75rem] p-5 ${tone}`}>{createElement(icon, { size: 25 })}<div className="mt-14 flex items-end justify-between"><b className="font-serif text-xl">{label}</b><ArrowRight size={18} className="transition group-hover:translate-x-1"/></div></Link>)}</div>
    </section>

    <section className="bg-[#dfeae4] py-24">
      <div className="page-shell"><div className="mb-10 flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="eyebrow">Curated island places</p><h2 className="mt-3 font-serif text-4xl font-semibold sm:text-5xl">Worth every detour</h2></div><Link to="/destinations" className="secondary-button !border-teal-800/20 !bg-transparent">View every destination <ArrowRight size={17}/></Link></div>
        {loading ? <div className="grid gap-6 md:grid-cols-3">{[1,2,3].map((item)=><div key={item} className="h-96 animate-pulse rounded-3xl bg-white/50"/>)}</div> : <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">{filteredPlaces.slice(0,6).map((place,index)=><Link to={`/destinations/${place.slug}`} key={place._id} className={`group overflow-hidden rounded-[2rem] border border-white/70 bg-[#fffdf8] shadow-[0_18px_50px_-35px_rgba(15,55,45,.55)] ${index===0?'md:col-span-2 lg:col-span-1':''}`}><div className="relative h-64 overflow-hidden"><img src={getImageUrl(place.image)} alt={place.name} className="h-full w-full object-cover transition duration-500 group-hover:scale-105"/><span className="absolute left-4 top-4 rounded-full bg-slate-950/65 px-3 py-1 text-xs font-bold text-white backdrop-blur">{place.recommendedDuration || 1} day stay</span></div><div className="p-6"><p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-teal-700"><MapPin size={14}/>{place.location}</p><h3 className="mt-2 font-serif text-2xl font-bold">{place.name}</h3><p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-600">{place.shortDescription || 'A memorable stop on your Sri Lankan journey.'}</p></div></Link>)}</div>}
        {!loading&&!filteredPlaces.length&&<div className="rounded-3xl bg-[#fffdf8] py-16 text-center"><Binoculars className="mx-auto text-teal-700"/><h3 className="mt-4 text-xl font-bold">Destinations are coming soon</h3></div>}
      </div>
    </section>

    <section className="page-shell py-24"><div className="grid gap-12 lg:grid-cols-[.8fr_1.2fr] lg:items-center"><div><p className="eyebrow">Simple from idea to road</p><h2 className="mt-3 font-serif text-4xl font-semibold sm:text-5xl">Your trip, thoughtfully connected.</h2><p className="mt-5 leading-7 text-slate-600">Ceylon Explorer keeps inspiration, planning, people, and trip management in one calm experience.</p><Link to="/trip-planner" className="primary-button mt-7">Start planning <ArrowRight size={17}/></Link></div><div className="grid gap-4 sm:grid-cols-3">{[{n:'01',icon:Compass,title:'Shape your route',text:'Tell us your dates, pace, and interests.'},{n:'02',icon:ShieldCheck,title:'Choose local expertise',text:'Compare verified drivers and real availability.'},{n:'03',icon:CarFront,title:'Travel with confidence',text:'Manage the journey and review it afterward.'}].map(({n,icon,title,text})=><article key={n} className="rounded-[1.75rem] border border-stone-200 bg-[#fffdf8] p-6"><span className="text-xs font-bold text-amber-700">STEP {n}</span>{createElement(icon, { className: 'mt-8 text-teal-700' })}<h3 className="mt-4 font-serif text-xl font-bold">{title}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{text}</p></article>)}</div></div></section>

    {!!drivers.length&&<section className="bg-[#183f35] py-24 text-white"><div className="page-shell"><div className="mb-10 flex justify-between gap-5"><div><p className="text-xs font-bold uppercase tracking-[.22em] text-amber-300">People who know the way</p><h2 className="mt-3 font-serif text-4xl font-semibold">Meet trusted local drivers</h2></div><Link to="/drivers" className="hidden self-end text-sm font-bold text-amber-200 sm:block">View all drivers →</Link></div><div className="grid gap-5 md:grid-cols-3">{drivers.slice(0,3).map((driver)=><Link to={`/drivers/${driver._id}`} key={driver._id} className="flex items-center gap-4 rounded-3xl border border-white/10 bg-white/[.07] p-4 hover:bg-white/[.11]"><img className="h-20 w-20 rounded-2xl object-cover" src={getImageUrl(driver.profileImage||driver.image)} alt={driver.fullName||driver.name}/><div><b className="font-serif text-xl">{driver.fullName||driver.name}</b><p className="mt-1 text-sm text-white/55">{driver.vehicleModel||driver.vehicleType}</p><p className="mt-1 flex items-center gap-1 text-xs text-amber-300"><Star size={13} fill="currentColor"/>{driver.averageRating||'New'} {driver.reviewCount?`· ${driver.reviewCount} reviews`:''}</p></div></Link>)}</div></div></section>}

    <section className="page-shell py-24"><div className="relative overflow-hidden rounded-[2.75rem] bg-[#e6c879] px-7 py-16 sm:px-14 lg:flex lg:items-center lg:justify-between"><div className="absolute -right-16 -top-24 h-64 w-64 rounded-full border border-amber-950/10"/><div className="relative"><p className="text-xs font-bold uppercase tracking-[.22em] text-amber-950/65">Ready when you are</p><h2 className="mt-3 max-w-2xl font-serif text-4xl font-semibold text-slate-950">Turn a handful of ideas into an unforgettable island story.</h2></div><Link to="/trip-planner" className="relative mt-8 shrink-0 rounded-full bg-[#10372d] px-6 py-3.5 text-sm font-bold text-white lg:mt-0">Plan my Sri Lanka trip <ArrowRight className="ml-2 inline" size={17}/></Link></div></section>
  </main>;
}
