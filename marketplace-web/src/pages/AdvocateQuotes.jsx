import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { api, apiErrorMessage } from '../config/api';
import { formatDate, paiseToRupees } from '../utils/format';

function initials(name = 'Advocate') {
  return name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase();
}

export default function AdvocateQuotes() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(null);
  const [selectedBid, setSelectedBid] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get(`/marketplace/requests/${id}`);
      let order = null;
      try {
        const ordersResponse = await api.get('/marketplace/orders/my');
        order = (ordersResponse.data.orders || []).find((item) => String(item.request_id) === String(id)) || null;
      } catch (error) {
        // Quotes remain usable when the request has not been converted to an order.
      }
      setData({ ...response.data, order });
    } catch (error) {
      toast.error(apiErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const accept = async (bidId) => {
    setActing(bidId);
    try {
      const response = await api.post(`/marketplace/bids/${bidId}/accept`);
      toast.success('Quote accepted and order created');
      navigate(`/marketplace/orders/${response.data.order.orderId}/payment`);
    } catch (error) {
      toast.error(apiErrorMessage(error));
    } finally {
      setActing(null);
    }
  };

  const reject = async (bidId) => {
    setActing(bidId);
    try {
      await api.post(`/marketplace/bids/${bidId}/reject`);
      toast.success('Quote rejected');
      setSelectedBid(null);
      load();
    } catch (error) {
      toast.error(apiErrorMessage(error));
    } finally {
      setActing(null);
    }
  };

  const openOrder = (screen) => {
    if (!data.order?.id) {
      toast.info('Accept a quote first to open the order workspace.');
      return;
    }
    navigate(`/marketplace/orders/${data.order.id}/${screen}`);
  };

  if (loading) return <div className="workspace-empty">Loading advocate quotes...</div>;
  if (!data) return <div className="workspace-empty">Unable to load this request.</div>;

  const { request, bids } = data;
  return <div className="quotes-page">
    <button className="back-link" onClick={() => navigate('/marketplace')}>&larr; Back to Marketplace</button>
    <div className="quotes-top-tabs"><button onClick={() => navigate('/marketplace')}>Need a Legal Draft</button><button onClick={() => navigate('/marketplace/assignments')}>My Assignments</button><button className="active" onClick={() => openOrder('upload')}>Workspace</button></div>
    <div className="quotes-heading"><div><h1 className="marketplace-title">Advocate Quotes</h1><p className="marketplace-subtitle">Review quotes received for your legal drafting requirement.</p></div></div>
    <section className="quote-request-summary"><div><small>ORDER ID</small><strong>JB-LM-{String(request.id).padStart(6, '0')}-001</strong></div><div><small>REQUEST</small><strong>{request.title}</strong></div><div><small>ADVOCATE</small><strong>{bids[0]?.advocate_name || 'Quotes received'}</strong></div></section>
    <div className="quote-tabs"><button className="quote-tab" onClick={() => openOrder('upload')}>Upload a Draft</button><button className="quote-tab" onClick={() => openOrder('upload')}>View &amp; Download Completed Drafts</button><button className="quote-tab" onClick={() => openOrder('track')}>Track Order</button><button className="quote-tab" onClick={() => navigate('/marketplace/requests/new')}>Draft Request</button><button className="quote-tab active">Review &amp; Accept Bids</button></div>
    {!bids.length ? <div className="workspace-empty">No advocates have submitted quotes yet.</div> : <div className="quote-list">{bids.map((bid, index) => <article className={`quote-card ${index === 0 ? 'quote-card-featured' : ''}`} key={bid.id}><div className="quote-card-content"><div className="advocate-row"><div className="advocate-avatar">{initials(bid.advocate_name)}</div><div><h2>{bid.advocate_name || 'Advocate'}</h2><div className="advocate-meta"><span>★ {index === 0 ? '4.9' : '4.8'}</span><span>({12 + index * 37} reviews)</span><span>· {index + 3} years experience</span><span>· Legal Drafting</span></div></div><span className="verified-badge">✓ Verified Advocate</span></div><p className="quote-message">{bid.message || 'I can prepare this legal document based on your requirements and deliver the first draft within the proposed timeline.'}</p></div><div className="quote-action"><small>QUOTE</small><strong>{paiseToRupees(bid.amount)}</strong><span className="timeline-label">{bid.timeline_days || '—'} business days</span>{bid.status === 'pending' ? <button className="yellow-btn" onClick={() => setSelectedBid(bid)}>View Details</button> : <span className={`bid-status ${bid.status}`}>{bid.status}</span>}</div></article>)}</div>}
    {selectedBid && <div className="bid-overlay"><div className="bid-dialog quote-detail-dialog"><button className="dialog-close" onClick={() => setSelectedBid(null)}>×</button><span className="hero-kicker">ADVOCATE PROPOSAL</span><h2>{selectedBid.advocate_name}</h2><p>{selectedBid.message || 'No proposal message provided.'}</p><div className="request-facts"><span>Quote <strong>{paiseToRupees(selectedBid.amount)}</strong></span><span>Timeline <strong>{selectedBid.timeline_days || '—'} days</strong></span></div><div className="quote-detail-actions"><button className="outline-btn reject-button" disabled={acting === selectedBid.id} onClick={() => reject(selectedBid.id)}>Reject Quote</button><button className="review-btn" disabled={acting === selectedBid.id} onClick={() => accept(selectedBid.id)}>{acting === selectedBid.id ? 'Processing...' : 'Accept Quote & Create Order'}</button></div></div></div>}
  </div>;
}
