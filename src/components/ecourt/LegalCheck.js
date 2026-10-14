import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ecourtApi } from './ecourtApi';
import { ecPath, fmtDate, sleep } from './ecourtUtils';
import { Loader, ErrorBox, Empty, PageHeader, Segmented } from './EcourtUi';

const PURPOSES = [
  ['vendor_onboarding', 'Vendor onboarding'],
  ['employment_screening', 'Employment screening'],
  ['tenant_verification', 'Tenant verification'],
  ['partnership_due_diligence', 'Partnership / deal due diligence'],
  ['litigation_research', 'Litigation research for a client'],
];
const BANDS = ['confirmed', 'probable', 'possible', 'excluded'];
const BAND_CLASS = { confirmed: 'ec-badge-yellow', probable: 'ec-badge-blue', possible: 'ec-badge-grey', excluded: 'ec-badge-grey' };
const RISK_CLASS = { GREEN: 'ec-risk-green', AMBER: 'ec-risk-amber', RED: 'ec-risk-red' };
const STAGE = { name_variants: 'Matching name variants', court_search: 'Searching courts', fir_search: 'Screening FIRs & tribunals', identity_scoring: 'Scoring identity matches', report: 'Building report' };

const EMPTY_FORM = { type: 'individual', name: '', father_name: '', aliases: '', date_of_birth: '', addresses: '', company_name: '', directors: '', cin: '', purpose: 'vendor_onboarding', client_ref_no: '', ticket_size: '' };
const splitList = (s) => String(s || '').split(/[\n;]+/).map((x) => x.trim()).filter(Boolean);

function Counts({ title, obj }) {
  const entries = Object.entries(obj || {});
  if (!entries.length) return null;
  return (
    <div className="ec-fact h-100">
      <div className="ec-overline mb-1">{title}</div>
      {entries.map(([k, v]) => (
        <div className="d-flex justify-content-between small" key={k}><span className="ec-muted">{k.replace(/_/g, ' ')}</span><strong>{v}</strong></div>
      ))}
    </div>
  );
}

