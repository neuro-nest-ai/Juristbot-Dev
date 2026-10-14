import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ecourtApi } from './ecourtApi';
import { ecPath, fmtDate, caseTitle, statusBadge, sleep, CNR_RE } from './ecourtUtils';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowsRotate } from '@fortawesome/free-solid-svg-icons';
import { Loader, ErrorBox, Empty, BackLink } from './EcourtUi';

const LINKED_SECTIONS = [
  ['taggedMatters', 'Tagged matters'], ['linkCases', 'Linked cases'], ['interlocutoryApplications', 'Interlocutory applications'],
  ['earlierCourtDetails', 'Earlier court'], ['notices', 'Notices'], ['caveatDetails', 'Caveats'],
  ['processes', 'Processes'], ['filedDocuments', 'Filed documents'], ['listingDates', 'Listing dates'],
];

function describe(item) {
  if (item == null) return '';
  if (typeof item !== 'object') return String(item);
  return Object.entries(item).filter(([, v]) => v !== '' && v != null && typeof v !== 'object').map(([k, v]) => `${k}: ${v}`).join(' · ');
}

export default function CaseDetail() {
  const { cnr: rawCnr } = useParams();
  const cnr = String(rawCnr || '').toUpperCase();
  const [resp, setResp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tab, setTab] = useState('hearings');
  const [showAllHearings, setShowAllHearings] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const alive = useRef(true);

  useEffect(() => () => { alive.current = false; }, []);

  const load = useCallback(async (fresh) => {
    setError(null);
    try {
      const r = await ecourtApi.caseDetail(cnr, fresh);
      if (alive.current) setResp(r);
    } catch (e) {
      if (alive.current) setError(e);
    } finally {
      if (alive.current) setLoading(false);
    }
  }, [cnr]);

  useEffect(() => {
    if (!CNR_RE.test(cnr)) { setLoading(false); setError({ message: 'This is not a valid CNR.' }); return; }
    setLoading(true);
    setResp(null);
    load(false);
  }, [cnr, load]);

  const refresh = async () => {
    setRefreshing(true);
    setError(null);
    try {
      await ecourtApi.refresh(cnr);
      await sleep(8000); // upstream needs 5–10 s
      await load(true);
    } catch (e) {
      if (alive.current) setError(e);
    } finally {
      if (alive.current) setRefreshing(false);
    }
  };

  if (loading) return <Loader label="Fetching case from eCourts…" />;
  if (!resp) return <ErrorBox error={error || { message: 'Case not found' }} onRetry={() => { setLoading(true); load(false); }} />;

  const data = resp.data || {};
  const cd = data.courtCaseData || {};
  const lookup = (data.descriptions && data.descriptions.enumLookup) || {};
  const typeLabel = (lookup.caseType && lookup.caseType[cd.caseType]) || cd.caseTypeRaw || cd.caseType;
  const pending = cd.caseStatus !== 'DISPOSED';
  const hearings = [...(cd.historyOfCaseHearings || [])].sort((a, b) => String(b.businessOnDate).localeCompare(String(a.businessOnDate)));
  const business = [...(cd.businessOnDateEntries || [])].sort((a, b) => String(b.date).localeCompare(String(a.date)));
  const orders = [
    ...(cd.judgmentOrders || []).map((o) => ({ ...o, kind: 'Judgment' })),
    ...[...(cd.interimOrders || [])].reverse().map((o) => ({ ...o, kind: 'Interim' })),
  ];
  const fir = cd.firDetails || {};
  const facts = [
    ['Filing no.', cd.filingNumber], ['Filed', fmtDate(cd.filingDate)],
    ['Registration no.', cd.registrationNumber], ['Registered', fmtDate(cd.registrationDate)],
    ['First hearing', fmtDate(cd.firstHearingDate)], ['Last hearing', fmtDate(cd.lastHearingDate)],
    [pending ? 'Next hearing' : 'Decided', fmtDate(pending ? cd.nextHearingDate : cd.decisionDate)],
    ['Duration', cd.caseDurationDays != null ? `${cd.caseDurationDays} days` : '—'],
    ['Hearings', cd.hearingCount], ['Orders', `${cd.orderCount || 0} (${cd.judgmentCount || 0} judgment)`],
    ['IAs', cd.iaCount], ['Stage', cd.purpose],
  ];
  const tabs = [
    ['hearings', `Hearings (${hearings.length})`], ['business', 'Daily business'],
    ['orders', `Orders (${orders.length})`], ['linked', 'Linked & other'],
  ];

  return (
    <div>
      <BackLink to={ecPath('search')}>Back to search</BackLink>

      <section className="ec-card mb-3">
        <div className="d-flex flex-wrap justify-content-between gap-3">
          <div className="ec-minw0">
            <div className="ec-mono small ec-muted">{cd.cnr}{cd.filingNumber ? ` · ${cd.filingNumber}` : ''}</div>
            <h1 className="ec-h1 my-1">{caseTitle(cd)}</h1>
            <div className="ec-muted">{cd.courtName}{cd.courtNo ? ` · Court No. ${cd.courtNo}` : ''}{cd.district ? ` · ${cd.district}` : ''}</div>
            <div className="small ec-muted">{[typeLabel, cd.caseCategoryFacetPath, cd.caseTypeSub].filter(Boolean).join(' · ')}</div>
            <div className="d-flex flex-wrap gap-2 mt-2">
              <span className={statusBadge(cd.caseStatus)}>{cd.caseStatus || 'UNKNOWN'}</span>
              {cd.disposalTypeRaw && <span className="ec-badge ec-badge-orange">{cd.disposalTypeRaw}</span>}
              {cd.contestedStatus && <span className="ec-badge ec-badge-grey">{cd.contestedStatus}</span>}
              {pending && cd.nextHearingDate && <span className="ec-badge ec-badge-yellow">Next: {fmtDate(cd.nextHearingDate)}</span>}
              <span className="ec-badge ec-badge-grey">{resp.cached ? `Saved ${resp.fetchedAt || ''}` : 'Live just now'}</span>
            </div>
          </div>
          <div className="d-flex flex-wrap gap-2 align-items-start">
            <button type="button" className="btn btn-ec-outline" onClick={refresh} disabled={refreshing}>
              <FontAwesomeIcon icon={faArrowsRotate} spin={refreshing} /> {refreshing ? 'Refreshing from eCourts…' : 'Refresh live'}
            </button>
          </div>
        </div>
        <ErrorBox error={error} />
      </section>

      <div className="row g-2 mb-3">
        {facts.map(([k, v]) => (
          <div className="col-6 col-md-4 col-xl-2" key={k}>
            <div className="ec-fact"><div className="ec-overline">{k}</div><div className="fw-semibold">{v == null || v === '' ? '—' : v}</div></div>
          </div>
        ))}
      </div>

      <div className="row g-2 mb-3">
        <div className="col-12 col-md-6 col-xl-3">
          <div className="ec-fact h-100">
            <div className="ec-overline">Petitioner</div>
            <div className="fw-semibold">{(cd.petitioners || []).join(', ') || '—'}</div>
            <div className="small ec-muted">Adv. {(cd.petitionerAdvocates || []).join(', ') || 'not listed'}</div>
          </div>
        </div>
        <div className="col-12 col-md-6 col-xl-3">
          <div className="ec-fact h-100">
            <div className="ec-overline">Respondent</div>
            <div className="fw-semibold">{(cd.respondents || []).join(', ') || '—'}</div>
            <div className="small ec-muted">Adv. {(cd.respondentAdvocates || []).join(', ') || 'not listed'}</div>
          </div>
        </div>
        <div className="col-12 col-md-6 col-xl-3">
          <div className="ec-fact h-100">
            <div className="ec-overline">Judge</div>
            <div className="fw-semibold">{(cd.judges || []).join(', ') || (hearings[0] && hearings[0].judge) || '—'}</div>
          </div>
        </div>
        <div className="col-12 col-md-6 col-xl-3">
          <div className="ec-fact h-100">
            <div className="ec-overline">FIR</div>
            <div className="fw-semibold">{fir.caseNumber ? `FIR ${fir.caseNumber}${fir.year ? ` / ${fir.year}` : ''}` : '—'}</div>
            {fir.policeStation && <div className="small ec-muted">{fir.policeStation}</div>}
          </div>
        </div>
      </div>

      <ul className="nav ec-tabs mb-3" role="tablist">
        {tabs.map(([id, labelText]) => (
          <li className="nav-item" key={id} role="presentation">
            <button type="button" role="tab" aria-selected={tab === id} className={`nav-link${tab === id ? ' active' : ''}`} onClick={() => setTab(id)}>{labelText}</button>
          </li>
        ))}
      </ul>

      {tab === 'hearings' && (
        hearings.length ? (
          <div className="ec-card p-0">
            <div className="table-responsive">
              <table className="table ec-table mb-0">
                <thead><tr><th>Business on</th><th>Next hearing</th><th>Purpose</th><th>Judge</th></tr></thead>
                <tbody>
                  {(showAllHearings ? hearings : hearings.slice(0, 10)).map((h, i) => (
                    <tr key={`${h.businessOnDate}-${i}`}>
                      <td className="fw-semibold text-nowrap">{fmtDate(h.businessOnDate)}</td>
                      <td className="text-nowrap">{fmtDate(h.hearingDate)}</td>
                      <td>{h.purposeOfListing || '—'}</td>
                      <td className="ec-muted">{h.judge || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {hearings.length > 10 && (
              <button type="button" className="btn btn-link ec-link w-100" onClick={() => setShowAllHearings((v) => !v)}>
                {showAllHearings ? 'Show fewer' : `Show all ${hearings.length} hearings`}
              </button>
            )}
          </div>
        ) : <Empty>No hearings recorded yet.</Empty>
      )}

      {tab === 'business' && (
        business.length ? business.map((b, i) => (
          <div className="ec-card ec-card-tight mb-2 d-flex flex-wrap gap-3" key={`${b.date}-${i}`}>
            <div className="ec-date-col">
              <div className="fw-semibold">{fmtDate(b.date)}</div>
              <div className="small ec-muted">{b.courtOf}</div>
            </div>
            <div className="flex-grow-1 ec-prewrap">{b.business || '—'}</div>
            <div className="small ec-muted ec-next-col">
              Next: <strong className="ec-strong">{fmtDate(b.nextHearingDate)}</strong>
              <div>{b.nextPurpose}</div>
            </div>
          </div>
        )) : <Empty>No daily business entries.</Empty>
      )}

      {tab === 'orders' && (
        orders.length ? (
          <div className="ec-card p-0">
            {orders.map((o) => (
              <div className="ec-row" key={o.orderUrl}>
                <span className="fw-semibold ec-date-col">{fmtDate(o.orderDate)}</span>
                <span className={`ec-badge ${o.kind === 'Judgment' ? 'ec-badge-yellow' : 'ec-badge-grey'}`}>{o.kind}</span>
                <span className="flex-grow-1 ec-muted small">{o.description || o.orderType}</span>
                <span className="ec-mono small ec-muted">{o.orderUrl}</span>
                <Link className="btn btn-sm btn-ec-outline" to={ecPath(`case/${cd.cnr}/order/${encodeURIComponent(o.orderUrl)}`)}>Open</Link>
              </div>
            ))}
          </div>
        ) : <Empty>No orders uploaded yet.</Empty>
      )}

      {tab === 'linked' && (
        <div className="row g-2">
          {LINKED_SECTIONS.map(([key, title]) => {
            const list = Array.isArray(cd[key]) ? cd[key] : [];
            return (
              <div className="col-12 col-md-6 col-xl-4" key={key}>
                <div className={`ec-fact h-100${list.length ? '' : ' ec-fact-empty'}`}>
                  <div className="ec-overline">{title}</div>
                  {list.length ? list.map((it, i) => <div className="small mt-1" key={i}>{describe(it)}</div>) : <div className="small ec-muted">None on record</div>}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <p className="small ec-muted mt-4 mb-0">Source: eCourts via eCourtsIndia. Always verify against the certified order copy.</p>
    </div>
  );
}