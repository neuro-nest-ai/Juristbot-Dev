import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ecourtApi } from './ecourtApi';
import { ecPath, fmtDate, parseCnrText } from './ecourtUtils';
import { Loader, ErrorBox, Empty, PageHeader, Segmented } from './EcourtUi';

const PAGE = 50;
const asList = (v) => (Array.isArray(v) ? v : []);

function BoardView() {
  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [complexes, setComplexes] = useState([]);
  const [courts, setCourts] = useState([]);
  const [dates, setDates] = useState([]);
  const [loc, setLoc] = useState({ state: '', districtCode: '', courtComplexCode: '', court: '' });
  const [date, setDate] = useState('');
  const [filters, setFilters] = useState({ q: '', advocate: '', litigant: '', listType: '' });
  const [result, setResult] = useState(null);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => { ecourtApi.states().then((r) => setStates(asList(r))).catch(setError); }, []);

  useEffect(() => {
    setDistricts([]);
    if (loc.state) ecourtApi.districts(loc.state).then((r) => setDistricts(asList(r))).catch(setError);
  }, [loc.state]);

  useEffect(() => {
    setComplexes([]);
    if (loc.state && loc.districtCode) ecourtApi.complexes(loc.state, loc.districtCode).then((r) => setComplexes(asList(r))).catch(setError);
  }, [loc.state, loc.districtCode]);

  useEffect(() => {
    setCourts([]);
    if (loc.state && loc.districtCode && loc.courtComplexCode) {
      ecourtApi.courts(loc.state, loc.districtCode, loc.courtComplexCode).then((r) => setCourts(asList(r))).catch(setError);
    }
  }, [loc.state, loc.districtCode, loc.courtComplexCode]);

  useEffect(() => {
    setDates([]);
    setDate('');
    if (!loc.state) return;
    ecourtApi.availableDates(loc)
      .then((r) => { const list = asList(r); setDates(list.slice(0, 14)); if (list[0]) setDate(list[0]); })
      .catch(setError);
  }, [loc]);

  const setLevel = (key, value) => {
    const order = ['state', 'districtCode', 'courtComplexCode', 'court'];
    const next = { ...loc, [key]: value };
    order.slice(order.indexOf(key) + 1).forEach((k) => { next[k] = ''; });
    setLoc(next);
    setResult(null);
  };

  const search = async (newOffset = 0) => {
    setLoading(true);
    setError(null);
    try {
      const r = await ecourtApi.causeSearch({ ...loc, date, ...filters, limit: PAGE, offset: newOffset });
      setResult(r);
      setOffset(newOffset);
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  };

  const canSearch = loc.state || filters.q || filters.advocate || filters.litigant;
  const rows = (result && result.results) || [];

  return (
    <>
      <div className="ec-card mb-3">
        <div className="row g-3">
          <div className="col-12 col-md-6 col-xl-3">
            <label htmlFor="cl-state" className="ec-label">State</label>
            <select id="cl-state" className="form-select" value={loc.state} onChange={(e) => setLevel('state', e.target.value)}>
              <option value="">Select state</option>
              {states.map((s) => <option key={s.state} value={s.state}>{s.stateName}</option>)}
            </select>
          </div>
          <div className="col-12 col-md-6 col-xl-3">
            <label htmlFor="cl-district" className="ec-label">District / High Court</label>
            <select id="cl-district" className="form-select" value={loc.districtCode} disabled={!districts.length} onChange={(e) => setLevel('districtCode', e.target.value)}>
              <option value="">All districts</option>
              {districts.map((d) => <option key={d.districtCode} value={d.districtCode}>{d.districtName}</option>)}
            </select>
          </div>
          <div className="col-12 col-md-6 col-xl-3">
            <label htmlFor="cl-complex" className="ec-label">Court complex</label>
            <select id="cl-complex" className="form-select" value={loc.courtComplexCode} disabled={!complexes.length} onChange={(e) => setLevel('courtComplexCode', e.target.value)}>
              <option value="">All complexes</option>
              {complexes.map((c) => <option key={c.courtComplexCode} value={c.courtComplexCode}>{c.courtComplexName}</option>)}
            </select>
          </div>
          <div className="col-12 col-md-6 col-xl-3">
            <label htmlFor="cl-court" className="ec-label">Court</label>
            <select id="cl-court" className="form-select" value={loc.court} disabled={!courts.length} onChange={(e) => setLevel('court', e.target.value)}>
              <option value="">All courts</option>
              {courts.map((c) => <option key={c.court} value={c.court}>{`Court ${c.courtNo || c.court} · ${c.judgeName || c.courtName}`}</option>)}
            </select>
          </div>

          <div className="col-12">
            <div className="ec-label">Date</div>
            {loc.state && !dates.length ? <div className="small ec-muted">No cause lists published for this location yet.</div> : null}
            {!loc.state ? <div className="small ec-muted">Pick a state to see dates with cause lists.</div> : null}
            <div className="d-flex flex-wrap gap-2">
              {dates.map((d) => (
                <button key={d} type="button" className={`ec-pill${date === d ? ' active' : ''}`} aria-pressed={date === d} onClick={() => setDate(d)}>{fmtDate(d)}</button>
              ))}
            </div>
          </div>

          <div className="col-12 col-md-4">
            <label htmlFor="cl-q" className="ec-label">Case number or party</label>
            <input id="cl-q" className="form-control" value={filters.q} placeholder="e.g. O.S./123/2025" onChange={(e) => setFilters({ ...filters, q: e.target.value })} />
          </div>
          <div className="col-12 col-md-3">
            <label htmlFor="cl-adv" className="ec-label">Advocate</label>
            <input id="cl-adv" className="form-control" value={filters.advocate} onChange={(e) => setFilters({ ...filters, advocate: e.target.value })} />
          </div>
          <div className="col-12 col-md-3">
            <label htmlFor="cl-lit" className="ec-label">Litigant</label>
            <input id="cl-lit" className="form-control" value={filters.litigant} onChange={(e) => setFilters({ ...filters, litigant: e.target.value })} />
          </div>
          <div className="col-12 col-md-2">
            <label htmlFor="cl-type" className="ec-label">List</label>
            <select id="cl-type" className="form-select" value={filters.listType} onChange={(e) => setFilters({ ...filters, listType: e.target.value })}>
              <option value="">All</option><option value="CIVIL">Civil</option><option value="CRIMINAL">Criminal</option>
            </select>
          </div>
        </div>
        <div className="d-flex justify-content-end mt-3">
          <button type="button" className="btn btn-ec px-4" disabled={!canSearch || loading} onClick={() => search(0)}>{loading ? 'Loading…' : 'Show board'}</button>
        </div>
      </div>

      <ErrorBox error={error} />
      {loading && <Loader label="Loading the board…" />}
      {!loading && result && (rows.length === 0 ? <Empty>No listings match.</Empty> : (
        <div className="ec-card p-0">
          <div className="table-responsive">
            <table className="table ec-table mb-0">
              <thead><tr><th>Item</th><th>Case no.</th><th>Parties</th><th>Advocates</th><th>Judge</th><th>Stage</th></tr></thead>
              <tbody>
                {rows.map((b) => (
                  <tr key={b.id}>
                    <td className="fw-bold ec-accent">{b.listingNo != null ? b.listingNo : '—'}</td>
                    <td className="ec-mono small">{asList(b.caseNumber).join(', ')}</td>
                    <td className="fw-semibold">
                      {b.cnr ? <Link className="ec-link-plain" to={ecPath(`case/${b.cnr}`)}>{b.party}</Link> : b.party}
                    </td>
                    <td className="small ec-muted">{asList(b.advocates).concat(asList(b.petitionerAdvocates), asList(b.respondentAdvocates)).filter(Boolean).slice(0, 3).join(', ') || '—'}</td>
                    <td className="small ec-muted">{asList(b.judge).join(', ') || b.courtName || '—'}</td>
                    <td className="small">{b.listingFor || b.status || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="d-flex justify-content-between align-items-center p-2 small ec-muted">
            <span>{date ? fmtDate(date) : ''}</span>
            <div className="d-flex gap-2">
              <button type="button" className="btn btn-sm btn-ec-outline" disabled={offset === 0} onClick={() => search(Math.max(0, offset - PAGE))}>← Prev</button>
              <button type="button" className="btn btn-sm btn-ec-outline" disabled={rows.length < PAGE} onClick={() => search(offset + PAGE)}>Next →</button>
            </div>
          </div>
        </div>
      ))}
    </>
  );
}

function BatchView() {
  const [text, setText] = useState('');
  const [rows, setRows] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const preview = parseCnrText(text);


  const check = async () => {
    setLoading(true);
    setError(null);
    try {
      const r = await ecourtApi.cnrBatch(preview.valid);
      setRows(asList(r.results));
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="ec-card mb-3">
        <label htmlFor="cb-cnrs" className="ec-label">CNRs to check (up to 100)</label>
        <textarea id="cb-cnrs" className="form-control ec-mono" rows={5} value={text} onChange={(e) => setText(e.target.value)} placeholder={'JHBO010001232024\nDLND020047882015'} />
        <div className="d-flex flex-wrap align-items-center gap-2 mt-3">
          <span className="ec-badge ec-badge-green">{preview.valid.length} valid</span>
          {preview.invalid.length > 0 && <span className="ec-badge ec-badge-red">{preview.invalid.length} invalid</span>}
          <span className="ms-auto" />
          <button type="button" className="btn btn-ec" disabled={!preview.valid.length || preview.valid.length > 100 || loading} onClick={check}>
            {loading ? 'Checking…' : 'Check listings'}
          </button>
        </div>
      </div>
      <ErrorBox error={error} />
      {rows && rows.map((r) => {
        const n = r.nextListing;
        return (
          <div className="ec-card ec-card-tight mb-2 d-flex flex-wrap justify-content-between align-items-center gap-2" key={r.cnr}>
            <div>
              <Link to={ecPath(`case/${r.cnr}`)} className="ec-mono ec-link-plain">{r.cnr}</Link>
              <div className="small ec-muted">
                {n ? `${fmtDate(n.date)} · ${n.courtName || ''} · Court ${n.courtNo || '—'} · Item ${n.listingNo != null ? n.listingNo : '—'}${n.listingFor ? ` · ${n.listingFor}` : ''}` : 'No upcoming listing'}
              </div>
            </div>
            <span className={`ec-badge ${r.hasCauselist ? 'ec-badge-yellow' : 'ec-badge-grey'}`}>{r.hasCauselist ? 'Listed' : 'Not listed'}</span>
          </div>
        );
      })}
    </>
  );
}

export default function CauseList() {
  const [mode, setMode] = useState('board');
  return (
    <div>
      <PageHeader title="Cause List" subtitle="Daily boards for any court, or see which of your cases are listed.">
        <Segmented value={mode} onChange={setMode} label="Cause list mode"
          options={[{ value: 'board', label: 'Court board' }, { value: 'batch', label: 'My cases listed?' }]} />
      </PageHeader>
      {mode === 'board' ? <BoardView /> : <BatchView />}
    </div>
  );
}