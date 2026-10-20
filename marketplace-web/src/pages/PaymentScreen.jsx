import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { api, apiErrorMessage } from '../config/api';
import { formatDate, paiseToRupees } from '../utils/format';

export default function PaymentScreen() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);

  const load = useCallback(async () => {
    try {
      const response = await api.get(`/marketplace/orders/${id}`);
      setOrder(response.data.order);
    } catch (error) {
      toast.error(apiErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const pay = async () => {
    setPaying(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    toast.success('Payment successful. Order tracking is now active.');
    navigate(`/marketplace/orders/${id}/track`);
  };

  if (loading) return <div className="workspace-empty">Loading payment...</div>;
  if (!order) return <div className="workspace-empty">Order not found.</div>;

  return <div className="payment-page">
    <button className="back-link" onClick={() => navigate(`/marketplace/requests/${order.request_id}/quotes`)}>&larr; Back to Advocate Quotes</button>
    <div className="post-head"><div><h1 className="marketplace-title">Secure Payment</h1><p className="marketplace-subtitle">Complete payment to start tracking your legal draft.</p></div></div>
    <section className="payment-card">
      <div className="payment-card-heading"><span className="hero-kicker">ORDER PAYMENT</span><h2>{order.title}</h2><p>{order.order_number}</p></div>
      <div className="payment-facts"><span>Advocate<strong>{order.advocate_name || 'Assigned Advocate'}</strong></span><span>Required by<strong>{formatDate(order.deadline)}</strong></span><span>Amount payable<strong>{paiseToRupees(order.amount)}</strong></span></div>
      <div className="payment-method"><strong>Payment method</strong><span>Secure checkout · UPI, card or net banking</span></div>
      <button className="review-btn payment-submit" disabled={paying} onClick={pay}>{paying ? 'Processing...' : `Pay ${paiseToRupees(order.amount)}`}</button>
    </section>
  </div>;
}
