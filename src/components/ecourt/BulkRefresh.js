import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ecourtApi } from './ecourtApi';
import { ecPath, parseCnrText } from './ecourtUtils';
import { ErrorBox, PageHeader } from './EcourtUi';

const BADGE = { COMPLETED: 'ec-badge-green', PENDING: 'ec-badge-orange', FAILED: 'ec-badge-red', INVALID: 'ec-badge-grey', NOT_REQUESTED: 'ec-badge-grey' };
const REASON = { CNR_NOT_FOUND: 'CNR not found on eCourts', TEMPORARY_ERROR: 'Court server busy, try later', TIMEOUT: 'Court server timed out' };
const time = (iso) => (iso ? new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '—');

export default function BulkRefresh() {
  const [text, setText] = useState('');
  const [queued, setQueued] = useState(null);
  const [statusRows, setStatusRows] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const preview = useMemo(() => parseCnrText(text), [text]);

  const queue = async () => {
    setBusy(true);
    setError(null);
    try {
      const r = await ecourtApi.bulkRefresh(preview.valid);
      setQueued({ ...r, cnrs: preview.valid });
      setStatusRows(null);
    } catch (e) {
      setError(e);
    } finally {
      setBusy(false);
    }
  };

  const checkStatus = async () => {
    setBusy(true);
    setError(null);
    try {
      const r = await ecourtApi.bulkRefreshStatus(queued.cnrs);
      setStatusRows(r.results || []);
    } catch (e) {
      setError(e);
    } finally {
      setBusy(false);
    }
  };

  const tooMany = preview.valid.length > 50;

  return (
    <div>
      <PageHeader title="Bulk Refresh" subtitle="Pull fresh data from the official eCourts servers for up to 50 cases at once." />

      <div className="ec-card mb-3">
        <label htmlFor="br-cnrs" className="ec-label">CNRs (one per line, or separated by commas)</label>
        <textarea id="br-cnrs" className="form-control ec-mono" rows={7} value={text} onChange={(e) => setText(e.target.value)}
          placeholder={'DLHC010024442025\nHCBM050012342023'} />
        <div className="d-flex flex-wrap align-items-center gap-2 mt-3">
          <span className="ec-badge ec-badge-green">{preview.valid.length} valid</span>
          {preview.duplicates > 0 && <span className="ec-badge ec-badge-grey">{preview.duplicates} duplicate{preview.duplicates > 1 ? 's' : ''} removed</span>}
          {preview.invalid.length > 0 && <span className="ec-badge ec-badge-red" title={preview.invalid.join(', ')}>{preview.invalid.length} invalid</span>}
          {tooMany && <span className="ec-field-error m-0">Maximum 50 per batch</span>}
          <span className="ms-auto" />
          <button type="button" className="btn btn-ec" disabled={!preview.valid.length || tooMany || busy} onClick={queue}>
            {busy && !queued ? 'Queuing…' : 'Refresh these cases'}
          </button>
        </div>
      </div>

      <ErrorBox error={error} />

      {queued && (
        <div className="row g-3 mb-3">
          {[['Already fresh', queued.refreshed, 'ec-badge-green'], ['Queued for re-scrape', queued.queued, 'ec-badge-orange'], ['Invalid', queued.invalid, 'ec-badge-red']].map(([title, list, cls]) => (
            <div className="col-12 col-md-4" key={title}>
              <div className="ec-fact h-100">
                <div className="d-flex justify-content-between"><span className="ec-overline">{title}</span><span className={`ec-badge ${cls}`}>{(list || []).length}</span></div>
                <div className="ec-mono small mt-2 ec-prewrap">{(list || []).join('\n') || '—'}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {queued && (
        <div className="ec-card p-0">
          <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 p-3">
            <span className="small ec-muted">Checking status is free. Check here before refreshing the same case again.</span>
            <button type="button" className="btn btn-ec-outline btn-sm" onClick={checkStatus} disabled={busy}>{busy ? 'Checking…' : 'Check status'}</button>
          </div>
          {statusRows && (
            <div className="table-responsive">
              <table className="table ec-table mb-0">
                <thead><tr><th>CNR</th><th>Status</th><th>Requested</th><th>Completed</th><th>Credits</th><th /></tr></thead>
                <tbody>
                  {statusRows.map((r) => (
                    <tr key={r.cnr}>
                      <td className="ec-mono">{r.cnr}</td>
                      <td><span className={`ec-badge ${BADGE[r.status] || 'ec-badge-grey'}`}>{r.status}</span></td>
                      <td>{time(r.requestedAt)}</td>
                      <td>{time(r.completedAt)}</td>
                      <td>{r.creditsCharged != null ? `${r.creditsCharged}${r.refunded ? ' · refunded' : ''}` : '—'}</td>
                      <td className="small">
                        {r.status === 'COMPLETED' && <Link to={ecPath(`case/${r.cnr}`)} className="ec-link">Open</Link>}
                        {r.status === 'FAILED' && <span className="ec-muted">{REASON[r.failureReason] || r.failureReason}</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}