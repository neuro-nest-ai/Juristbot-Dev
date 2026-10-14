/* ═══════════════════════════════════════════════════════════════════════
   downloadDiagram.js
   Exports a live <svg> (Mermaid or markmap) as a standalone .svg or .png.

   The on-screen diagrams inherit colours and fonts from the app's stylesheet,
   so a naive serialisation comes out unstyled — black text on a transparent
   background, or invisible text in dark mode. Everything the export needs is
   therefore read from the live element with getComputedStyle and baked into
   the copy before it leaves the page.
   ═══════════════════════════════════════════════════════════════════════ */

const triggerDownload = (href, filename) => {
  const link = document.createElement('a');
  link.href = href;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const safeName = (name = 'diagram') =>
  (name.trim() || 'diagram')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60) || 'diagram';

/** Measures the drawing, not the viewport-sized <svg> element. */
const measure = (svg) => {
  let width = 0;
  let height = 0;

  try {
    const box = svg.getBBox();
    width = box.width + box.x * 2;
    height = box.height + box.y * 2;
  } catch (_) { /* getBBox throws on detached nodes */ }

  if (!width || !height) {
    const rect = svg.getBoundingClientRect();
    width = rect.width;
    height = rect.height;
  }

  const viewBox = svg.getAttribute('viewBox');
  if ((!width || !height) && viewBox) {
    const parts = viewBox.split(/[\s,]+/).map(Number);
    width = parts[2] || 800;
    height = parts[3] || 600;
  }

  return { width: Math.ceil(width) || 800, height: Math.ceil(height) || 600 };
};

/**
 * Clones the SVG and makes it self-contained: explicit size, namespaces,
 * a solid background, and the inherited text colour/font written in.
 */
const buildStandaloneSvg = (svg, { padding = 24 } = {}) => {
  const computed = window.getComputedStyle(svg);
  const color = computed.color || '#1a1a2e';
  const fontFamily = computed.fontFamily || 'Figtree, sans-serif';

  // Background comes from the nearest card so exports match what's on screen
  const card = svg.closest('.rb-card');
  const cardBg = card ? window.getComputedStyle(card).backgroundColor : '';
  const background =
    cardBg && cardBg !== 'rgba(0, 0, 0, 0)' && cardBg !== 'transparent' ? cardBg : '#ffffff';

  const { width, height } = measure(svg);
  const outW = width + padding * 2;
  const outH = height + padding * 2;

  const clone = svg.cloneNode(true);
  clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  clone.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');
  clone.setAttribute('width', String(outW));
  clone.setAttribute('height', String(outH));
  clone.setAttribute('viewBox', `${-padding} ${-padding} ${outW} ${outH}`);
  clone.removeAttribute('style');

  // markmap applies its own transform for zoom/pan — drop it so the export is
  // framed on the content rather than on wherever the user happened to pan to.
  const zoomLayer = clone.querySelector('g');
  if (zoomLayer && zoomLayer.getAttribute('transform')) {
    const live = svg.querySelector('g');
    if (live) {
      try {
        const box = live.getBBox();
        zoomLayer.setAttribute('transform', `translate(${-box.x}, ${-box.y})`);
        clone.setAttribute('viewBox', `${-padding} ${-padding} ${Math.ceil(box.width) + padding * 2} ${Math.ceil(box.height) + padding * 2}`);
        clone.setAttribute('width', String(Math.ceil(box.width) + padding * 2));
        clone.setAttribute('height', String(Math.ceil(box.height) + padding * 2));
      } catch (_) { /* keep the original framing */ }
    }
  }

  const style = document.createElementNS('http://www.w3.org/2000/svg', 'style');
  style.textContent = `
    svg { background: ${background}; }
    text, tspan, div, span, p { font-family: ${fontFamily}; }
    .markmap-foreign, .markmap-foreign div, foreignObject div { color: ${color}; font-family: ${fontFamily}; }
    text { fill: ${color}; }
  `;
  clone.insertBefore(style, clone.firstChild);

  const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  const vb = clone.getAttribute('viewBox').split(/\s+/).map(Number);
  rect.setAttribute('x', String(vb[0]));
  rect.setAttribute('y', String(vb[1]));
  rect.setAttribute('width', String(vb[2]));
  rect.setAttribute('height', String(vb[3]));
  rect.setAttribute('fill', background);
  clone.insertBefore(rect, style.nextSibling);

  const source = new XMLSerializer().serializeToString(clone);
  return {
    source: `<?xml version="1.0" encoding="UTF-8"?>\n${source}`,
    width: Number(clone.getAttribute('width')),
    height: Number(clone.getAttribute('height')),
  };
};

/** Saves the diagram as a vector .svg file. */
export const downloadSvg = (svg, name) => {
  if (!svg) return;
  const { source } = buildStandaloneSvg(svg);
  const blob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  triggerDownload(url, `${safeName(name)}.svg`);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};

/**
 * Saves the diagram as a .png, rendered at 2× for a crisp result.
 * Falls back to the SVG export if the browser refuses to rasterise it.
 */
export const downloadPng = (svg, name, scale = 2) =>
  new Promise((resolve) => {
    if (!svg) {
      resolve(false);
      return;
    }

    const { source, width, height } = buildStandaloneSvg(svg);
    const url = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(source)}`;
    const image = new Image();

    image.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, Math.round(width * scale));
        canvas.height = Math.max(1, Math.round(height * scale));

        const ctx = canvas.getContext('2d');
        ctx.setTransform(scale, 0, 0, scale, 0, 0);
        ctx.drawImage(image, 0, 0, width, height);

        canvas.toBlob((blob) => {
          if (!blob) {
            downloadSvg(svg, name);
            resolve(false);
            return;
          }
          const objectUrl = URL.createObjectURL(blob);
          triggerDownload(objectUrl, `${safeName(name)}.png`);
          setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
          resolve(true);
        }, 'image/png');
      } catch (err) {
        console.warn('PNG export failed, saving SVG instead:', err);
        downloadSvg(svg, name);
        resolve(false);
      }
    };

    image.onerror = () => {
      console.warn('PNG export failed, saving SVG instead.');
      downloadSvg(svg, name);
      resolve(false);
    };

    image.src = url;
  });