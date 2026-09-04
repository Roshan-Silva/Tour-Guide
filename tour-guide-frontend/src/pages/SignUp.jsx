import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, LockKeyhole, Mail, UserRound } from 'lucide-react';
import api, { saveSession } from '../api';
import AuthLayout from '../components/AuthLayout';

const Field = ({ icon, label, name, type = 'text', placeholder, autoComplete, value, onChange }) => {
  const IconComponent = icon;
  return <label className="block"><span className="mb-2 block text-sm font-bold">{label}</span><span className="relative block"><IconComponent className="absolute left-4 top-3.5 text-slate-400" size={19} /><input className="field !pl-11" name={name} type={type} autoComplete={autoComplete} value={value} onChange={onChange} placeholder={placeholder} required /></span></label>;
};

export default function SignUp() {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const handleSubmit = async (event) => { event.preventDefault(); setError(''); if (formData.password !== formData.confirmPassword) { setError('Passwords do not match.'); return; } if (formData.password.length < 8) { setError('Password must be at least 8 characters.'); return; } setSubmitting(true); try { const response = await api.post('/auth/register', formData); saveSession(response.data); navigate('/'); } catch (requestError) { setError(requestError.response?.data?.message || 'Unable to create your account.'); } finally { setSubmitting(false); } };
  const updateField = (name) => (event) => setFormData({ ...formData, [name]: event.target.value });
  return <AuthLayout eyebrow="Join the journey" title="Create your explorer account" description="Save time, book trusted drivers, and keep every trip detail together."><form onSubmit={handleSubmit} className="space-y-4">{error && <p className="rounded-2xl bg-red-50 p-4 text-sm text-red-700" role="alert">{error}</p>}<Field icon={UserRound} label="Full name" name="name" placeholder="Your full name" autoComplete="name" value={formData.name} onChange={updateField('name')} /><Field icon={Mail} label="Email address" name="email" type="email" placeholder="you@example.com" autoComplete="email" value={formData.email} onChange={updateField('email')} /><div className="grid gap-4 sm:grid-cols-2"><Field icon={LockKeyhole} label="Password" name="password" type="password" placeholder="8+ characters" autoComplete="new-password" value={formData.password} onChange={updateField('password')} /><Field icon={LockKeyhole} label="Confirm password" name="confirmPassword" type="password" placeholder="Repeat password" autoComplete="new-password" value={formData.confirmPassword} onChange={updateField('confirmPassword')} /></div><button className="primary-button !mt-6 w-full" disabled={submitting}>{submitting ? 'Creating account...' : <>Create account <ArrowRight size={17} /></>}</button><p className="text-center text-sm text-slate-500">Already have an account? <Link className="font-bold text-teal-700 hover:text-teal-900" to="/login">Sign in</Link></p><p className="border-t pt-4 text-center text-sm text-slate-500">Are you a tour driver? <Link className="font-bold text-teal-700" to="/driver/apply">Apply to join</Link></p></form></AuthLayout>;
}
