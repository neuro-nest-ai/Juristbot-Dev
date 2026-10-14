import React, { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faArrowUpRightFromSquare, faWandMagicSparkles } from '@fortawesome/free-solid-svg-icons';
import { citationsApi } from './Citationsapi';
import { Loader, ErrorBox, Empty } from '../ecourt/EcourtUi';
import { UsageBadge, PoweredBy, JudgmentRow, fmtDate } from './Citationui';

export default function CitationDoc() {
  const { tid } = useParams();
  const navigate = useNavigate();
  const [doc, setDoc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tab, setTab] = useState('text');

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setDoc(await citationsApi.doc(tid));
    } catch (e) {
      setError(e);
      setDoc(null);
    } finally {
      setLoading(false);
    }
  }, [tid]);

  useEffect(() => { setTab('text'); load(); }, [load]);

  const goBack = () => {
    if (window.history.state && window.history.state.idx > 0) navigate(-1);
    else navigate('/citations');
  };

  // Uses the same hand-off the sidebar's DPDP links use to start a chat with a prompt.
  const askAi = () => {
    const prompt = `Summarise the judgment "${doc.title}"${doc.court ? ` (${doc.court}` : ''}${doc.date ? `, ${fmtDate(doc.date)}` : ''}${doc.court ? ')' : ''}. `
      + 'Give the facts, issues, decision and ratio decidendi, and list the key precedents it relies on.';
    localStorage.setItem('session_id', crypto.randomUUID ? crypto.randomUUID() : String(Date.now()));
    navigate('/chat', { state: { dpdpPrompt: prompt, ts: Date.now() } });
  };

  const back = (
    <button type="button" className="ec-back btn btn-link p-0" onClick={goBack}>
      <FontAwesomeIcon icon={faChevronLeft} /> Back
    </button>
  );

  if (loading) return <div className="cite-page">{back}<Loader label="Opening judgment…" /></div>;
  if (error) {
    return (
      <div className="cite-page">
        {back}
        <ErrorBox error={error} onRetry={error.code !== 'DAILY_LIMIT' && error.code !== 'NOT_FOUND' ? load : undefined} />
        {error.code === 'DAILY_LIMIT' && <p className="ec-muted">Judgments you have opened before still open for free.</p>}
      </div>
    );
  }
  if (!doc) return null;

  const tabs = [
    { id: 'text', label: 'Judgment' },
    { id: 'cites', label: `Cites (${doc.cites.length})` },
    { id: 'citedby', label: `Cited by (${doc.numCitedBy != null ? Number(doc.numCitedBy).toLocaleString('en-IN') : doc.citedBy.length})` },
  ];
  const list = tab === 'cites' ? doc.cites : doc.citedBy;

  return (
    <div className="cite-page">
      {back}

      <section className="ec-card mb-3">
        <div className="d-flex flex-wrap justify-content-between gap-3">
          <div className="ec-minw0">
            <h1 className="ec-h1 my-1">{doc.title}</h1>
            <div className="ec-muted">{[doc.court, fmtDate(doc.date)].filter(Boolean).join(' · ')}</div>
            <div className="d-flex flex-wrap gap-2 mt-2">
              <span className="ec-badge ec-badge-blue">Cites {doc.cites.length}</span>
              <span className="ec-badge ec-badge-green">Cited by {doc.numCitedBy != null ? Number(doc.numCitedBy).toLocaleString('en-IN') : doc.citedBy.length}</span>
              {doc.cached && <span className="ec-badge ec-badge-grey">Saved {doc.savedAt || ''} · free</span>}
              <UsageBadge usage={doc.usage} />
            </div>
          </div>
          <div className="d-flex flex-wrap gap-2 align-items-start">
            <button type="button" className="btn btn-ec" onClick={askAi}>
              <FontAwesomeIcon icon={faWandMagicSparkles} /> Ask AI about this
            </button>
            <a className="btn btn-ec-outline" href={`https://indiankanoon.org/doc/${doc.tid}/`} target="_blank" rel="noopener noreferrer">
              <FontAwesomeIcon icon={faArrowUpRightFromSquare} /> Indian Kanoon
            </a>
          </div>
        </div>
      </section>

      <ul className="nav ec-tabs mb-3" role="tablist">
        {tabs.map((t) => (
          <li className="nav-item" key={t.id} role="presentation">
            <button type="button" role="tab" aria-selected={tab === t.id} className={`nav-link ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)}>
              {t.label}
            </button>
          </li>
        ))}
      </ul>

      {tab === 'text' ? (
        doc.text ? <div className="ec-order-text cite-text">{doc.text}</div> : <Empty>No text available for this judgment.</Empty>
      ) : (
        list.length === 0 ? (
          <Empty>{tab === 'cites' ? 'This judgment does not cite other cases on Indian Kanoon.' : 'No later cases cite this judgment yet.'}</Empty>
        ) : (
          <>
            {tab === 'citedby' && doc.numCitedBy > list.length && (
              <p className="small ec-muted">Showing the top {list.length} of {Number(doc.numCitedBy).toLocaleString('en-IN')} cases that cite this judgment.</p>
            )}
            {list.map((c) => (
              <JudgmentRow key={c.tid} LinkComponent={Link} to={`/citations/doc/${c.tid}`} title={c.title} />
            ))}
          </>
        )
      )}

      <PoweredBy />
    </div>
  );
}