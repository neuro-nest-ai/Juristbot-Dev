import React, { useState } from 'react';
import { ecourtApi } from './ecourtApi';
import { ALERT_EVENTS, CNR_RE, normalizeCnr } from './ecourtUtils';
import { ErrorBox } from './EcourtUi';

/** Start tracking a case for a client. Pass `cnr` to lock it (from Case Detail), or leave empty to type one. */
export default function TrackCaseForm({ cnr: fixedCnr, onTracked, onCancel }) {
  const [cnr, setCnr] = useState(fixedCnr || '');
  const [clientName, setClientName] = useState('');
  const [phone, setPhone] = useState('');
  const [relationship, setRelationship] = useState('representing');
  const [events, setEvents] = useState(ALERT_EVENTS.map((e) => e.id).filter((id) => id !== 'transferred'));
  const [waOptIn, setWaOptIn] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [fieldErr, setFieldErr] = useState({});

  const toggleEvent = (id) => setEvents((list) => (list.includes(id) ? list.filter((x) => x !== id) : [...list, id]));

  const submit = async (e) => {
    e.preventDefault();
    const c = normalizeCnr(cnr);
    const digits = phone.replace(/\D/g, '').replace(/^91(?=\d{10}$)/, '');
    const errs = {};
    if (!CNR_RE.test(c)) errs.cnr = 'Enter a 16-character CNR (4 letters + 12 digits).';
    if (!clientName.trim()) errs.clientName = "Enter the client's name.";
    if (phone && !/^[6-9]\d{9}$/.test(digits)) errs.phone = 'Enter a 10-digit Indian mobile number.';
    if (!events.length) errs.events = 'Pick at least one event.';
    setFieldErr(errs);
    if (Object.keys(errs).length) return;

    setSaving(true);
    setError(null);
    try {
      const res = await ecourtApi.track({
        cnr: c, clientName: clientName.trim(), phone: digits || undefined, relationship, events,
        notifyWhatsapp: Boolean(digits), waOptIn: Boolean(digits) && waOptIn,
      });
      if (onTracked) onTracked(res);
    } catch (err) {
      setError(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="ec-card" onSubmit={submit} noValidate>
      <div className="row g-3">
        {!fixedCnr && (
          <div className="col-12 col-md-4">
            <label htmlFor="tf-cnr" className="ec-label">CNR</label>
            <input id="tf-cnr" className="form-control ec-mono" value={cnr} maxLength={20} placeholder="TNCB010012342025"
              onChange={(e) => setCnr(e.target.value)} aria-invalid={Boolean(fieldErr.cnr)} />
            {fieldErr.cnr && <div className="ec-field-error">{fieldErr.cnr}</div>}
          </div>
        )}
        <div className={`col-12 ${fixedCnr ? 'col-md-6' : 'col-md-4'}`}>
          <label htmlFor="tf-name" className="ec-label">Client name</label>
          <input id="tf-name" className="form-control" value={clientName} onChange={(e) => setClientName(e.target.value)}
            placeholder="Full name" aria-invalid={Boolean(fieldErr.clientName)} />
          {fieldErr.clientName && <div className="ec-field-error">{fieldErr.clientName}</div>}
        </div>
        <div className={`col-12 ${fixedCnr ? 'col-md-6' : 'col-md-4'}`}>
          <label htmlFor="tf-phone" className="ec-label">Client WhatsApp number (optional)</label>
          <div className="input-group">
            <span className="input-group-text">+91</span>
            <input id="tf-phone" className="form-control" inputMode="numeric" value={phone} maxLength={14}
              onChange={(e) => setPhone(e.target.value)} placeholder="10-digit mobile" aria-invalid={Boolean(fieldErr.phone)} />
          </div>
          {fieldErr.phone && <div className="ec-field-error">{fieldErr.phone}</div>}
        </div>

        <div className="col-12">
          <div className="ec-label">You are</div>
          <div className="d-flex flex-wrap gap-3">
            <div className="form-check">
              <input className="form-check-input" type="radio" name="tf-rel" id="tf-rel-rep" checked={relationship === 'representing'} onChange={() => setRelationship('representing')} />
              <label className="form-check-label" htmlFor="tf-rel-rep">Representing / a party</label>
            </div>
            <div className="form-check">
              <input className="form-check-input" type="radio" name="tf-rel" id="tf-rel-track" checked={relationship === 'tracking'} onChange={() => setRelationship('tracking')} />
              <label className="form-check-label" htmlFor="tf-rel-track">Only tracking</label>
            </div>
          </div>
        </div>

        <div className="col-12">
          <div className="ec-label">Send an alert when</div>
          <div className="row g-2">
            {ALERT_EVENTS.map((ev) => (
              <div className="col-12 col-sm-6 col-lg-4" key={ev.id}>
                <label className={`ec-option${events.includes(ev.id) ? ' active' : ''}`}>
                  <input type="checkbox" className="form-check-input mt-0" checked={events.includes(ev.id)} onChange={() => toggleEvent(ev.id)} />
                  <span>
                    <span className="d-block fw-semibold">{ev.label}</span>
                    <span className="d-block small ec-muted">{ev.hint}</span>
                  </span>
                </label>
              </div>
            ))}
          </div>
          {fieldErr.events && <div className="ec-field-error">{fieldErr.events}</div>}
        </div>

        {phone && (
          <div className="col-12">
            <div className="form-check">
              <input className="form-check-input" type="checkbox" id="tf-optin" checked={waOptIn} onChange={(e) => setWaOptIn(e.target.checked)} />
              <label className="form-check-label" htmlFor="tf-optin">
                The client agreed to receive case updates on WhatsApp from Jurist Bot.
              </label>
            </div>
            {!waOptIn && <div className="small ec-muted mt-1">Without this, the case is tracked but no WhatsApp message is sent.</div>}
          </div>
        )}
      </div>

      <ErrorBox error={error} />

      <div className="d-flex flex-wrap gap-2 mt-3">
        <button type="submit" className="btn btn-ec" disabled={saving}>{saving ? 'Saving…' : 'Start tracking'}</button>
        {onCancel && <button type="button" className="btn btn-ec-outline" onClick={onCancel}>Cancel</button>}
      </div>
    </form>
  );
}