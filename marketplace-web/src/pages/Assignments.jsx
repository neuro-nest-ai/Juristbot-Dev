import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { api, apiErrorMessage } from '../config/api';
import { formatDate, paiseToRupees } from '../utils/format';

const statusMap = {
  pending: ['Pending', 'assignment-pending'],
  in_progress: ['In Progress', 'assignment-progress'],
  delivered: ['Under Review', 'assignment-review'],
  completed: ['Completed', 'assignment-complete'],
  cancelled: ['Cancelled', 'assignment-cancelled'],
};

export default function Assignments() {
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [ordersResponse, requestsResponse] = await Promise.all([
        api.get('/marketplace/orders/my'),
        api.get('/marketplace/requests/my'),
      ]);
      const orders = ordersResponse.data.orders || [];
      const requests = requestsResponse.data.requests || [];
      const orderRequestIds = new Set(orders.map((order) => order.request_id));
      const unawarded = requests.filter((request) => !orderRequestIds.has(request.id)).map((request) => ({
        id: `request-${request.id}`,
        request_id: request.id,
        title: request.title,
        order_number: `JB-REQ-${String(request.id).padStart(6, '0')}`,
        status: 'pending',
        amount: request.budget_max,
        deadline: request.deadline,
        advocate_name: 'Awaiting quotes',
        hasOrder: false,
      }));
      setAssignments([...orders.map((order) => ({ ...order, hasOrder: true })), ...unawarded]);
    } catch (error) { toast.error(apiErrorMessage(error)); } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  return <div className="assignments-page">
    <div className="assignment-top-tabs"><button onClick={() => navigate('/marketplace')}>Need a Legal Draft</button><button className="active">My Assignments</button><button onClick={() => assignments[0] ? navigate(`/marketplace/orders/${assignments[0].id}/upload`) : navigate('/marketplace')}>Workspace</button></div>
    <div className="post-head"><div><h1 className="marketplace-title">Legal Marketplace</h1><p className="marketplace-subtitle">Track your legal drafting assignments and delivery progress.</p></div><button className="yellow-btn assignment-new-request" onClick={() => navigate('/marketplace')}>Need a Legal Draft</button></div>
    <div className="assignment-tabs"><button onClick={() => assignments[0] && navigate(`/marketplace/orders/${assignments[0].id}/upload`)}>Upload a Draft</button><button onClick={() => assignments[0] && navigate(`/marketplace/orders/${assignments[0].id}/upload`)}>View &amp; Download Completed Drafts</button><button className="active">Track Order</button><button onClick={() => navigate('/marketplace/requests/new')}>Draft Request</button><button onClick={() => navigate('/marketplace/requests/review')}>Review &amp; Accept Bids</button></div>
    {loading ? <div className="workspace-empty">Loading assignments...</div> : !assignments.length ? <div className="workspace-empty">No assignments yet.</div> : <div className="assignment-list">{assignments.map((assignment) => { const [label, className] = statusMap[assignment.status] || ['Pending', 'assignment-pending']; return <article className="assignment-card" key={assignment.id}><div className="assignment-title"><h2>{assignment.title}</h2><small>{assignment.order_number}</small></div><div className="assignment-advocate"><span className="advocate-avatar">{assignment.advocate_name === 'Awaiting quotes' ? '—' : (assignment.advocate_name || 'AD').split(' ').map((word) => word[0]).join('').slice(0, 2)}</span><div><strong>{assignment.advocate_name || 'Assigned Advocate'}</strong><small>{assignment.advocate_name === 'Awaiting quotes' ? 'Quotes open until deadline' : 'Verified Advocate'}</small></div></div><div className="assignment-amount"><strong>{assignment.amount ? paiseToRupees(assignment.amount) : '—'}</strong><small>{assignment.hasOrder ? 'Paid' : 'Max budget'}</small></div><div className="assignment-deadline"><strong>{formatDate(assignment.deadline)}</strong><small>Required by</small></div><span className={`assignment-status ${className}`}>{label}</span><button className="assignment-track" onClick={() => assignment.hasOrder ? navigate(`/marketplace/orders/${assignment.id}/track`) : navigate(`/marketplace/requests/${assignment.request_id}/quotes`)}>Track Order</button></article>; })}</div>}
  </div>;
}
