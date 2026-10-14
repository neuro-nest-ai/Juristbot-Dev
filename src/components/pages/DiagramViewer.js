import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

const MIN_SCALE = 0.3;
const MAX_SCALE = 6;
const clamp = (n) => Math.min(Math.max(n, MIN_SCALE), MAX_SCALE);

/* Reads the diagram's natural width from the SVG so zooming can resize the
   element itself. Scaling with a CSS transform would rasterise the SVG once
   and stretch that bitmap, which turns blurry past ~150%; changing the width
   makes the browser re-render the vector at the new size, so it stays sharp. */
const readNaturalWidth = (root) => {
  const svg = root?.querySelector('svg');
  if (!svg) return 0;

  const viewBox = svg.getAttribute('viewBox');
  if (viewBox) {
    const w = parseFloat(viewBox.split(/[\s,]+/)[2]);
    if (w > 0) return w;
  }
  return svg.getBoundingClientRect().width || 0;
};

/**
 * Fullscreen overlay for a rendered Mermaid SVG: scroll to zoom, drag to pan,
 * buttons for zoom in/out/reset, Escape or backdrop click to close.
 * Mounted in a portal so the chat's overflow/scroll containers can't clip it.
 */
const DiagramViewer = ({ svg, label = 'Diagram', onClose }) => {
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [baseWidth, setBaseWidth] = useState(0);
  const dragRef = useRef(null);
  const stageRef = useRef(null);
  const canvasRef = useRef(null);

  // Measure once the SVG is in the DOM, and start at a size that fits the stage
  useEffect(() => {
    const natural = readNaturalWidth(canvasRef.current);
    if (!natural) return;
    setBaseWidth(natural);

    const stageWidth = stageRef.current?.clientWidth || 0;
    if (stageWidth && natural > stageWidth) {
      setScale(clamp((stageWidth - 64) / natural));
    }
  }, [svg]);

  const reset = useCallback(() => {
    setScale(1);
    setOffset({ x: 0, y: 0 });
  }, []);

  // Escape to close, +/- to zoom, 0 to reset
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === '+' || e.key === '=') setScale((s) => clamp(s * 1.2));
      if (e.key === '-') setScale((s) => clamp(s / 1.2));
      if (e.key === '0') reset();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, reset]);

  // Lock background scrolling while open
  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previous; };
  }, []);

  // Wheel zoom, anchored on the pointer so the diagram grows toward the cursor
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return undefined;

    const onWheel = (e) => {
      e.preventDefault();
      const rect = stage.getBoundingClientRect();
      const px = e.clientX - rect.left - rect.width / 2;
      const py = e.clientY - rect.top - rect.height / 2;

      setScale((prev) => {
        const next = clamp(prev * (e.deltaY < 0 ? 1.15 : 1 / 1.15));
        const ratio = next / prev;
        setOffset((o) => ({
          x: px - (px - o.x) * ratio,
          y: py - (py - o.y) * ratio,
        }));
        return next;
      });
    };

    stage.addEventListener('wheel', onWheel, { passive: false });
    return () => stage.removeEventListener('wheel', onWheel);
  }, []);

  const onPointerDown = (e) => {
    dragRef.current = { x: e.clientX - offset.x, y: e.clientY - offset.y };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e) => {
    if (!dragRef.current) return;
    setOffset({ x: e.clientX - dragRef.current.x, y: e.clientY - dragRef.current.y });
  };

  const onPointerUp = (e) => {
    dragRef.current = null;
    try { e.currentTarget.releasePointerCapture(e.pointerId); } catch (_) { /* no-op */ }
  };

  return createPortal(
    <div className="rb-viewer" role="dialog" aria-modal="true" aria-label={label}>
      <div className="rb-viewer-bar">
        <span className="rb-viewer-title">{label}</span>
        <div className="rb-viewer-tools">
          <button type="button" onClick={() => setScale((s) => clamp(s / 1.2))} aria-label="Zoom out">−</button>
          <span className="rb-viewer-zoom">{Math.round(scale * 100)}%</span>
          <button type="button" onClick={() => setScale((s) => clamp(s * 1.2))} aria-label="Zoom in">+</button>
          <button type="button" onClick={reset}>Reset</button>
          <button type="button" className="rb-viewer-close" onClick={onClose} aria-label="Close">✕</button>
        </div>
      </div>

      <div
        className="rb-viewer-stage"
        ref={stageRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <div
          className="rb-viewer-canvas"
          ref={canvasRef}
          style={{
            transform: `translate(${offset.x}px, ${offset.y}px)`,
            width: baseWidth ? `${baseWidth * scale}px` : undefined,
          }}

          dangerouslySetInnerHTML={{ __html: svg }}
        />
      </div>

      <div className="rb-viewer-hint">Scroll to zoom · drag to pan · Esc to close</div>
    </div>,
    document.body
  );
};

export default DiagramViewer;