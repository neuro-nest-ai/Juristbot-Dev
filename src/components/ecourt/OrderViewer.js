import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ecourtApi } from './ecourtApi';
import { ecPath, fmtDate, sleep } from './ecourtUtils';
import { Loader, ErrorBox, Empty, BackLink, Segmented } from './EcourtUi';

const MODES = [
  { value: 'ai', label: 'AI analysis' },
  { value: 'text', label: 'Full text' },
  { value: 'pdf', label: 'PDF' },
];

function List({ title, items, render }) {
  if (!items || !items.length) return null;
  return (
    <div className="ec-card ec-card-tight h-100">
      <div className="ec-overline mb-2">{title}</div>
      {items.map((it, i) => <div className="mb-1" key={i}>{render ? render(it) : <>→ {String(it)}</>}</div>)}
    </div>
  );
}

function AiView({ ai }) {
  const fm = ai.foundational_metadata || {};
  const ids = fm.core_case_identifiers || {};
  const proc = fm.procedural_details_from_order || {};
  const deep = ai.deep_legal_substance_context || {};
  const core = deep.core_legal_content_analysis || {};
  const args = deep.arguments_and_reasoning_analysis || {};
  const ins = (ai.intelligent_insights_analytics && ai.intelligent_insights_analytics.order_significance_and_impact_assessment) || {};
  const qa = ai.quality_review_metadata || {};
  const ratio = args.ratio_decidendi_extracted || {};

  return (
    <div className="d-flex flex-column gap-3">
      <div className="ec-card">
        <div className="d-flex flex-wrap gap-2 mb-2">
          {proc.disposition_outcome_if_disposed && <span className="ec-badge ec-badge-green">{proc.disposition_outcome_if_disposed}</span>}
          {proc.order_nature && <span className="ec-badge ec-badge-grey">{proc.order_nature}</span>}
          {proc.disposition_status_indicated && <span className="ec-badge ec-badge-grey">{proc.disposition_status_indicated}</span>}
          {ids.bench_composition && <span className="ec-badge ec-badge-grey">{ids.bench_composition}</span>}
          {qa.overall_extraction_confidence && <span className="small ec-muted align-self-center">Extraction confidence: {qa.overall_extraction_confidence}</span>}
        </div>
        {ids.case_number_primary && <div className="small ec-muted mb-2">{ids.case_number_primary} · {ids.court_name} · {(ids.judge_names || []).join(', ')} · {fmtDate(ids.order_date)}</div>}
        {ins.ai_generated_executive_summary && <p className="mb-2"><strong>Summary.</strong> {ins.ai_generated_executive_summary}</p>}
        {ins.plain_language_summary_for_litigants_outcome_focused && <p className="mb-0 ec-muted"><strong className="ec-strong">In plain words.</strong> {ins.plain_language_summary_for_litigants_outcome_focused}</p>}
      </div>
      <div className="row g-3">
        <div className="col-12 col-lg-6"><List title="Issues" items={core.primary_legal_issues_identified} /></div>
        <div className="col-12 col-lg-6">
          <List title="Statutes applied" items={core.statutes_cited_and_applied}
            render={(s) => <><strong>{s.act_name}{s.section_article_rule ? `, ${s.section_article_rule}` : ''}</strong>{s.interpretation_focus_or_application ? ` · ${s.interpretation_focus_or_application}` : ''}</>} />
        </div>
        {ratio.statement && (
          <div className="col-12 col-lg-6">
            <div className="ec-card ec-card-tight h-100">
              <div className="ec-overline mb-2">Ratio decidendi{ratio.confidence_score != null ? ` · confidence ${ratio.confidence_score}/10` : ''}</div>
              <div>{ratio.statement}</div>
            </div>
          </div>
        )}
        <div className="col-12 col-lg-6"><List title="Directions" items={proc.specific_directions_given_by_court} /></div>
        <div className="col-12 col-lg-6"><List title="What it means for similar cases" items={ins.implications_for_litigants_in_similar_situations} /></div>
        <div className="col-12 col-lg-6"><List title="Compliance & risks" items={ins.compliance_directives_or_risks_for_parties} /></div>
      </div>
      {args.court_reasoning_for_decision && (
        <div className="ec-card ec-card-tight">
          <div className="ec-overline mb-2">Court's reasoning</div>
          <div>{args.court_reasoning_for_decision}</div>
        </div>
      )}
    </div>
  );
}

