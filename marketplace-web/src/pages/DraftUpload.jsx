import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { api, apiErrorMessage } from '../config/api';
import { formatDate, paiseToRupees } from '../utils/format';

function sizeLabel(size) { return size ? `${(Number(size) / 1024 / 1024).toFixed(1)} MB` : '—'; }

export default function DraftUpload() {
  const { id } = useParams();
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const [order, setOrder] = useState(null);
  const [postedFiles, setPostedFiles] = useState([]);
  const [completedFiles, setCompletedFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const orderResponse = await api.get(`/marketplace/orders/${id}`);
      const requestFilesResponse = await api.get(`/marketplace/requests/${orderResponse.data.order.request_id}/files`);
      const completedFilesResponse = await api.get(`/marketplace/orders/${id}/files`);
      setOrder(orderResponse.data.order);
      setPostedFiles(requestFilesResponse.data.files || []);
      setCompletedFiles(completedFilesResponse.data.files || []);
    } catch (error) { toast.error(apiErrorMessage(error)); } finally { setLoading(false); }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const previewRequestFile = async (file) => {
    try {
      const response = await api.get(`/marketplace/requests/${order.request_id}/files/${file.id}`, { responseType: 'blob' });
      const url = URL.createObjectURL(response.data);
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch (error) { toast.error(apiErrorMessage(error)); }
  };

  const downloadCompleted = async () => {
    if (!completedFiles.length) { toast.info('No completed draft is available yet.'); return; }
    try {
      const file = completedFiles[0];
      const response = await api.get(`/marketplace/orders/${id}/files/${file.id}`, { responseType: 'blob' });
      const url = URL.createObjectURL(response.data);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = file.original_name;
      anchor.click();
      URL.revokeObjectURL(url);
    } catch (error) { toast.error(apiErrorMessage(error)); }
  };

  const upload = async () => {
    const files = Array.from(inputRef.current?.files || []);
    if (!files.length) { toast.error('Select at least one completed draft'); return; }
    setUploading(true);
    try {
      const formData = new FormData();
      files.forEach((file) => formData.append('files', file));
      await api.post(`/marketplace/orders/${id}/files`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Completed draft uploaded');
      inputRef.current.value = '';
      load();
    } catch (error) { toast.error(apiErrorMessage(error)); } finally { setUploading(false); }
  };

  if (loading) return <div className="workspace-empty">Loading Advocate Workspace...</div>;
  if (!order) return <div className="workspace-empty">Order not found.</div>;

  return <div className="upload-page">
    <button className="back-link" onClick={() => navigate(`/marketplace/orders/${id}/track`)}>&larr; Back to Order Tracking</button>
    <div className="post-head"><div><h1 className="marketplace-title">Advocate Workspace</h1><p className="marketplace-subtitle">Collaborate with your advocate on {order.order_number}.</p></div></div>
    <section className="advocate-order-head"><div className="advocate-avatar">{(order.advocate_name || 'AD').split(' ').map((word) => word[0]).join('').slice(0, 2)}</div><div><h2>{order.advocate_name || 'Assigned Advocate'} <span className="verified-badge">✓ Verified Advocate</span></h2><span>Commercial &amp; Corporate Law</span></div><div className="order-head-right"><small>ORDER</small><strong>{order.title}</strong><b>Draft Status: In Progress</b></div></section>
    <div className="quote-tabs"><button className="quote-tab active">Upload a Draft</button><button className="quote-tab" onClick={() => completedFiles.length ? document.querySelector('.uploaded-complete-list')?.scrollIntoView({ behavior: 'smooth' }) : toast.info('No completed draft is available yet.')}>View &amp; Download Completed Drafts</button><button className="quote-tab" onClick={() => navigate(`/marketplace/orders/${id}/track`)}>Track Order</button><button className="quote-tab" onClick={() => navigate('/marketplace/requests/new')}>Draft Request</button><button className="quote-tab" onClick={() => navigate('/marketplace/requests/review')}>Review &amp; Accept Bids</button></div>
    <section className="upload-summary-card"><div><small>REQUEST</small><strong>{order.title}</strong></div><div><small>REQUIRED BY</small><strong>{formatDate(order.deadline)}</strong></div><div className="summary-actions"><button className="yellow-btn" onClick={() => navigate(`/marketplace/requests/${order.request_id}`)}>◉ View</button><button className="download-btn" onClick={downloadCompleted}>Download　⇩</button></div></section>
    <section className="order-overview-card"><div className="overview-heading"><h2>Order Overview</h2></div><div className="drafting-timeline"><div className="overview-labels"><span>Requirement Received</span><span>Drafting Started</span><span>First Draft</span><span>Review</span><span>Final Delivery</span></div><div className="overview-line"><i className="done" /><i className="done" /><i className="current" /><i /><i /></div></div><div className="overview-stats"><div><small>Draft status</small><strong>In Progress</strong></div><div><small>First draft expected</small><strong>{formatDate(order.deadline)}</strong></div><div><small>Revisions used</small><strong>0 of 2</strong></div><div><small>Amount paid</small><strong>{paiseToRupees(order.amount)}</strong></div></div><div className="workspace-notice">ⓘ <span>Your advocate is currently preparing the first draft.</span></div><div className="supporting-heading">YOUR SUPPORTING DOCUMENTS</div><div className="supporting-file-grid">{postedFiles.length ? postedFiles.map((file) => <button className="supporting-file" key={file.id} onClick={() => previewRequestFile(file)}><b>{file.original_name.toLowerCase().endsWith('pdf') ? 'PDF' : 'DOCX'}</b><span><strong>{file.original_name}</strong><small>{sizeLabel(file.file_size)} · Shared with advocate</small></span></button>) : <span className="document-empty">No supporting documents were posted.</span>}</div></section>
    <section className="workspace-detail-card upload-completed"><h2>↗ Upload Completed Draft</h2><label className="completed-drop"><input ref={inputRef} type="file" hidden multiple accept=".pdf,.doc,.docx" /><span>↥</span><strong>Drag Your Completed File Here or <em>Browse Files</em></strong><small>Accepted Format DOC,DOCX,PDF | Max File Size: 25 MB</small></label>{completedFiles.length > 0 && <div className="uploaded-complete-list">{completedFiles.map((file) => <span key={file.id}>✓ {file.original_name}</span>)}</div>}</section><button className="review-btn upload-submit" disabled={uploading} onClick={upload}>{uploading ? 'Uploading...' : 'Upload & Submit'}</button>
  </div>;
}
