import React, { useCallback, useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import { citationsApi } from './Citationsapi';
import { Loader, ErrorBox, Empty, PageHeader, Segmented } from '../ecourt/EcourtUi';
import { UsageBadge, PoweredBy, JudgmentRow } from './Citationui';
import VerifyCitation from './VerifyCitation';

const COURTS = [
  { value: 'all', label: 'All courts' },
  { value: 'supremecourt', label: 'Supreme Court' },
  { value: 'highcourts', label: 'High Courts' },
  { value: 'tribunals', label: 'Tribunals' },
];

export default function CitationSearch() {
  const [params, setParams] = useSearchParams();
  const mode = params.get('mode') === 'verify' ? 'verify' : 'search';
  const q = params.get('q') || '';
  const court = params.get('court') || 'all';
  const from = params.get('from') || '';
  const to = params.get('to') || '';
  const page = Math.max(0, Number(params.get('page')) || 0);

  // form fields (only applied to the URL on submit)
  const [text, setText] = useState(q);
  const [courtSel, setCourtSel] = useState(court);
  const [fromSel, setFromSel] = useState(from);
  const [toSel, setToSel] = useState(to);
  const [showDates, setShowDates] = useState(Boolean(from || to));

  const [data, setData] = useState(null);
  const [usage, setUsage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    citationsApi.usage().then(setUsage).catch(() => {});
  }, []);

  const run = useCallback(async () => {
    if (!q) { setData(null); return; }
    setLoading(true);
    setError(null);
    try {
      const r = await citationsApi.search({ q, court, from, to, page });
      setData(r);
      if (r.usage) setUsage(r.usage);
    } catch (e) {
      setError(e);
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [q, court, from, to, page]);

  useEffect(() => { run(); }, [run]);

  const submit = (e) => {
    e.preventDefault();
    const t = text.trim();
    if (t.length < 2) { setError({ code: 'INVALID_INPUT', message: 'Type at least 2 characters.' }); return; }
    const next = { q: t };
    if (courtSel !== 'all') next.court = courtSel;
    if (showDates && fromSel) next.from = fromSel;
    if (showDates && toSel) next.to = toSel;
    setParams(next);
  };

  const goPage = (p) => {
    const next = Object.fromEntries(params.entries());
    next.page = String(p);
    setParams(next);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const setMode = (m) => setParams(m === 'verify' ? { mode: 'verify' } : (q ? { q } : {}));

  const results = data ? data.results : [];

  return (
    <div className="cite-page">
      <PageHeader title="Citations" subtitle="Search Indian judgments and see what each one cites and who cites it.">
        <UsageBadge usage={usage} />
        <Segmented label="Citations mode" value={mode} onChange={setMode}
          options={[{ value: 'search', label: 'Search judgments' }, { value: 'verify', label: 'Verify a citation' }]} />
      </PageHeader>

      {mode === 'verify' ? (
        <VerifyCitation onUsage={setUsage} />
      ) : (
        <>
          <form className="ec-card mb-3" onSubmit={submit} noValidate>
            <label htmlFor="cite-q" className="ec-label">Case name, section, topic or citation</label>
            <div className="d-flex flex-wrap gap-2">
              <input id="cite-q" className="form-control flex-grow-1 cite-q" value={text} maxLength={300}
                placeholder='e.g. right to privacy, "Section 498A", Puttaswamy'
                onChange={(e) => setText(e.target.value)} />
              <select className="form-select cite-court" aria-label="Court" value={courtSel} onChange={(e) => setCourtSel(e.target.value)}>
                {COURTS.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
              <button type="submit" className="btn btn-ec px-4" disabled={loading}>
                <FontAwesomeIcon icon={faMagnifyingGlass} /> Search
              </button>
            </div>
            <div className="mt-2">
              {showDates ? (
                <div className="d-flex flex-wrap align-items-end gap-2">
                  <div>
                    <label htmlFor="cite-from" className="ec-label">From</label>
                    <input id="cite-from" type="date" className="form-control" value={fromSel} onChange={(e) => setFromSel(e.target.value)} />
                  </div>
                  <div>
                    <label htmlFor="cite-to" className="ec-label">To</label>
                    <input id="cite-to" type="date" className="form-control" value={toSel} onChange={(e) => setToSel(e.target.value)} />
                  </div>
                  <button type="button" className="btn btn-link ec-link" onClick={() => { setShowDates(false); setFromSel(''); setToSel(''); }}>Clear dates</button>
                </div>
              ) : (
                <button type="button" className="btn btn-link ec-link p-0" onClick={() => setShowDates(true)}>+ Date range</button>
              )}
            </div>
            <div className="small ec-muted mt-2">
              Tip: put exact phrases in quotes. Repeat searches and saved judgments are free.
            </div>
          </form>

          <ErrorBox error={error} onRetry={error && error.code !== 'DAILY_LIMIT' && error.code !== 'INVALID_INPUT' ? run : undefined} />

          {loading && <Loader label="Searching judgments…" />}

          {!loading && data && (
            results.length === 0 ? (
              <Empty>No judgments found. Try fewer words or another court.</Empty>
            ) : (
              <>
                <div className="d-flex justify-content-between align-items-center mb-2 small ec-muted">
                  <span>{data.found ? `Results ${data.found}` : `${results.length} results`}</span>
                  {data.cached && <span>Saved result · free</span>}
                </div>
                {results.map((r) => (
                  <JudgmentRow key={r.tid} LinkComponent={Link} to={`/citations/doc/${r.tid}`}
                    title={r.title} court={r.court} date={r.date} snippet={r.snippet} citedBy={r.numCitedBy} />
                ))}
                <div className="d-flex justify-content-between mt-3">
                  <button type="button" className="btn btn-ec-outline" disabled={page === 0} onClick={() => goPage(page - 1)}>Previous</button>
                  <span className="align-self-center small ec-muted">Page {page + 1}</span>
                  <button type="button" className="btn btn-ec-outline" disabled={results.length < 10} onClick={() => goPage(page + 1)}>Next</button>
                </div>
              </>
            )
          )}

          {!loading && !data && !error && (
            <Empty>Search by case name, section, topic or citation to get started.</Empty>
          )}
        </>
      )}

      <PoweredBy />
    </div>
  );
}