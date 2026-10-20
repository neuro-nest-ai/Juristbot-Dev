import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { api, apiErrorMessage } from '../config/api';
import { budgetRange, formatDate, paiseToRupees } from '../utils/format';

export default function AdvocateWorkspace() {
  const [tab, setTab] = useState('open');
  const [requests, setRequests] = useState([]);
  const [bids, setBids] = useState([]);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({ amount: '', timeline_days: '', message: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadRequests = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/marketplace/requests/feed');
      setRequests(data.requests || []);
    } catch (error) { toast.error(apiErrorMessage(error)); } finally { setLoading(false); }
  }, []);

  const loadBids = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/marketplace/bids/my');
      setBids(data.bids || []);
    } catch (error) { toast.error(apiErrorMessage(error)); } finally { setLoading(false); }
  }, []);

  useEffect(() => { if (tab === 'open') loadRequests(); else loadBids(); }, [tab, loadRequests, loadBids]);

  const openBid = (request) => {
    setSelected(request);
    setForm({ amount: '', timeline_days: '', message: '' });
  };

  const submitBid = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      await api.post(`/marketplace/requests/${selected.id}/bids`, {
        amount: Number(form.amount), timeline_days: Number(form.timeline_days), message: form.message,
      });
      toast.success('Bid submitted');
      setSelected(null);
      loadRequests();
    } catch (error) { toast.error(apiErrorMessage(error)); } finally { setSaving(false); }
  };

  return <div className="workspace-page">
    <div className="workspace-header"><div><h1 className="marketplace-title">Advocate Workspace</h1><p className="marketplace-subtitle">Find legal drafting requests and submit proposals.</p></div><div className="workspace-pills"><span>Verified advocate</span><span>Open marketplace</span></div></div>
    <div className="workspace-tabs"><button className={tab === 'open' ? 'workspace-tab active' : 'workspace-tab'} onClick={() => setTab('open')}>Browse Open Requests</button><button className={tab === 'mine' ? 'workspace-tab active' : 'workspace-tab'} onClick={() => setTab('mine')}>My Bids / Bid History</button></div>
    {loading ? <div className="workspace-empty">Loading workspace...</div> : tab === 'open' ? <div className="request-feed">
      {!requests.length ? <div className="workspace-empty">No open requests are available right now.</div> : requests.map((request) => <article className="request-card" key={request.id}><div className="request-card-main"><div className="request-meta"><span>{request.category || 'Legal service'}</span><span>Posted {formatDate(request.created_at)}</span></div><h3>{request.title}</h3><p>{request.description || 'No description provided.'}</p><div className="request-facts"><span>Budget <strong>{budgetRange(request.budget_min, request.budget_max)}</strong></span><span>Due <strong>{formatDate(request.deadline)}</strong></span><span>Jurisdiction <strong>{request.jurisdiction || 'Any'}</strong></span></div></div><button className="yellow-btn request-action" onClick={() => openBid(request)}>View &amp; Bid</button></article>)}
    </div> : <div className="bid-history">{!bids.length ? <div className="workspace-empty">You have not submitted any bids yet.</div> : bids.map((bid) => <article className="history-card" key={bid.id}><div><span className="request-meta">{bid.category || 'Legal service'} · {formatDate(bid.created_at)}</span><h3>{bid.title}</h3><p>{bid.message || 'No message added.'}</p></div><div className="history-side"><strong>{paiseToRupees(bid.amount)}</strong><span>{bid.timeline_days || '—'} days</span><b className={`bid-status ${bid.status}`}>{bid.status}</b></div></article>)}</div>}
    {selected && <div className="bid-overlay"><div className="bid-dialog"><button className="dialog-close" onClick={() => setSelected(null)}>×</button><span className="hero-kicker">SUBMIT YOUR PROPOSAL</span><h2>{selected.title}</h2><p>{selected.description}</p><div className="request-facts"><span>Budget <strong>{budgetRange(selected.budget_min, selected.budget_max)}</strong></span><span>Due <strong>{formatDate(selected.deadline)}</strong></span></div><form onSubmit={submitBid}><label><span className="field-label">Your price (paise)</span><input className="draft-input" type="number" min="1" required value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder="Example: 250000" /></label><label><span className="field-label">Delivery timeline (days)</span><input className="draft-input" type="number" min="1" required value={form.timeline_days} onChange={(e) => setForm({ ...form, timeline_days: e.target.value })} /></label><label><span className="field-label">Proposal message</span><textarea className="draft-textarea" required value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="Explain your approach and relevant experience." /></label><button className="review-btn" disabled={saving}>{saving ? 'Submitting...' : 'Submit Bid'}</button></form></div></div>}
  </div>;
}
