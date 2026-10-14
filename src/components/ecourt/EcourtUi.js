import React from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft } from '@fortawesome/free-solid-svg-icons';

export function Loader({ label = 'Loading…' }) {
  return (
    <div className="d-flex align-items-center gap-2 ec-muted py-3" role="status">
      <span className="spinner-border spinner-border-sm" aria-hidden="true" />
      <span>{label}</span>
    </div>
  );
}

const FRIENDLY = {
  NETWORK: 'Cannot reach the server. Check your connection.',
  TIMEOUT: 'This is taking too long. Please try again.',
  RATE_LIMITED: 'Too many requests. Please wait a minute and try again.',
  ECOURTS_NOT_CONFIGURED: 'eCourts is not set up on the server yet.',
  UPSTREAM_TIMEOUT: 'The court data service is slow right now. Please try again.',
  UPSTREAM_UNREACHABLE: 'The court data service is not reachable right now. Please try again.',
  INSUFFICIENT_CREDITS: 'eCourts credits are over. Please contact the admin.',
};

export function ErrorBox({ error, onRetry }) {
  if (!error) return null;
  const msg = FRIENDLY[error.code] || error.message || 'Something went wrong';
  return (
    <div className="ec-alert ec-alert-error d-flex flex-wrap align-items-center gap-2 my-3" role="alert">
      <span className="flex-grow-1">{msg}</span>
      {onRetry && <button type="button" className="btn btn-sm btn-ec-outline" onClick={onRetry}>Try again</button>}
    </div>
  );
}

export function Empty({ children }) {
  return <div className="ec-empty">{children}</div>;
}

export function PageHeader({ title, subtitle, children }) {
  return (
    <div className="d-flex flex-wrap align-items-end justify-content-between gap-3 mb-3">
      <div>
        <h1 className="ec-h1 mb-1">{title}</h1>
        {subtitle && <p className="ec-muted mb-0">{subtitle}</p>}
      </div>
      {children ? <div className="d-flex flex-wrap gap-2">{children}</div> : null}
    </div>
  );
}

export function BackLink({ to, children }) {
  return (
    <Link to={to} className="ec-back">
      <FontAwesomeIcon icon={faChevronLeft} /> {children}
    </Link>
  );
}

export function Segmented({ value, options, onChange, label }) {
  return (
    <div className="ec-segmented" role="tablist" aria-label={label}>
      {options.map((o) => (
        <button key={o.value} type="button" role="tab" aria-selected={value === o.value}
          className={value === o.value ? 'active' : ''} onClick={() => onChange(o.value)}>
          {o.label}
        </button>
      ))}
    </div>
  );
}