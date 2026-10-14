import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faMagnifyingGlass, faCalendarDays, faArrowsRotate, faShieldHalved,
} from '@fortawesome/free-solid-svg-icons';
import { ecPath, normalizeCnr, CNR_RE } from './ecourtUtils';

const TOOLS = [
  { to: 'search', icon: faMagnifyingGlass, tone: 'blue', title: 'Case Search', text: 'Party, advocate, judge or keyword across the Supreme Court, High Courts, district courts and tribunals.' },
  { to: 'causelist', icon: faCalendarDays, tone: 'green', title: 'Cause List', text: 'Daily board by court, judge or advocate, or check if a case is listed by CNR.' },
  { to: 'refresh', icon: faArrowsRotate, tone: 'purple', title: 'Bulk Refresh', text: 'Pull fresh data for up to 50 cases at once from the official eCourts servers.' },
  { to: 'legal-check', icon: faShieldHalved, tone: 'red', title: 'Legal Check', text: 'Litigation background report on a person or company, with a risk score.' },
];

export default function EcourtHome() {
  const navigate = useNavigate();
  const [cnr, setCnr] = useState('');
  const [err, setErr] = useState('');

  const open = (e) => {
    e.preventDefault();
    const c = normalizeCnr(cnr);
    if (!CNR_RE.test(c)) {
      setErr('A CNR has 16 characters: 4 letters then 12 digits, e.g. TNCB010012342025.');
      return;
    }
    navigate(ecPath(`case/${c}`));
  };

  return (
    <div className="ec-home">
      <div className="text-center mb-4">
        <h1 className="ec-hero-title">eCourts</h1>
        <p className="ec-muted mb-0">Case status, orders and cause lists from every Indian court.</p>
      </div>

      <form className="ec-cnr-box mx-auto mb-4" onSubmit={open} noValidate>
        <label htmlFor="ec-home-cnr" className="ec-label">Open a case by CNR</label>
        <div className="d-flex gap-2">
          <input id="ec-home-cnr" className="form-control ec-mono" value={cnr} maxLength={20}
            placeholder="TNCB010012342025" onChange={(e) => { setCnr(e.target.value); setErr(''); }}
            aria-invalid={Boolean(err)} aria-describedby="ec-home-cnr-err" />
          <button type="submit" className="btn btn-ec">Open</button>
        </div>
        {err && <div id="ec-home-cnr-err" className="ec-field-error">{err}</div>}
      </form>

      <div className="row g-3 pt-3">
        {TOOLS.map((t) => (
          <div className="col-12 col-sm-6 col-xl-3 " key={t.to}>
            <Link to={ecPath(t.to)} className="ec-tool">
              <span className={`ec-tool-icon tone-${t.tone}`}><FontAwesomeIcon icon={t.icon} /></span>
              <span className="ec-tool-title">{t.title}</span>
              <span className="ec-tool-text">{t.text}</span>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}