import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Transformer } from 'markmap-lib';
import { Markmap } from 'markmap-view';
import { downloadPng, downloadSvg } from './Downloaddiagram';

const transformer = new Transformer();

/* The block body is an indented list, optionally preceded by a bare `mindmap`
   line left over from Mermaid syntax. markmap reads markdown, so the list goes
   through as-is — the bullets are what define the tree.

   The title is deliberately NOT added as an `# H1`: it already shows in the
   card header, and wrapping the list in a heading adds a level that pushes the
   real branches one step deeper (and one step closer to being collapsed). */
const toMarkdown = (raw = '') => {
  const lines = raw.split(/\r?\n/).filter((l) => l.trim());
  if (lines[0] && /^\s*mindmap\s*$/i.test(lines[0])) lines.shift();
  return lines.join('\n');
};

/**
 * Renders a mindmap with markmap: every branch is clickable to collapse or
 * expand its children, plus scroll-zoom and drag-pan. Mermaid still handles
 * flowcharts and the other diagram types.
 */
const MindmapBlock = ({ title = '', raw = '', streaming = false }) => {
  const svgRef = useRef(null);
  const stageRef = useRef(null);
  const mmRef = useRef(null);
  const [expanded, setExpanded] = useState(false);
  const [error, setError] = useState('');

  const markdown = toMarkdown(raw);

  /* markmap's zoom gesture reads svg.width.baseVal.value, which throws
     "Could not resolve relative length" when the SVG is sized only in CSS
     percentages — so concrete pixel attributes are set from the container.

     The SVG is collapsed to 0 before measuring: it is a block-level child of
     the card, so leaving it at its previous (possibly fullscreen) size keeps
     the container stretched and the measurement never shrinks back. */
  const sizeSvg = useCallback(() => {
    const stage = stageRef.current;
    const svg = svgRef.current;
    if (!stage || !svg) return 0;

    svg.setAttribute('width', '0');
    svg.setAttribute('height', '0');

    const { width, height } = stage.getBoundingClientRect();
    if (width > 0 && height > 0) {
      svg.setAttribute('width', String(Math.round(width)));
      svg.setAttribute('height', String(Math.round(height)));
    }
    return width;
  }, []);

  useEffect(() => {
    if (streaming || !markdown) return undefined;

    let frame = 0;
    let cancelled = false;

    const build = () => {
      if (cancelled || !svgRef.current) return;

      // Container may still be laying out on first paint — wait for real size
      if (sizeSvg() <= 0) {
        frame = requestAnimationFrame(build);
        return;
      }

      try {
        const { root } = transformer.transform(markdown);

        if (mmRef.current) {
          mmRef.current.setData(root);
        } else {
          mmRef.current = Markmap.create(
            svgRef.current,
            {
              autoFit: true,
              duration: 250,
              initialExpandLevel: -1, // -1 = every branch open on first render
              spacingVertical: 10,
              spacingHorizontal: 90,
              paddingX: 20,
              fitRatio: 0.92,
            },
            root
          );
        }
        mmRef.current.fit();
        setError('');
      } catch (err) {
        setError(err?.message || 'This mind map could not be drawn.');
      }
    };

    frame = requestAnimationFrame(build);
    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
    };
  }, [markdown, streaming, sizeSvg]);

  // Keep the SVG's pixel size in step with its container.
  // The re-fit is deferred to the next frame: calling it straight from the
  // observer callback mutates layout during the same delivery cycle, which is
  // what raises "ResizeObserver loop completed with undelivered notifications".
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage || typeof ResizeObserver === 'undefined') return undefined;

    let frame = 0;
    const observer = new ResizeObserver(() => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        sizeSvg();
        try { mmRef.current?.fit(); } catch (_) { /* no-op */ }
      });
    });

    observer.observe(stage);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [sizeSvg]);

  // Destroy only on real unmount
  useEffect(
    () => () => {
      try { mmRef.current?.destroy?.(); } catch (_) { /* no-op */ }
      mmRef.current = null;
    },
    []
  );

  /* Toggling fullscreen changes the stage size in the same frame the class
     flips. Without an explicit resize the SVG keeps its previous pixel width,
     which on close leaves an oversized element stretching the card. */
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      sizeSvg();
      try { mmRef.current?.fit(); } catch (_) { /* no-op */ }
    });
    return () => cancelAnimationFrame(frame);
  }, [expanded, sizeSvg]);

  const close = useCallback(() => setExpanded(false), []);

  /* Toggling fullscreen changes the stage size, but the observer alone can be
     unreliable here because the SVG is what was holding the old size open —
     so re-measure directly once the new layout has painted. */
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      sizeSvg();
      try { mmRef.current?.fit(); } catch (_) { /* no-op */ }
    });
    return () => cancelAnimationFrame(frame);
  }, [expanded, sizeSvg]);

  useEffect(() => {
    if (!expanded) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') close(); };
    window.addEventListener('keydown', onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = previous;
    };
  }, [expanded, close]);

  const label = title || 'Mind map';

  return (
    <section className={`rb-card rb-mindmap${expanded ? ' is-expanded' : ''}`} aria-label={label}>
      <header className="rb-mindmap-head">
        <span className="rb-card-label">{label}</span>
        <div className="rb-mindmap-tools">
          <button type="button" onClick={() => mmRef.current?.fit()}>Fit</button>
          <button type="button" onClick={() => downloadPng(svgRef.current, label)}>PNG</button>
          <button type="button" onClick={() => downloadSvg(svgRef.current, label)}>SVG</button>
          <button type="button" onClick={() => setExpanded((v) => !v)}>
            {expanded ? 'Close' : 'Expand'}
          </button>
        </div>
      </header>

      {error ? (
        <div className="rb-diagram-fallback">
          <p className="rb-error">{error}</p>
          <pre className="rb-code">{raw}</pre>
        </div>
      ) : streaming || !markdown ? (
        <div className="rb-skeleton">Building the mind map…</div>
      ) : (
        <div className="rb-mindmap-stage" ref={stageRef}>
          <svg ref={svgRef} className="rb-mindmap-svg" />
        </div>
      )}

      <div className="rb-mindmap-hint">Click a branch to collapse or expand it · scroll to zoom · drag to pan</div>
    </section>
  );
};

export default React.memo(MindmapBlock);