function Report({ report, filters, setFilters, onReload, code }) {
  const [log, setLog] = useState(null);
  const risk = report.risk || {};
  const sum = report.summary || {};
  const matches = report.matches || [];

  const showLog = async () => {
    try { setLog(await ecourtApi.lcLog(code)); } catch (e) { setLog({ error: e.message }); }
  };

  return (
    <div className="d-flex flex-column gap-3">
      <div className="ec-card d-flex flex-wrap align-items-center gap-4">
        <div className={`ec-risk ${RISK_CLASS[risk.band] || ''}`}>
          <span className="ec-risk-score">{risk.score != null ? risk.score : '—'}</span>
          <span className="small">{risk.band || ''}</span>
        </div>
        <div className="flex-grow-1 ec-minw0">
          <div className="fw-bold fs-5">{risk.headline || 'Report ready'}</div>
          {(risk.rationale || []).map((r, i) => <div className="small" key={i}>{r}</div>)}
          <div className="small ec-muted mt-1">
            {sum.records_screened != null ? `${Number(sum.records_screened).toLocaleString('en-IN')} records screened · ` : ''}
            {risk.identity_confidence != null ? `identity confidence ${risk.identity_confidence} · ` : ''}
            only confirmed matters against the subject affect the score
          </div>
        </div>
        <button type="button" className="btn btn-ec-outline" onClick={() => window.print()}>Print / save PDF</button>
      </div>

      <div className="row g-2">
        <div className="col-6 col-lg-3"><Counts title="By band" obj={sum.by_band} /></div>
        <div className="col-6 col-lg-3"><Counts title="By status" obj={sum.by_status} /></div>
        <div className="col-6 col-lg-3"><Counts title="By nature" obj={sum.by_nature} /></div>
        <div className="col-6 col-lg-3"><Counts title="By role" obj={sum.by_role} /></div>
      </div>

      <div className="ec-card ec-card-tight d-flex flex-wrap align-items-end gap-3">
        <div>
          <div className="ec-label">Show matches</div>
          <div className="d-flex flex-wrap gap-2">
            {BANDS.map((b) => {
              const on = filters.bands.includes(b);
              return (
                <button type="button" key={b} className={`ec-pill${on ? ' active' : ''}`} aria-pressed={on}
                  onClick={() => setFilters({ ...filters, bands: on ? filters.bands.filter((x) => x !== b) : [...filters.bands, b] })}>{b}</button>
              );
            })}
          </div>
        </div>
        <div>
          <label htmlFor="lc-verb" className="ec-label">Detail</label>
          <select id="lc-verb" className="form-select form-select-sm" value={filters.verbosity} onChange={(e) => setFilters({ ...filters, verbosity: e.target.value })}>
            <option value="compact">Compact</option><option value="standard">Standard</option><option value="full">Full</option>
          </select>
        </div>
        <div>
          <label htmlFor="lc-min" className="ec-label">Min. match score</label>
          <select id="lc-min" className="form-select form-select-sm" value={filters.min_score} onChange={(e) => setFilters({ ...filters, min_score: e.target.value })}>
            {['20', '40', '60', '80'].map((v) => <option key={v} value={v}>{v}</option>)}
          </select>
        </div>
        <button type="button" className="btn btn-sm btn-ec" onClick={onReload}>Apply</button>
        <button type="button" className="btn btn-sm btn-link ec-link ms-auto" onClick={showLog}>Search log</button>
      </div>

      {log && <pre className="ec-order-text small">{JSON.stringify(log, null, 2)}</pre>}

      {matches.length === 0 ? <Empty>No matters in the selected bands.</Empty> : matches.map((m) => {
        const band = String(m.match_band || '').toLowerCase();
        return (
          <div className="ec-result" key={m.match_id || m.cnr}>
            <div className="d-flex flex-wrap align-items-center gap-2">
              {m.cnr ? <Link to={ecPath(`case/${m.cnr}`)} className="ec-result-title ec-link-plain">{m.cause_title || m.cnr}</Link> : <span className="ec-result-title">{m.cause_title}</span>}
              <span className={`ec-badge ${BAND_CLASS[band] || 'ec-badge-grey'}`}>{band || 'match'}</span>
              {m.severity && <span className="ec-badge ec-badge-grey">severity {m.severity}</span>}
            </div>
            <div className="small ec-muted mt-1">
              {(m.court && m.court.name) || ''}{m.nature ? ` · ${m.nature}` : ''}{m.subject_party ? ` · ${String(m.subject_party.role_group || m.subject_party.role || '').replace(/_/g, ' ')}` : ''}
            </div>
            <div className="d-flex flex-wrap gap-3 small ec-muted mt-1">
              <span>Status <strong className="ec-strong">{m.status_normalized || m.status || '—'}</strong></span>
              {m.next_hearing_date && <span>Next <strong className="ec-strong">{fmtDate(m.next_hearing_date)}</strong></span>}
              {m.match_confidence != null && <span>Match {m.match_confidence}</span>}
              {(m.acts_sections_readable || []).slice(0, 2).map((a) => <span key={a}>{a}</span>)}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function LegalCheck() {
  const [view, setView] = useState('new');
  const [form, setForm] = useState(EMPTY_FORM);
  const [consent, setConsent] = useState(false);
  const [phase, setPhase] = useState('form'); // form | running | report | failed
  const [code, setCode] = useState(null);
  const [status, setStatus] = useState(null);
  const [report, setReport] = useState(null);
  const [filters, setFilters] = useState({ bands: ['confirmed', 'probable'], verbosity: 'standard', min_score: '40' });
  const [error, setError] = useState(null);
  const [fieldErr, setFieldErr] = useState({});
  const [list, setList] = useState(null);
  const alive = useRef(true);
  useEffect(() => () => { alive.current = false; }, []);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const loadReport = useCallback(async (c, f) => {
    try {
      const r = await ecourtApi.lcReport(c, { verbosity: f.verbosity, min_score: f.min_score, bands: f.bands.join(',') });
      if (!alive.current) return;
      setReport(r);
      setPhase('report');
    } catch (e) {
      if (alive.current) setError(e);
    }
  }, []);

  const poll = useCallback(async (c) => {
    setPhase('running');
    while (alive.current) {
      try {
        const s = await ecourtApi.lcStatus(c);
        if (!alive.current) return;
        setStatus(s);
        if (s.status === 'completed') { await loadReport(c, filters); return; }
        if (s.status === 'failed') { setPhase('failed'); return; }
      } catch (e) {
        if (alive.current) { setError(e); setPhase('form'); }
        return;
      }
      await sleep(5000); // API asks for Retry-After: 5
    }
  }, [loadReport, filters]);

  const submit = async (e) => {
    e.preventDefault();
    const errs = {};
    const ind = form.type === 'individual';
    if (ind && form.name.trim().length < 2) errs.name = 'Enter the full name.';
    if (ind && !form.father_name.trim()) errs.father_name = "Father's name helps tell people with the same name apart.";
    if (!ind && form.company_name.trim().length < 2) errs.company_name = 'Enter the company name.';
    if (!consent) errs.consent = 'Confirm consent or another lawful basis before running a check.';
    setFieldErr(errs);
    if (Object.keys(errs).length) return;

    setError(null);
    setReport(null);
    setStatus(null);
    const subject = ind
      ? { name: form.name.trim(), father_name: form.father_name.trim(), aliases: splitList(form.aliases), date_of_birth: form.date_of_birth || undefined, addresses: splitList(form.addresses) }
      : { company_name: form.company_name.trim(), directors: splitList(form.directors), cin: form.cin.trim() || undefined };
    try {
      const r = await ecourtApi.lcSubmit({
        subject_type: form.type,
        subject,
        config: { purpose: form.purpose, client_ref_no: form.client_ref_no.trim() || undefined, ticket_size: form.ticket_size ? Number(form.ticket_size) : undefined },
        consent: { confirmed: true },
      });
      setCode(r.code);
      poll(r.code);
    } catch (err) {
      setError(err);
    }
  };

  const openCheck = (c) => {
    setView('new');
    setCode(c.code);
    setReport(null);
    setError(null);
    if (c.status === 'completed') loadReport(c.code, filters);
    else poll(c.code);
  };

  useEffect(() => {
    if (view !== 'list') return;
    setList(null);
    ecourtApi.lcList().then((r) => setList(r.checks || [])).catch(setError);
  }, [view]);

  const progress = status && status.progress ? Math.round((100 * status.progress.completed) / Math.max(1, status.progress.total)) : 5;

  return (
    <div>
      <PageHeader title="Legal Check" subtitle="Litigation background report on a person or company — for vendor onboarding, hiring or a deal.">
        <Segmented value={view} onChange={setView} label="Legal check views" options={[{ value: 'new', label: 'New check' }, { value: 'list', label: 'My checks' }]} />
      </PageHeader>
      <ErrorBox error={error} />

      {view === 'list' && (
        list === null ? <Loader /> : list.length === 0 ? <Empty>No checks yet.</Empty> : (
          <div className="ec-card p-0">
            <div className="table-responsive">
              <table className="table ec-table mb-0 align-middle">
                <thead><tr><th>Subject</th><th>Purpose</th><th>Reference</th><th>Status</th><th>Risk</th><th>Created</th><th /></tr></thead>
                <tbody>
                  {list.map((c) => (
                    <tr key={c.code}>
                      <td className="fw-semibold">{c.subject_name}<div className="small ec-muted ec-mono">{c.code}</div></td>
                      <td className="small">{(PURPOSES.find((p) => p[0] === c.purpose) || [null, c.purpose])[1]}</td>
                      <td className="small ec-mono">{c.client_ref_no || '—'}</td>
                      <td><span className={`ec-badge ${c.status === 'completed' ? 'ec-badge-green' : c.status === 'failed' ? 'ec-badge-red' : 'ec-badge-orange'}`}>{c.status}</span></td>
                      <td>{c.risk_score != null ? `${c.risk_score} · ${c.risk_band}` : '—'}</td>
                      <td className="small ec-muted">{c.created_at}</td>
                      <td className="text-end"><button type="button" className="btn btn-sm btn-ec-outline" disabled={c.status === 'failed'} onClick={() => openCheck(c)}>Open</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      )}

      {view === 'new' && phase === 'form' && (
        <form className="ec-card" onSubmit={submit} noValidate>
          <div className="mb-3">
            <Segmented value={form.type} onChange={(v) => setForm({ ...form, type: v })} label="Subject type"
              options={[{ value: 'individual', label: 'Individual' }, { value: 'company', label: 'Company' }]} />
          </div>
          <div className="row g-3">
            {form.type === 'individual' ? (
              <>
                <div className="col-12 col-md-6"><label htmlFor="lc-name" className="ec-label">Full name</label>
                  <input id="lc-name" className="form-control" value={form.name} onChange={set('name')} aria-invalid={Boolean(fieldErr.name)} />
                  {fieldErr.name && <div className="ec-field-error">{fieldErr.name}</div>}</div>
                <div className="col-12 col-md-6"><label htmlFor="lc-father" className="ec-label">Father's name</label>
                  <input id="lc-father" className="form-control" value={form.father_name} onChange={set('father_name')} aria-invalid={Boolean(fieldErr.father_name)} />
                  {fieldErr.father_name && <div className="ec-field-error">{fieldErr.father_name}</div>}</div>
                <div className="col-12 col-md-4"><label htmlFor="lc-alias" className="ec-label">Other names (optional)</label>
                  <input id="lc-alias" className="form-control" value={form.aliases} onChange={set('aliases')} placeholder="Separate with ;" /></div>
                <div className="col-12 col-md-4"><label htmlFor="lc-dob" className="ec-label">Date of birth (optional)</label>
                  <input id="lc-dob" type="date" className="form-control" value={form.date_of_birth} onChange={set('date_of_birth')} /></div>
                <div className="col-12 col-md-4"><label htmlFor="lc-addr" className="ec-label">Known city / address (optional)</label>
                  <input id="lc-addr" className="form-control" value={form.addresses} onChange={set('addresses')} placeholder="e.g. Coimbatore, Tamil Nadu" /></div>
              </>
            ) : (
              <>
                <div className="col-12 col-md-6"><label htmlFor="lc-co" className="ec-label">Company name</label>
                  <input id="lc-co" className="form-control" value={form.company_name} onChange={set('company_name')} aria-invalid={Boolean(fieldErr.company_name)} />
                  {fieldErr.company_name && <div className="ec-field-error">{fieldErr.company_name}</div>}</div>
                <div className="col-12 col-md-6"><label htmlFor="lc-cin" className="ec-label">CIN (optional)</label>
                  <input id="lc-cin" className="form-control ec-mono" value={form.cin} onChange={set('cin')} /></div>
                <div className="col-12"><label htmlFor="lc-dir" className="ec-label">Directors (optional)</label>
                  <input id="lc-dir" className="form-control" value={form.directors} onChange={set('directors')} placeholder="Separate with ;" /></div>
              </>
            )}
            <div className="col-12 col-md-5"><label htmlFor="lc-purpose" className="ec-label">Purpose</label>
              <select id="lc-purpose" className="form-select" value={form.purpose} onChange={set('purpose')}>
                {PURPOSES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select></div>
            <div className="col-6 col-md-4"><label htmlFor="lc-ref" className="ec-label">Your reference (optional)</label>
              <input id="lc-ref" className="form-control ec-mono" value={form.client_ref_no} onChange={set('client_ref_no')} placeholder="VENDOR-1042" /></div>
            <div className="col-6 col-md-3"><label htmlFor="lc-ticket" className="ec-label">Deal value ₹ (optional)</label>
              <input id="lc-ticket" className="form-control" inputMode="numeric" value={form.ticket_size} onChange={set('ticket_size')} /></div>
            <div className="col-12">
              <div className="form-check">
                <input className="form-check-input" type="checkbox" id="lc-consent" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
                <label className="form-check-label" htmlFor="lc-consent">I have the subject's consent or another lawful basis under the DPDP Act, 2023 for this check.</label>
              </div>
              {fieldErr.consent && <div className="ec-field-error">{fieldErr.consent}</div>}
            </div>
          </div>
          <div className="d-flex flex-wrap align-items-center gap-3 mt-3">
            <button type="submit" className="btn btn-ec px-4">Run Legal Check</button>
            <span className="small ec-muted">Takes about 90 seconds. [YOUR PRICE PER CHECK]</span>
          </div>
        </form>
      )}

      {view === 'new' && phase === 'running' && (
        <div className="ec-card">
          <div className="d-flex justify-content-between flex-wrap gap-2 mb-2">
            <strong>Checking… <span className="ec-mono small ec-muted">{code}</span></strong>
            <span className="small ec-muted">{status ? (STAGE[status.current_stage] || status.current_stage || status.status) : 'Queued'}</span>
          </div>
          <div className="progress ec-progress" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
            <div className="progress-bar" style={{ width: `${progress}%` }} />
          </div>
          <div className="small ec-muted mt-2">You can leave this page — the result will be in “My checks”.</div>
        </div>
      )}

      {view === 'new' && phase === 'failed' && (
        <div className="ec-alert ec-alert-error">This check could not be completed. Its charge is refunded automatically. <button type="button" className="btn btn-link ec-link p-0" onClick={() => setPhase('form')}>Start again</button></div>
      )}

      {view === 'new' && phase === 'report' && report && (
        <>
          <div className="d-flex justify-content-end mb-2">
            <button type="button" className="btn btn-sm btn-ec-outline" onClick={() => { setPhase('form'); setForm(EMPTY_FORM); setConsent(false); }}>New check</button>
          </div>
          <Report report={report} code={code} filters={filters} setFilters={setFilters} onReload={() => loadReport(code, filters)} />
        </>
      )}
    </div>
  );
}