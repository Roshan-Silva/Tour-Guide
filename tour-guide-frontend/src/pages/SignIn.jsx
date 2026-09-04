import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowRight, LockKeyhole, Mail } from 'lucide-react';
import api, { saveSession } from '../api';
import AuthLayout from '../components/AuthLayout';

export default function SignIn() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const handleSubmit = async (event) => { event.preventDefault(); setSubmitting(true); setError(''); try { const response = await api.post('/auth/login', formData); saveSession(response.data); navigate(location.state?.from || '/'); } catch (requestError) { setError(requestError.response?.data?.message || 'Unable to sign in. Please try again.'); } finally { setSubmitting(false); } };

  return <AuthLayout eyebrow="Welcome back" title="Continue your journey" description="Sign in to manage your bookings and plan your next island adventure."><form onSubmit={handleSubmit} className="space-y-5">{error && <p className="rounded-2xl bg-red-50 p-4 text-sm text-red-700" role="alert">{error}</p>}<label className="block"><span className="mb-2 block text-sm font-bold">Email address</span><span className="relative block"><Mail className="absolute left-4 top-3.5 text-slate-400" size={19} /><input className="field !pl-11" name="email" type="email" autoComplete="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="you@example.com" required /></span></label><label className="block"><span className="mb-2 block text-sm font-bold">Password</span><span className="relative block"><LockKeyhole className="absolute left-4 top-3.5 text-slate-400" size={19} /><input className="field !pl-11" name="password" type="password" autoComplete="current-password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} placeholder="Your password" required /></span></label><button className="primary-button w-full" disabled={submitting}>{submitting ? 'Signing in...' : <>Sign in <ArrowRight size={17} /></>}</button><p className="text-center text-sm text-slate-500">New to Ceylon Explorer? <Link className="font-bold text-teal-700 hover:text-teal-900" to="/signup">Create an account</Link></p></form></AuthLayout>;
}
