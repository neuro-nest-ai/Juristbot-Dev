import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ecourtApi } from './ecourtApi';
import { ecPath, fmtDate, caseTitle, statusBadge } from './ecourtUtils';
import { Loader, ErrorBox, Empty, PageHeader, Segmented } from './EcourtUi';

function ChipField({ id, label, values, onChange, placeholder }) {
  const [text, setText] = useState('');
  const add = () => {
    const v = text.trim();
    if (v && !values.includes(v) && values.length < 10) onChange([...values, v]);
    setText('');
  };
  return (
    <div className="col-12 col-md-4">
      <label htmlFor={id} className="ec-label">{label}</label>
      <div className="ec-chipbox">
        {values.map((v) => (
          <span className="ec-chip" key={v}>
            {v}
            <button type="button" aria-label={`Remove ${v}`} onClick={() => onChange(values.filter((x) => x !== v))}>×</button>
          </span>
        ))}
        <input id={id} className="ec-chip-input" value={text} placeholder={values.length ? 'add another (OR)' : placeholder}
          onChange={(e) => setText(e.target.value)} onBlur={add}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); add(); } }} />
      </div>
    </div>
  );
}

const MATCH_MODES = [
  { value: 'all', label: 'All words' },
  { value: 'phrase', label: 'Exact' },
  { value: 'fuzzy', label: 'Fuzzy' },
  { value: 'any', label: 'Any word' },
];

