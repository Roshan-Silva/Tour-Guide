import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';

const money = (value) => `LKR ${(Number(value || 0) / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export default function AdminFinance() {
  const [rows, setRows] = useState([]); const [filter, setFilter] = useState('');
  const [error, setError] = useState(''); const [busy, setBusy] = useState('');
  const load = useCallback(async () => {
    try { setRows((await api.get(`/admin/commissions${filter ? `?status=${filter}` : ''}`)).data); setError(''); }
    catch (err) { setError(err.response?.data?.message || 'Could not load commissions'); }
  }, [filter]);
  useEffect(() => { load(); }, [load]);

  const act = async (commission, action, resolution) => {
    let body = {};
    if (['waive', 'dispute'].includes(action) || action === 'resolve') {
      const reason = window.prompt(`Reason to ${action} this commission`); if (!reason) return;
      body = { reason, ...(resolution && { resolution }) };
    }
    if (action === 'reject' && !window.confirm('Reject this submitted payment?')) return;
    if (action === 'approve' && !window.confirm(`Verify receipt of ${money(commission.commissionAmount)}?`)) return;
    setBusy(commission._id);
    const endpoint = action === 'approve' ? 'approve-payment' : action === 'reject' ? 'reject-payment' : action === 'resolve' ? 'resolve-dispute' : action;
    try { await api.patch(`/admin/commissions/${commission._id}/${endpoint}`, body); await load(); }
    catch (err) { setError(err.response?.data?.message || 'Action failed'); }
    finally { setBusy(''); }
  };
  const sum = (statuses) => rows.filter((item) => statuses.includes(item.status)).reduce((total, item) => total + item.commissionAmount, 0);

  return <main className="min-h-screen bg-slate-100/70">
    <header className="bg-[#123a30] py-12 text-white"><div className="page-shell"><p className="text-xs font-bold uppercase tracking-[.22em] text-amber-300">Financial operations</p><h1 className="mt-3 font-serif text-5xl font-semibold">Driver commissions</h1><p className="mt-3 text-white/65">Travelers pay drivers directly. This ledger contains only platform commissions owed by drivers.</p><nav className="mt-6 flex gap-3"><Link className="secondary-button !border-white/20 !text-white" to="/admin">Operations</Link><Link className="secondary-button !border-white/20 !text-white" to="/admin/driver-identities">Driver identities</Link></nav></div></header>
    <section className="page-shell py-10">
      {error && <p className="mb-5 rounded-2xl bg-red-50 p-4 text-red-700">{error}</p>}
      <div className="mb-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"><Metric label="Due" value={money(sum(['due']))} /><Metric label="Overdue" value={money(sum(['overdue']))} /><Metric label="Submitted" value={money(sum(['payment_submitted']))} /><Metric label="Paid revenue" value={money(sum(['paid']))} /></div>
      <select className="field mb-6 max-w-xs" value={filter} onChange={(event) => setFilter(event.target.value)}><option value="">All statuses</option>{['due','overdue','payment_submitted','paid','waived','disputed'].map((status) => <option key={status}>{status}</option>)}</select>
      <div className="card overflow-x-auto"><table className="w-full min-w-[1150px] text-left text-sm"><thead className="bg-slate-50"><tr>{['Commission','Booking','Driver','Tour value','Rate','Commission','Due','Status','Reference','Actions'].map((heading) => <th className="p-4" key={heading}>{heading}</th>)}</tr></thead><tbody className="divide-y">{rows.map((commission) => <tr key={commission._id}><td className="p-4">{commission._id.slice(-8).toUpperCase()}</td><td className="p-4">{commission.booking?.destination}</td><td className="p-4 font-bold">{commission.driver?.fullName || commission.driver?.name}</td><td className="p-4">{money(commission.agreedTourPrice)}</td><td className="p-4">{commission.commissionRateBps / 100}%</td><td className="p-4 font-bold">{money(commission.commissionAmount)}</td><td className="p-4">{new Date(commission.dueAt).toLocaleString()}</td><td className="p-4 capitalize">{commission.status.replace('_', ' ')}</td><td className="p-4">{commission.paymentReference || '—'}</td><td className="p-4"><div className="flex flex-wrap gap-2">{commission.status === 'payment_submitted' && <><button disabled={busy === commission._id} onClick={() => act(commission, 'approve')} className="primary-button !px-3 !py-2">Approve</button><button disabled={busy === commission._id} onClick={() => act(commission, 'reject')} className="secondary-button !px-3 !py-2">Reject</button></>}{!['paid','waived','disputed'].includes(commission.status) && <><button disabled={busy === commission._id} onClick={() => act(commission, 'waive')} className="secondary-button !px-3 !py-2">Waive</button><button disabled={busy === commission._id} onClick={() => act(commission, 'dispute')} className="secondary-button !px-3 !py-2">Dispute</button></>}{commission.status === 'disputed' && <><button disabled={busy === commission._id} onClick={() => act(commission, 'resolve', 'due')} className="secondary-button !px-3 !py-2">Return due</button><button disabled={busy === commission._id} onClick={() => act(commission, 'resolve', 'waived')} className="secondary-button !px-3 !py-2">Resolve waived</button><button disabled={busy === commission._id} onClick={() => act(commission, 'resolve', 'paid')} className="primary-button !px-3 !py-2">Resolve paid</button></>}</div></td></tr>)}</tbody></table>{!rows.length && <p className="p-12 text-center">No commissions found.</p>}</div>
    </section>
  </main>;
}

function Metric({ label, value }) { return <article className="card p-5"><p className="text-xs font-bold uppercase text-slate-400">{label}</p><b className="mt-2 block text-2xl">{value}</b></article>; }