export default function OrderViewer() {
  const { cnr: rawCnr, file: rawFile } = useParams();
  const cnr = String(rawCnr || '').toUpperCase();
  const file = decodeURIComponent(rawFile || '');
  const [mode, setMode] = useState('ai');
  const [ai, setAi] = useState({ state: 'idle' });
  const [text, setText] = useState({ state: 'idle' });
  const [signed, setSigned] = useState(true);
  const [pdf, setPdf] = useState({ state: 'idle' });
  const alive = useRef(true);
  useEffect(() => () => { alive.current = false; }, []);

  // Order + AI: first request may take 10–60 s; 202 means "still generating" → retry up to 3 times
  const generate = async () => {
    for (let attempt = 1; attempt <= 4; attempt++) {
      if (!alive.current) return;
      setAi({ state: 'busy', attempt });
      try {
        const r = await ecourtApi.orderAi(cnr, file);
        if (r.status === 200 && r.data.status === 'ready') { if (alive.current) setAi({ state: 'ready', data: r.data }); return; }
        await sleep(((r.data && r.data.retryAfterSeconds) || 20) * 1000);
      } catch (e) {
        if (alive.current) setAi({ state: 'error', error: e });
        return;
      }
    }
    if (alive.current) setAi({ state: 'error', error: { message: 'The analysis is still being prepared. Please try again in a minute.' } });
  };

  useEffect(() => {
    if (mode !== 'text' || text.state !== 'idle') return;
    setText({ state: 'loading' });
    ecourtApi.orderMarkdown(cnr, file)
      .then((r) => alive.current && setText({ state: 'ready', markdown: r.markdown }))
      .catch((e) => alive.current && setText({ state: 'error', error: e }));
  }, [mode, text.state, cnr, file]);

  useEffect(() => {
    if (mode !== 'pdf') return undefined;
    let url = null;
    let cancelled = false;
    setPdf({ state: 'loading' });
    ecourtApi.orderPdf(cnr, file, signed)
      .then(({ blob, name }) => {
        if (cancelled) return;
        url = URL.createObjectURL(blob);
        setPdf({ state: 'ready', url, name });
      })
      .catch((e) => { if (!cancelled) setPdf({ state: 'error', error: e }); });
    return () => { cancelled = true; if (url) URL.revokeObjectURL(url); };
  }, [mode, signed, cnr, file]);

  return (
    <div>
      <BackLink to={ecPath(`case/${cnr}`)}>Back to case</BackLink>
      <div className="d-flex flex-wrap justify-content-between align-items-end gap-3 mb-3">
        <div>
          <div className="ec-mono small ec-muted">{cnr} · {file}</div>
          <h1 className="ec-h1 mb-0">Court order</h1>
        </div>
        <Segmented value={mode} options={MODES} onChange={setMode} label="Order view" />
      </div>

      {mode === 'ai' && (
        <>
          {ai.state === 'idle' && (
            <div className="ec-card d-flex flex-wrap justify-content-between align-items-center gap-3">
              <div>
                <div className="fw-semibold">Summarise this order with AI</div>
                <div className="small ec-muted">Issues, statutes, directions and a plain-language summary. The first time can take up to a minute.</div>
              </div>
              <button type="button" className="btn btn-ec" onClick={generate}>Generate analysis</button>
            </div>
          )}
          {ai.state === 'busy' && <Loader label={`Reading the order… (attempt ${ai.attempt} of 4)`} />}
          {ai.state === 'error' && <ErrorBox error={ai.error} onRetry={generate} />}
          {ai.state === 'ready' && (ai.data.aiAnalysis ? <AiView ai={ai.data.aiAnalysis} /> : <Empty>No analysis available for this order.</Empty>)}
        </>
      )}

      {mode === 'text' && (
        <>
          {text.state === 'loading' && <Loader label="Converting the order to text (can take a few minutes)…" />}
          {text.state === 'error' && <ErrorBox error={text.error} onRetry={() => setText({ state: 'idle' })} />}
          {text.state === 'ready' && (text.markdown ? <pre className="ec-order-text">{text.markdown}</pre> : <Empty>Text could not be extracted from this order.</Empty>)}
        </>
      )}

      {mode === 'pdf' && (
        <div className="row g-3">
          <div className="col-12 col-lg-9">
            {pdf.state === 'loading' && <Loader label="Preparing the PDF…" />}
            {pdf.state === 'error' && <ErrorBox error={pdf.error} />}
            {pdf.state === 'ready' && <iframe title="Order PDF" src={pdf.url} className="ec-pdf" />}
          </div>
          <div className="col-12 col-lg-3">
            <div className="ec-card ec-card-tight d-flex flex-column gap-3">
              <div className="form-check form-switch">
                <input className="form-check-input" type="checkbox" role="switch" id="ov-signed" checked={signed} onChange={(e) => setSigned(e.target.checked)} />
                <label className="form-check-label" htmlFor="ov-signed">
                  <span className="d-block fw-semibold">Signed true copy</span>
                  <span className="d-block small ec-muted">Watermarked and digitally signed. Off = raw court PDF.</span>
                </label>
              </div>
              {pdf.state === 'ready' && <a className="btn btn-ec" href={pdf.url} download={pdf.name}>Download PDF</a>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}