export default function CaseSearch() {
  const [query, setQuery] = useState('');
  const [litigants, setLitigants] = useState([]);
  const [advocates, setAdvocates] = useState([]);
  const [judges, setJudges] = useState([]);
  const [mode, setMode] = useState('all');
  const [status, setStatus] = useState('');
  const [caseType, setCaseType] = useState('');
  const [page, setPage] = useState(1);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const run = async (opts = {}) => {
    const p = opts.page || 1;
    const st = opts.status !== undefined ? opts.status : status;
    const ct = opts.caseType !== undefined ? opts.caseType : caseType;
    if (!query.trim() && !litigants.length && !advocates.length && !judges.length) {
      setError({ message: 'Type a keyword or add at least one name.' });
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await ecourtApi.search({
        query: query.trim(), litigants, advocates, judges, nameMatchMode: mode,
        caseStatuses: st ? [st] : undefined, caseTypes: ct ? [ct] : undefined,
        page: p, pageSize: 20,
      });
      setData(res);
      setPage(p);
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = (e) => { e.preventDefault(); run({ page: 1 }); };
  const pickFacet = (kind, value) => {
    if (kind === 'status') { const v = status === value ? '' : value; setStatus(v); run({ page: 1, status: v }); }
    else { const v = caseType === value ? '' : value; setCaseType(v); run({ page: 1, caseType: v }); }
  };

  const lookup = (data && data.enumDescriptions && data.enumDescriptions.enumLookup) || {};
  const label = (field, code) => (lookup[field] && lookup[field][code]) || code;
  const facets = (data && data.facets) || {};
  const facetValues = (name) => Object.entries((facets[name] && facets[name].values) || {}).slice(0, 8);

  return (
    <div>
      <PageHeader title="Case Search" subtitle="Supreme Court, all High Courts, district courts and tribunals in one search." />

      <form className="ec-card mb-3" onSubmit={onSubmit}>
        <div className="row g-3">
          <div className="col-12">
            <label htmlFor="ec-q" className="ec-label">Keyword</label>
            <input id="ec-q" className="form-control" value={query} onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g. specific performance, cheque bounce, Section 138" />
          </div>
          <ChipField id="ec-lit" label="Litigant (either side)" values={litigants} onChange={setLitigants} placeholder="Name, press Enter" />
          <ChipField id="ec-adv" label="Advocate" values={advocates} onChange={setAdvocates} placeholder="Name, press Enter" />
          <ChipField id="ec-judge" label="Judge" values={judges} onChange={setJudges} placeholder="Name, press Enter" />
          <div className="col-12 d-flex flex-wrap align-items-end gap-3">
            <div>
              <div className="ec-label">Name match</div>
              <Segmented value={mode} options={MATCH_MODES} onChange={setMode} label="Name match mode" />
            </div>
            <div className="ms-auto">
              <button type="submit" className="btn btn-ec px-4" disabled={loading}>{loading ? 'Searching…' : 'Search'}</button>
            </div>
          </div>
        </div>
      </form>

      <ErrorBox error={error} />

      {data && (
        <div className="row g-3">
          <aside className="col-12 col-lg-3">
            {['caseStatus', 'caseType'].map((f) => (facetValues(f).length ? (
              <div className="ec-card ec-card-tight mb-3" key={f}>
                <div className="ec-overline mb-2">{f === 'caseStatus' ? 'Status' : 'Case type'}</div>
                {facetValues(f).map(([code, count]) => {
                  const active = f === 'caseStatus' ? status === code : caseType === code;
                  return (
                    <button key={code} type="button" className={`ec-facet${active ? ' active' : ''}`} aria-pressed={active}
                      onClick={() => pickFacet(f === 'caseStatus' ? 'status' : 'type', code)}>
                      <span>{label(f, code)}</span>
                      <span className="ec-mono ec-muted">{Number(count).toLocaleString('en-IN')}</span>
                    </button>
                  );
                })}
              </div>
            ) : null))}
          </aside>

          <section className="col-12 col-lg-9">
            <div className="d-flex justify-content-between ec-muted small mb-2">
              <span><strong className="ec-strong">{Number(data.totalHits || 0).toLocaleString('en-IN')}</strong> cases found</span>
              {data.processingTimeMs != null && <span>{data.processingTimeMs} ms</span>}
            </div>
            {loading && <Loader label="Searching…" />}
            {!loading && (!data.results || !data.results.length) && <Empty>No cases match. Try fewer filters or Fuzzy match.</Empty>}
            {!loading && (data.results || []).map((r) => {
              const pending = r.caseStatus === 'PENDING';
              return (
                <Link key={r.cnr} to={ecPath(`case/${r.cnr}`)} className="ec-result">
                  <div className="d-flex flex-wrap align-items-center gap-2">
                    <span className="ec-result-title">{caseTitle(r)}</span>
                    <span className={statusBadge(r.caseStatus)}>{label('caseStatus', r.caseStatus)}</span>
                    {r.caseType && <span className="ec-badge ec-badge-grey">{label('caseType', r.caseType)}</span>}
                  </div>
                  <div className="ec-muted small mt-1">
                    {label('courtCode', r.courtCode)}{r.registrationNumber ? ` · Reg. ${r.registrationNumber}` : ''}{r.caseCategory ? ` · ${r.caseCategory}` : ''}
                  </div>
                  {r.aiKeywords && r.aiKeywords.length > 0 && (
                    <div className="d-flex flex-wrap gap-1 mt-2">
                      {r.aiKeywords.slice(0, 5).map((k) => <span key={k} className="ec-tag">{k}</span>)}
                    </div>
                  )}
                  <div className="d-flex flex-wrap gap-3 small ec-muted mt-2">
                    <span>Filed <strong className="ec-strong">{fmtDate(r.filingDate)}</strong></span>
                    <span>{pending ? 'Next hearing' : 'Decided'} <strong className="ec-strong">{fmtDate(pending ? r.nextHearingDate : r.decisionDate)}</strong></span>
                    {r.petitionerAdvocates && r.petitionerAdvocates[0] && <span>Adv. {r.petitionerAdvocates[0]}</span>}
                    <span className="ec-mono">{r.cnr}</span>
                  </div>
                </Link>
              );
            })}
            {data.totalPages > 1 && (
              <div className="d-flex justify-content-center align-items-center gap-2 mt-3">
                <button type="button" className="btn btn-ec-outline btn-sm" disabled={page <= 1 || loading} onClick={() => run({ page: page - 1 })}>← Prev</button>
                <span className="ec-muted small">Page {page} of {data.totalPages}</span>
                <button type="button" className="btn btn-ec-outline btn-sm" disabled={!data.hasNextPage || loading} onClick={() => run({ page: page + 1 })}>Next →</button>
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}