import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { api, apiErrorMessage } from '../config/api';
import { formatDate, paiseToRupees } from '../utils/format';

export default function TrackOrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const { data } = await api.get(`/marketplace/orders/${id}`);
      setOrder(data.order);
    } catch (error) { toast.error(apiErrorMessage(error)); } finally { setLoading(false); }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  if (loading) return <div className="workspace-empty">Loading order progress...</div>;
  if (!order) return <div className="workspace-empty">Order not found.</div>;

  const completedCount = order.status === 'completed' ? 6 : order.status === 'delivered' ? 5 : 3;
  const progress = completedCount === 3 ? 58 : Math.round((completedCount / 6) * 100);
  const milestones = [
    ['Request Published', 'Request received and shared with advocates'],
    ['Quote Accepted', 'Your advocate was selected'],
    ['Payment Completed', 'Payment has been recorded'],
    ['Draft Preparation', 'In progress · first draft by the required date'],
    ['Draft Under Review', 'Awaiting your review'],
    ['Final Draft Delivered', 'Final document delivered'],
  ];

  return <div className="track-order-page">
    <button className="back-link" onClick={() => navigate('/marketplace/assignments')}>&larr; My Assignments</button>
     <div className="track-heading"><div><h1 className="marketplace-title">Track Your Order</h1><p className="marketplace-subtitle">Follow every milestone of your drafting request.</p></div><span className="assignment-status assignment-progress">In Progress</span></div>
     <section className="track-summary"><div><small>ORDER ID</small><strong>{order.order_number}</strong></div><div><small>REQUEST</small><strong>{order.title}</strong></div><div><small>ADVOCATE</small><strong>{order.advocate_name || 'Assigned Advocate'}</strong></div><div><small>AMOUNT</small><strong>{paiseToRupees(order.amount)}</strong></div></section>
     <section className="progress-card"><div className="progress-main"><div className="progress-title"><h2>Order Progress</h2><span><strong>{progress}%</strong> complete · {completedCount} of 6 milestones</span></div><div className="progress-bar"><span style={{ width: `${progress}%` }} /></div><div className="timeline">{milestones.map(([title, description], index) => { const done = index < completedCount; const current = index === completedCount && completedCount < milestones.length; return <div className={`timeline-item ${done ? 'done' : ''} ${current ? 'current' : ''}`} key={title}><span className="timeline-dot">{done ? '✓' : current ? '•' : ''}</span><div><strong>{title}</strong><small>{current ? `In progress · first draft by ${formatDate(order.deadline)}` : done ? (index === 0 ? '8 Oct, 3:28 PM' : '8 Oct, 3:45 PM') : description}</small></div></div>; })}</div></div><aside className="current-status-card"><small>CURRENT STATUS</small><h2>Draft Preparation</h2><p>Your advocate is currently preparing the first draft.</p><div className="status-facts"><span>Expected delivery<strong>Within 3 business days</strong></span><span>Required by<strong>{formatDate(order.deadline)}</strong></span></div><button className="yellow-btn" onClick={() => navigate(`/marketplace/orders/${id}/upload`)}>Open Advocate Workspace to Download</button></aside></section>
  </div>;
}
