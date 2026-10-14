import React, { useEffect, useId, useMemo, useRef, useState } from 'react';
import mermaid from 'mermaid';
import { looksRenderable } from './parseblock';
import DiagramViewer from './DiagramViewer';
import { downloadPng, downloadSvg } from './Downloaddiagram';

/* Mermaid is re-configured before every render call (cheap, synchronous) so
   that a theme change is picked up immediately. `securityLevel: 'strict'`
   makes Mermaid sanitise the SVG it returns and strip any script/handler
   content, which is why the returned markup is safe to mount below. */
const initMermaid = (dark) => {
  mermaid.initialize({
    startOnLoad: false,
    securityLevel: 'strict',
    theme: dark ? 'dark' : 'neutral',
    fontFamily: 'Figtree, sans-serif',
    flowchart: { htmlLabels: true, curve: 'basis', useMaxWidth: true },
    mindmap: { useMaxWidth: true },
  });
};

const useIsDark = () => {
  const [dark, setDark] = useState(
    () =>
      typeof document !== 'undefined' &&
      (document.documentElement.dataset.theme === 'dark' ||
        document.body.classList.contains('dark'))
  );

  useEffect(() => {
    const read = () =>
      document.documentElement.dataset.theme === 'dark' ||
      document.body.classList.contains('dark');
    const obs = new MutationObserver(() => setDark(read()));
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme', 'class'] });
    obs.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    return () => obs.disconnect();
  }, []);

  return dark;
};

const LABELS = { mermaid: 'Diagram', flowchart: 'Flowchart', mindmap: 'Mind map' };

/**
 * Renders a Mermaid graph. While a response is streaming the block arrives in
 * pieces, so rendering is debounced and skipped entirely until the source
 * parses as a complete graph — a half-written diagram never reaches Mermaid.
 */
const MermaidBlock = ({ kind = 'mermaid', title = '', code = '', streaming = false }) => {
  const reactId = useId().replace(/[:]/g, '');
  const [svg, setSvg] = useState('');
  const [error, setError] = useState('');
  const [expanded, setExpanded] = useState(false);
  const aliveRef = useRef(true);
  const canvasRef = useRef(null);
  const dark = useIsDark();

  const label = title || LABELS[kind] || 'Diagram';
  const ready = useMemo(() => !streaming && looksRenderable(code), [streaming, code]);

  useEffect(() => () => { aliveRef.current = false; }, []);

  useEffect(() => {
    if (!ready) return undefined;

    let cancelled = false;
    const timer = setTimeout(async () => {
      try {
        initMermaid(dark);
        await mermaid.parse(code);
        const { svg: out } = await mermaid.render(`mmd-${reactId}`, code);
        if (!cancelled && aliveRef.current) {
          setSvg(out);
          setError('');
        }
      } catch (err) {
        if (!cancelled && aliveRef.current) {
          setSvg('');
          setError(err?.message || 'This diagram could not be drawn.');
        }
      }
    }, 120);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [code, ready, dark, reactId]);

  return (
    <figure className="rb-card rb-diagram">
      <figcaption className="rb-card-label">
        {label}
        {svg && (
          <span className="rb-diagram-tools">
            <button type="button" onClick={() => downloadPng(canvasRef.current?.querySelector('svg'), label)}>PNG</button>
            <button type="button" onClick={() => downloadSvg(canvasRef.current?.querySelector('svg'), label)}>SVG</button>
            <button type="button" onClick={() => setExpanded(true)}>Expand</button>
          </span>
        )}
      </figcaption>

      {svg ? (
        <>
          <button
            type="button"
            className="rb-diagram-canvas"
            ref={canvasRef}
            aria-label={`${label} — open larger view`}
            onClick={() => setExpanded(true)}
            /* Mermaid output, sanitised by securityLevel: 'strict' */
            dangerouslySetInnerHTML={{ __html: svg }}
          />
          {expanded && (
            <DiagramViewer svg={svg} label={label} onClose={() => setExpanded(false)} />
          )}
        </>
      ) : error ? (
        <div className="rb-diagram-fallback">
          <p className="rb-error">{error}</p>
          <pre className="rb-code">{code}</pre>
        </div>
      ) : (
        <div className="rb-skeleton" aria-live="polite">
          {streaming ? 'Drawing the diagram…' : 'Preparing the diagram…'}
        </div>
      )}
    </figure>
  );
};

export default React.memo(MermaidBlock);