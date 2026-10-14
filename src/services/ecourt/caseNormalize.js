/**
 * Pure helpers: Case Detail response (GET /api/partner/case/{cnr}) → flat rows,
 * snapshot for the nightly diff, and the diff itself. No DB here (unit-testable).
 */

const d = (v) => (v && /^\d{4}-\d{2}-\d{2}/.test(v) ? String(v).slice(0, 10) : null);

function caseTitle(cd) {
  const p = (cd.petitioners || []).join(', ') || 'Unknown';
  const r = (cd.respondents || []).join(', ') || 'Unknown';
  return `${p} vs ${r}`.slice(0, 500);
}

function normalizeCaseDetail(data) {
  const cd = data && data.courtCaseData;
  if (!cd || !cd.cnr) throw new Error('Case Detail response has no courtCaseData.cnr');
  const lookup = (data.descriptions && data.descriptions.enumLookup) || {};
  const fir = cd.firDetails || {};
  const modified = data.entityInfo && data.entityInfo.dateModified;

  const row = {
    cnr: cd.cnr,
    title: caseTitle(cd),
    court_name: cd.courtName || null,
    court_code: cd.courtComplexCode || cd.cnrCourtCode || null,
    court_no: cd.courtNo != null ? String(cd.courtNo) : null,
    state: cd.state || null,
    district: cd.district || null,
    case_type: cd.caseType || null,
    case_type_label: (lookup.caseType && lookup.caseType[cd.caseType]) || cd.caseTypeRaw || null,
    case_status: cd.caseStatus || null,
    disposal_type: cd.disposalTypeRaw || cd.disposalType || null,
    contested_status: cd.contestedStatus || null,
    category_path: Array.isArray(cd.caseCategoryFacetPath) ? cd.caseCategoryFacetPath.join(' / ') : (cd.caseCategoryFacetPath || null),
    filing_number: cd.filingNumber || null,
    filing_date: d(cd.filingDate),
    registration_number: cd.registrationNumber || null,
    registration_date: d(cd.registrationDate),
    first_hearing_date: d(cd.firstHearingDate),
    last_hearing_date: d(cd.lastHearingDate),
    next_hearing_date: cd.caseStatus === 'DISPOSED' ? null : d(cd.nextHearingDate),
    decision_date: d(cd.decisionDate),
    case_duration_days: cd.caseDurationDays != null ? cd.caseDurationDays : null,
    order_count: cd.orderCount || 0,
    interim_order_count: cd.interimOrderCount || 0,
    judgment_count: cd.judgmentCount || 0,
    hearing_count: cd.hearingCount || 0,
    ia_count: cd.iaCount != null ? cd.iaCount : (cd.interlocutoryApplications || []).length,
    fir_number: fir.caseNumber || null,
    fir_police_station: fir.policeStation || null,
    fir_year: fir.year || null,
    upstream_modified_at: modified ? String(modified).replace('T', ' ').slice(0, 19) : null,
  };

  const parties = [];
  const push = (side, list) => (list || []).forEach((name) => name && parties.push({ side, name: String(name).slice(0, 255) }));
  push('petitioner', cd.petitioners);
  push('respondent', cd.respondents);
  push('petitioner_advocate', cd.petitionerAdvocates);
  push('respondent_advocate', cd.respondentAdvocates);
  push('judge', cd.judges);

  const hearings = (cd.historyOfCaseHearings || []).map((h) => ({
    business_on: d(h.businessOnDate),
    hearing_date: d(h.hearingDate),
    purpose: h.purposeOfListing || null,
    judge: h.judge || null,
  }));

  const business = (cd.businessOnDateEntries || []).map((b) => ({
    entry_date: d(b.date),
    court_of: b.courtOf || null,
    business: b.business || null,
    next_purpose: b.nextPurpose || null,
    next_hearing_date: d(b.nextHearingDate),
  }));

  const orders = [
    ...(cd.judgmentOrders || []).map((o) => ({ filename: o.orderUrl, kind: 'judgment', order_date: d(o.orderDate), description: o.orderType || o.description || null })),
    ...(cd.interimOrders || []).map((o) => ({ filename: o.orderUrl, kind: 'interim', order_date: d(o.orderDate), description: o.description || o.orderType || null })),
  ].filter((o) => o.filename);

  return { row, parties, hearings, business, orders };
}

/** The fields the nightly diff watches. */
function snapshotOf(norm) {
  const latest = [...norm.orders].sort((a, b) => String(b.order_date).localeCompare(String(a.order_date)))[0];
  return {
    cnr: norm.row.cnr,
    next_hearing_date: norm.row.next_hearing_date,
    order_count: norm.row.order_count,
    ia_count: norm.row.ia_count,
    case_status: norm.row.case_status,
    court_code: norm.row.court_code,
    last_order_file: latest ? latest.filename : null,
    last_order_date: latest ? latest.order_date : null,
  };
}

/** prev = last saved snapshot (null on first sight → no alerts). */
function diffSnapshots(prev, next) {
  if (!prev) return [];
  const events = [];
  if (next.order_count > prev.order_count) {
    events.push({ type: 'new_order', orderFile: next.last_order_file, orderDate: next.last_order_date, count: next.order_count - prev.order_count });
  }
  if (next.ia_count > prev.ia_count) events.push({ type: 'ia_filed', count: next.ia_count - prev.ia_count });
  if (prev.court_code && next.court_code && prev.court_code !== next.court_code) {
    events.push({ type: 'transferred', from: prev.court_code, to: next.court_code });
  }
  const disposedNow = next.case_status === 'DISPOSED' && prev.case_status !== 'DISPOSED';
  if (disposedNow) events.push({ type: 'disposed' });
  if (!disposedNow && next.next_hearing_date && next.next_hearing_date !== prev.next_hearing_date) {
    events.push({ type: 'date_changed', from: prev.next_hearing_date, to: next.next_hearing_date });
  }
  return events;
}

module.exports = { caseTitle, normalizeCaseDetail, snapshotOf, diffSnapshots };
