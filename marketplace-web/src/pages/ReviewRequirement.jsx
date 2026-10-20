import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { api, apiErrorMessage } from '../config/api';
import { budgetRange, formatDate } from '../utils/format';

function EditAction({ onClick }) {
  return <button onClick={onClick}><svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M8.16667 2.33325L11.6667 5.83325L5.25 12.2499H1.75V8.74992L8.16667 2.33325Z" strokeWidth="1.16667" strokeLinecap="round" strokeLinejoin="round" stroke="#5F5D58" /></svg>Edit</button>;
}

export default function ReviewRequirement() {
  const location = useLocation();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const draft = location.state;

  if (!draft?.form) {
    return <div className="review-missing"><h1 className="post-title">Review Requirement</h1><p>Your draft details are no longer available.</p><button className="yellow-btn" onClick={() => navigate('/marketplace/requests/new')}>Return to Post Legal Draft</button></div>;
  }

  const { form, files = [], deliverables = [] } = draft;
  const submit = async () => {
    setSubmitting(true);
    try {
      const { data } = await api.post('/marketplace/requests', {
        title: form.title,
        description: form.description,
        category: form.category,
        jurisdiction: form.jurisdiction || null,
        deadline: form.deadline,
        budget_min: form.budget_min ? Number(form.budget_min) : null,
        budget_max: form.budget_max ? Number(form.budget_max) : null,
      });
      if (files.length) {
        const uploadData = new FormData();
        files.forEach((file) => uploadData.append('files', file));
        await api.post(`/marketplace/requests/${data.request.id}/files`, uploadData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }
      toast.success('Legal draft request posted');
      navigate(`/marketplace/requests/${data.request.id}/quotes`);
    } catch (error) {
      toast.error(apiErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  const edit = () => navigate('/marketplace/requests/new', { state: { form, files, deliverables } });
  const fileSize = (file) => file.size ? `${Math.max(1, Math.round(file.size / 1024))} KB` : 'Attached';

  return <div className="review-page">
    <button className="back-link" onClick={edit}>&larr; Back to form</button>
    <div className="review-page-title"><div><h1 className="post-title">Review Your Requirement</h1><p className="post-subtitle">Please verify your requirement before publishing it to the advocate marketplace.</p></div></div>

    <section className="review-summary-card">
       <div className="review-summary-heading"><span>REQUEST DETAILS</span><EditAction onClick={edit} /></div>
      <h2>{form.title}</h2>
      <p>{form.description}</p>
    </section>

    <div className="review-two-column">
       <section className="review-summary-card compact-card"><div className="review-summary-heading"><span>DELIVERY</span><EditAction onClick={edit} /></div><div className="review-row"><span>Required By</span><strong>{formatDate(form.deadline)}</strong></div><div className="review-row"><span>Preferred Delivery</span><strong>{form.time || 'Not specified'}</strong></div></section>
       <section className="review-summary-card compact-card"><div className="review-summary-heading"><span>DELIVERABLES &amp; REVISIONS</span><EditAction onClick={edit} /></div><div className="review-row"><span>Formats</span><strong>{deliverables.length ? deliverables.join(' + ') : 'Not specified'}</strong></div><div className="review-row"><span>Revision allowance</span><strong>2 Revisions</strong></div></section>
    </div>

     <section className="review-summary-card"><div className="review-summary-heading"><span>ADDITIONAL REQUIREMENTS</span><EditAction onClick={edit} /></div><p>{form.notes || 'No additional requirements added.'}</p></section>
     <section className="review-summary-card"><div className="review-summary-heading"><span>SUPPORTING DOCUMENTS</span><EditAction onClick={edit} /></div>{files.length ? <div className="review-file-grid">{files.map((file) => <div className="review-file" key={file.name}><b>{file.name.toLowerCase().endsWith('pdf') ? 'PDF' : 'DOCX'}</b><span><strong>{file.name}</strong><small>{fileSize(file)}</small></span></div>)}</div> : <p>No supporting documents attached.</p>}</section>
    <div className="review-notice">ⓘ <span>Once published, your requirement will be visible to eligible advocates who can submit their quotes.</span></div>
    <div className="review-footer"><span>Step 2 of 5 · You can edit anything before publishing.</span><div><button className="outline-btn" onClick={edit}>Edit</button><button className="review-btn" disabled={submitting} onClick={submit}>{submitting ? 'Publishing...' : 'Publish Request  →'}</button></div></div>
  </div>;
}
