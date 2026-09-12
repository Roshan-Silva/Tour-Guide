import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { saveSession } from '../api';
import AuthLayout from '../components/AuthLayout';

const initial = { name: '', email: '', password: '', confirmPassword: '', phoneNumber: '', nic: '', drivingLicence: '', vehicleType: '', vehicleModel: '', vehicleCapacity: 4, dailyRate: '', languages: '', serviceAreas: '', yearsOfExperience: 0, bio: '', image: null };

function Field({ label, ...props }) {
  return <label><span className="mb-2 block text-sm font-bold">{label}</span><input className="field" required {...props} /></label>;
}

export default function DriverApply() {
  const [form, setForm] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const update = (key) => (event) => setForm({ ...form, [key]: event.target?.files?.[0] || event.target.value });
  const submit = async (event) => {
    event.preventDefault(); setSaving(true); setError('');
    try {
      const body = new FormData();
      Object.entries(form).forEach(([key, value]) => body.append(key, value));
      const { data } = await api.post('/auth/register-driver', body);
      saveSession(data.data || data); navigate('/driver');
    } catch (err) { setError(err.response?.data?.message || 'Could not submit your application'); }
    finally { setSaving(false); }
  };

  return <AuthLayout eyebrow="Driver onboarding" title="Join our trusted local driver network" description="Your identity is encrypted and reviewed by an administrator. Your public profile stays hidden until verification.">
    <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
      {error && <p className="rounded-2xl bg-red-50 p-4 text-sm text-red-700 sm:col-span-2">{error}</p>}
      <Field label="Full legal name" value={form.name} onChange={update('name')} />
      <Field label="Email" type="email" value={form.email} onChange={update('email')} />
      <Field label="Password" type="password" minLength="8" value={form.password} onChange={update('password')} />
      <Field label="Confirm password" type="password" minLength="8" value={form.confirmPassword} onChange={update('confirmPassword')} />
      <Field label="Phone number" value={form.phoneNumber} onChange={update('phoneNumber')} />
      <Field label="NIC number" value={form.nic} onChange={update('nic')} placeholder="200012345678 or 901234567V" />
      <Field label="Driving licence number" value={form.drivingLicence} onChange={update('drivingLicence')} />
      <Field label="Daily rate (LKR)" type="number" min="0" value={form.dailyRate} onChange={update('dailyRate')} />
      <Field label="Vehicle type" value={form.vehicleType} onChange={update('vehicleType')} />
      <Field label="Vehicle model" value={form.vehicleModel} onChange={update('vehicleModel')} />
      <Field label="Vehicle capacity" type="number" min="1" max="20" value={form.vehicleCapacity} onChange={update('vehicleCapacity')} />
      <Field label="Experience (years)" type="number" min="0" value={form.yearsOfExperience} onChange={update('yearsOfExperience')} />
      <Field label="Languages" value={form.languages} onChange={update('languages')} placeholder="Sinhala, English" />
      <Field label="Service areas" value={form.serviceAreas} onChange={update('serviceAreas')} placeholder="Ella, Kandy" />
      <label className="sm:col-span-2"><span className="mb-2 block text-sm font-bold">Short bio</span><textarea className="field min-h-24" maxLength="1000" value={form.bio} onChange={update('bio')} /></label>
      <label className="sm:col-span-2"><span className="mb-2 block text-sm font-bold">Profile photograph</span><input className="field" type="file" accept="image/*" onChange={update('image')} required /></label>
      <p className="rounded-2xl bg-teal-50 p-4 text-sm text-teal-900 sm:col-span-2">Your NIC and driving licence are encrypted at rest. Only authorized administrators can reveal them, and every reveal is audited.</p>
      <button disabled={saving} className="primary-button sm:col-span-2">{saving ? 'Submitting...' : 'Submit driver application'}</button>
    </form>
  </AuthLayout>;
}
