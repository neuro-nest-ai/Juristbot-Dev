import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { api, apiErrorMessage } from '../config/api';

const initialForm = {
  title: '',
  description: '',
  deadline: '',
  time: '',
  notes: '',
  category: 'Drafting',
  jurisdiction: '',
  budget_min: '',
  budget_max: '',
};

function nextDateInputValue() {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export default function DraftPost() {
  const navigate = useNavigate();
  const location = useLocation();
  const draftState = location.state;
  const [form, setForm] = useState(() => ({ ...initialForm, ...(draftState?.form || {}) }));
  const [files, setFiles] = useState(() => draftState?.files || []);
  const [deliverables, setDeliverables] = useState(() => draftState?.deliverables || ['DOC', 'PDF']);
  const [saving, setSaving] = useState(false);
  const minimumDeadline = nextDateInputValue();

  const update = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));

  const onFiles = (event) => {
    setFiles(Array.from(event.target.files || []));
  };

  const removeFile = (fileName) => {
    setFiles((current) => current.filter((file) => file.name !== fileName));
  };

  const toggleDeliverable = (item) => {
    setDeliverables((current) => current.includes(item) ? current.filter((value) => value !== item) : [...current, item]);
  };

  const submit = async (event) => {
    event.preventDefault();
    if (!form.title.trim() || !form.description.trim() || !form.deadline) {
      toast.error('Please complete the title, description and required date.');
      return;
    }
    setSaving(true);
    try {
      navigate('/marketplace/requests/review', {
        state: {
          form,
          files,
          deliverables,
        },
      });
    } catch (error) {
      toast.error(apiErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <button className="back-link" onClick={() => navigate('/marketplace')}>&larr; Back to Marketplace</button>
      <div className="post-head">
        <div><h1 className="post-title">Post a Legal Draft</h1><p className="post-subtitle">Provide the details below so advocates can understand your requirement and submit accurate quotes.</p></div>
        <button className="sample-link" type="button" onClick={() => setForm({ ...initialForm, title: 'Commercial Lease Agreement', description: 'Prepare a comprehensive commercial lease agreement covering rent, security deposit, termination, renewal, maintenance responsibilities, indemnity, dispute resolution, and applicable legal clauses.', notes: 'Include a 3-year lock-in period, 5% annual rent escalation and a fit-out period of 45 days.' })}>Fill with sample requirement</button>
      </div>

      <form onSubmit={submit}>
        <div className="form-card">
          <section className="form-section">
            <div className="section-label"><span className="section-badge">A</span><div><strong>Request Details</strong><small>A clear title and scope help advocates quote accurately.</small></div></div>
            <div className="form-grid">
               <label><span className="field-label">Request Title</span><input className="draft-input" name="title" value={form.title} onChange={update} minLength={3} maxLength={200} placeholder="e.g. Commercial Lease Agreement" /></label>
              <label><span className="field-label">Document Type</span><select className="draft-input" name="category" value={form.category} onChange={update}><option>Drafting</option><option>Agreement</option><option>Notice</option><option>Petition</option><option>Other</option></select></label>
               <label style={{ gridColumn: '1 / -1' }}><span className="field-label">Scope / Description</span><textarea className="draft-textarea" name="description" value={form.description} onChange={update} minLength={20} maxLength={5000} placeholder="Explain what you need drafted, including parties, jurisdiction and important clauses." /><span className="field-help">Be specific about clauses, parties and jurisdiction.</span></label>
            </div>
          </section>

          <section className="form-section">
            <div className="section-label"><span className="section-badge">B</span><div><strong>Delivery Requirements</strong><small>When do you need the final draft?</small></div></div>
            <div className="form-grid">
               <label><span className="field-label">Required By</span><input className="draft-input" type="date" name="deadline" value={form.deadline} min={minimumDeadline} onChange={update} /></label>
              <label><span className="field-label">Preferred Delivery Time <em>(optional)</em></span><input className="draft-input" type="time" name="time" value={form.time} onChange={update} /></label>
            </div>
          </section>

          <section className="form-section">
            <div className="section-label"><span className="section-badge">C</span><div><strong>Deliverables</strong><small>File formats you want to receive.</small></div></div>
            <div className="deliverables">{['DOC', 'PDF'].map((item) => <button type="button" key={item} className={`deliverable ${deliverables.includes(item) ? 'selected' : ''}`} onClick={() => toggleDeliverable(item)}><span className="deliverable-check">{deliverables.includes(item) ? '✓' : ''}</span>{item}</button>)}</div>
          </section>

          <section className="form-section">
            <div className="section-label"><span className="section-badge">F</span><div><strong>Additional Requirements</strong><small>Optional instructions for the advocate.</small></div></div>
             <label><span className="field-label">Additional notes <em>(optional)</em></span><textarea className="draft-textarea" name="notes" value={form.notes} onChange={update} maxLength={2000} placeholder="Mention special clauses, style preferences or other instructions." /></label>
          </section>

          <section className="form-section">
            <div className="section-label"><span className="section-badge">G</span><div><strong>Supporting Documents</strong><small>Title deeds, term sheets or earlier drafts.</small></div></div>
            <div>
              <label className="upload-box"><input type="file" hidden multiple accept=".pdf,.doc,.docx" onChange={onFiles} /><div><span><svg width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M8.15755 11.825V0.824951M12.7409 5.40828L8.15755 0.824951L3.57422 5.40828M0.824219 15.4916H15.4909" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round" stroke="#6E4E00" /></svg></span><strong>Upload supporting documents</strong><small>PDF, DOC, DOCX · Click to browse</small></div></label>
              {files.length > 0 && <div className="uploaded-file-list">{files.map((file) => <div className="uploaded-file-card" key={file.name}><span className="uploaded-file-type">{file.name.split('.').pop().toUpperCase()}</span><span className="uploaded-file-info"><strong>{file.name}</strong><small>{Math.ceil(file.size / 1024)} KB · Uploaded</small></span><button type="button" className="uploaded-file-remove" aria-label={`Remove ${file.name}`} onClick={() => removeFile(file.name)}>×</button></div>)}</div>}
            </div>
          </section>
        </div>
        <div className="post-footer"><span>Step 1 of 5 · All fields except optional ones are required</span><button className="review-btn" type="submit" disabled={saving}>{saving ? 'Saving...' : 'Review Requirement  →'}</button></div>
      </form>
    </div>
  );
}
