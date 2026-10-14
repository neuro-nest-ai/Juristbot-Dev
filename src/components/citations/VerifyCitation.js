import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleCheck, faTriangleExclamation } from '@fortawesome/free-solid-svg-icons';
import { citationsApi } from './Citationsapi';
import { Loader, ErrorBox } from '../ecourt/EcourtUi';
import { JudgmentRow } from './Citationui';


export default function VerifyCitation({ initialText = '', onUsage }) {
  const [text, setText] = useState(initialText);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const verify = async (e) => {
    if (e) e.preventDefault();
    const t = text.trim();
    if (t.length < 3) { setError({ code: 'INVALID_INPUT', message: 'Type a citation or case name (at least 3 characters).' }); return; }
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const r = await citationsApi.verify(t);
      setResult(r);
      if (onUsage && r.usage) onUsage(r.usage);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <form className="ec-card mb-3" onSubmit={verify} noValidate>
        <label htmlFor="cite-verify" className="ec-label">Citation or case name</label>
        <div className="d-flex flex-wrap gap-2">
          <input id="cite-verify" className="form-control flex-grow-1 cite-q" value={text} maxLength={300}
            placeholder="e.g. (2017) 10 SCC 1  or  Puttaswamy v Union of India"
            onChange={(e) => setText(e.target.value)} />
          <button type="submit" className="btn btn-ec px-4" disabled={loading}>{loading ? 'Checking…' : 'Verify'}</button>
        </div>
        <div className="small ec-muted mt-2">Use this before relying on a citation from an AI answer.</div>
      </form>

      <ErrorBox error={error} />
      {loading && <Loader label="Checking Indian Kanoon…" />}

      {result && (
        <div className={`ec-card mb-3 ${result.found ? 'ec-card-success' : 'ec-card-warn'}`}>
          <div className="d-flex align-items-center gap-2 mb-2">
            <FontAwesomeIcon icon={result.found ? faCircleCheck : faTriangleExclamation}
              className={result.found ? 'cite-ok' : 'ec-warn'} />
            <strong>{result.found ? 'Found in Indian Kanoon' : 'Could not verify this citation'}</strong>
          </div>
          <p className="small ec-muted mb-2">
            {result.found
              ? 'These judgments contain this text. Open one to confirm it is the case being cited.'
              : 'No judgment contains this text. Check the spelling or citation format — it may not exist.'}
          </p>
          {result.matches.map((m) => (
            <JudgmentRow key={m.tid} LinkComponent={Link} to={`/citations/doc/${m.tid}`}
              title={m.title} court={m.court} date={m.date} snippet={m.snippet} />
          ))}
        </div>
      )}
    </div>
  );
}