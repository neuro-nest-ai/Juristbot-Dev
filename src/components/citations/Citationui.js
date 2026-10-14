import React from 'react';

/** "3 / 50 lookups today" pill. Cached results are free and not counted. */
export function UsageBadge({ usage }) {
  if (!usage) return null;
  const low = usage.remaining <= Math.max(1, Math.floor(usage.limit * 0.2));
  return (
    <span className={`ec-badge ${low ? 'ec-badge-orange' : 'ec-badge-grey'}`} title="Saved judgments and repeat searches are free and not counted.">
      {usage.used} / {usage.limit} lookups today
    </span>
  );
}

/** Attribution required by Indian Kanoon's API terms. */
export function PoweredBy() {
  return (
    <p className="small ec-muted mt-4 mb-0">
      Judgments and citations powered by{' '}
      <a href="https://indiankanoon.org" target="_blank" rel="noopener noreferrer" className="ec-link">Indian Kanoon</a>.
      Always check the certified copy before relying on a judgment.
    </p>
  );
}

export function fmtDate(v) {
  if (!v) return '';
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(v));
  if (!m) return String(v);
  const d = new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3])));
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' });
}

/** One judgment row in a list (search results, cites, cited by, verify matches). */
export function JudgmentRow({ to, title, court, date, snippet, citedBy, LinkComponent }) {
  const L = LinkComponent;
  return (
    <L to={to} className="ec-result">
      <div className="ec-result-title">{title || 'Untitled judgment'}</div>
      {(court || date) && <div className="small ec-muted">{[court, fmtDate(date)].filter(Boolean).join(' · ')}</div>}
      {snippet && <div className="small mt-1 cite-snippet">{snippet}</div>}
      {citedBy ? <div className="small ec-muted mt-1">Cited by {Number(citedBy).toLocaleString('en-IN')}</div> : null}
    </L>
  );
}