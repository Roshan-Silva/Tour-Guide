import { ArrowRight, Binoculars, CarFront, CheckCircle2, Compass, MapPin, ShieldCheck, Sparkles, Star, Waves } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { getImageUrl } from '../api';

export default function Home() {
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');

  useEffect(() => {
    api.get('/places').then((response) => setPlaces(response.data)).catch(() => setPlaces([])).finally(() => setLoading(false));
  }, []);

  const filteredPlaces = useMemo(() => places.filter((place) => `${place.name} ${place.location} ${(place.tags || []).join(' ')}`.toLowerCase().includes(query.toLowerCase())), [places, query]);

  return <main>
    <section className="relative overflow-hidden bg-[#102f27] text-white">
      <div className="absolute -right-28 -top-28 h-96 w-96 rounded-full border border-white/10" /><div className="absolute -bottom-48 right-32 h-[34rem] w-[34rem] rounded-full border border-white/10" />
      <div className="page-shell relative grid min-h-[650px] items-center gap-12 py-20 lg:grid-cols-[1.1fr_.9fr]">
        <div className="max-w-3xl">
          <p className="mb-6 flex items-center gap-2 text-xs font-bold uppercase tracking-[.24em] text-amber-300"><Sparkles size={15} /> Your island story starts here</p>
          <h1 className="font-serif text-5xl font-semibold leading-[1.02] tracking-tight sm:text-6xl lg:text-7xl">Sri Lanka, beyond the guidebook.</h1>
          <p className="mt-7 max-w-xl text-lg leading-8 text-white/70">Discover remarkable places and travel with trusted local drivers who know every scenic road, hidden café, and sunrise worth waking for.</p>
          <div className="mt-9 flex flex-wrap gap-3"><Link to="/drivers" className="primary-button !bg-amber-300 !text-slate-950 hover:!bg-amber-200">Plan your journey <ArrowRight size={17} /></Link><a href="#destinations" className="secondary-button !border-white/25 !bg-white/5 !text-white hover:!bg-white/10">Explore places</a></div>
          <div className="mt-12 flex flex-wrap gap-x-8 gap-y-3 text-sm text-white/60"><span className="flex items-center gap-2"><CheckCircle2 size={16} className="text-amber-300" /> Verified local drivers</span><span className="flex items-center gap-2"><CheckCircle2 size={16} className="text-amber-300" /> Easy trip management</span></div>
        </div>
        <div className="relative hidden lg:block">
          <div className="ml-auto aspect-[4/5] max-w-md overflow-hidden rounded-[3rem] border-8 border-white/10 shadow-2xl"><img className="h-full w-full object-cover" src="https://images.unsplash.com/photo-1586185113229-2b7b054c4bc8?auto=format&fit=crop&w=1000&q=85" alt="Scenic Sri Lankan train journey" /></div>
          <div className="absolute -bottom-5 -left-4 card flex items-center gap-4 !rounded-2xl p-4 text-slate-900"><span className="grid h-11 w-11 place-items-center rounded-xl bg-amber-100 text-amber-700"><Star fill="currentColor" size={20} /></span><span><b className="block">Local-first travel</b><small className="text-slate-500">Made for meaningful trips</small></span></div>
        </div>
      </div>
    </section>

    <section className="page-shell -mt-7 relative z-10"><div className="card grid divide-y divide-slate-200 p-3 sm:grid-cols-3 sm:divide-x sm:divide-y-0"><div className="flex gap-4 p-5"><Compass className="text-teal-700" /><div><b className="block">Curated places</b><span className="text-sm text-slate-500">Worth every detour</span></div></div><div className="flex gap-4 p-5"><ShieldCheck className="text-teal-700" /><div><b className="block">Trusted journeys</b><span className="text-sm text-slate-500">Book with confidence</span></div></div><div className="flex gap-4 p-5"><CarFront className="text-teal-700" /><div><b className="block">Local drivers</b><span className="text-sm text-slate-500">Travel like a local</span></div></div></div></section>

    <section id="destinations" className="page-shell py-24">
      <div className="mb-10 flex flex-col justify-between gap-6 md:flex-row md:items-end"><div><p className="eyebrow">Explore the island</p><h2 className="mt-3 font-serif text-4xl font-semibold text-slate-900 sm:text-5xl">Places that stay with you</h2><p className="mt-3 max-w-2xl text-slate-500">From misty hill country to sunlit southern shores, find your next chapter.</p></div><div className="relative w-full md:w-80"><MapPin className="absolute left-4 top-3.5 text-slate-400" size={19} /><input className="field !pl-11" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search destinations" aria-label="Search destinations" /></div></div>
      {loading ? <div className="grid gap-6 md:grid-cols-3">{[1,2,3].map((item) => <div key={item} className="h-96 animate-pulse rounded-3xl bg-slate-200" />)}</div> : <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">{filteredPlaces.map((place) => <article key={place._id} className="card group overflow-hidden"><div className="h-64 overflow-hidden"><img src={getImageUrl(place.image)} alt={place.name} className="h-full w-full object-cover group-hover:scale-105 transition duration-500" /></div><div className="p-6"><div className="mb-3 flex items-center justify-between"><h3 className="font-serif text-2xl font-bold">{place.name}</h3><Waves size={19} className="text-teal-700" /></div><p className="mb-5 flex items-center gap-2 text-sm text-slate-500"><MapPin size={15} /> {place.location}</p><div className="flex flex-wrap gap-2">{(place.tags || []).map((tag) => <span key={tag} className="rounded-full bg-teal-50 px-3 py-1 text-xs font-bold capitalize text-teal-800">{tag}</span>)}</div></div></article>)}</div>}
      {!loading && filteredPlaces.length === 0 && <div className="card py-16 text-center"><Binoculars className="mx-auto mb-4 text-teal-700" /><h3 className="text-xl font-bold">{places.length ? 'No place found' : 'Destinations are coming soon'}</h3><p className="mt-2 text-slate-500">{places.length ? 'Try a different destination or travel style.' : 'Our team is preparing the next collection of island experiences.'}</p></div>}
    </section>

    <section className="page-shell"><div className="overflow-hidden rounded-[2.5rem] bg-[#eadfca] px-7 py-14 sm:px-14 lg:flex lg:items-center lg:justify-between"><div><p className="eyebrow">Ready when you are</p><h2 className="mt-3 max-w-2xl font-serif text-4xl font-semibold text-slate-900">Turn your saved ideas into an unforgettable road trip.</h2></div><Link to="/drivers" className="primary-button mt-8 shrink-0 lg:mt-0">Meet your driver <ArrowRight size={17} /></Link></div></section>
  </main>;
}
