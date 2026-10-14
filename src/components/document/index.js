import React, { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../AuthContext';
import './document.css';
import axiosInstance from '../config/apiconfig';

// View-ku etha maadhiri page size
const LIMITS = { grid: 18, list: 12 };

/* ── helpers ── */
function formatBytes(bytes) {
  if (!bytes && bytes !== 0) return '—';
  const units = ['B', 'KB', 'MB', 'GB'];
  let i = 0;
  let n = bytes;
  while (n >= 1024 && i < units.length - 1) {
    n /= 1024;
    i++;
  }
  return `${n.toFixed(n < 10 && i > 0 ? 1 : 0)} ${units[i]}`;
}

function formatDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString(undefined, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatShortDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' });
}

function getFileKind(mime = '', filename = '') {
  const m = (mime || '').toLowerCase();
  const ext = (filename || '').split('.').pop()?.toLowerCase();
  if (m.includes('pdf') || ext === 'pdf') return { kind: 'pdf', label: 'PDF' };
  if (m.startsWith('audio/')) return { kind: 'audio', label: 'Audio' };
  if (m.startsWith('image/')) return { kind: 'image', label: 'Image' };
  if (m.startsWith('video/')) return { kind: 'video', label: 'Video' };
  if (m.includes('word') || ['doc', 'docx'].includes(ext)) return { kind: 'doc', label: 'Word' };
  if (m.includes('spreadsheet') || m.includes('excel') || ['xls', 'xlsx'].includes(ext)) return { kind: 'sheet', label: 'Excel' };
  if (m.includes('presentation') || m.includes('powerpoint') || ['ppt', 'pptx'].includes(ext)) return { kind: 'slides', label: 'PPT' };
  if (m.startsWith('text/') || ['txt', 'csv', 'json', 'md'].includes(ext)) return { kind: 'text', label: (ext || 'Text').toUpperCase() };
  return { kind: 'file', label: (ext || 'File').toUpperCase() };
}

// 1 … 4 5 [6] 7 8 … 20
function getPageNumbers(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = [1];
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  if (start > 2) pages.push('…');
  for (let i = start; i <= end; i++) pages.push(i);
  if (end < total - 1) pages.push('…');
  pages.push(total);
  return pages;
}

/* ── icons ── */
function FileIcon({ kind, size = 22 }) {
  const common = {
    width: size, height: size, viewBox: '0 0 24 24', fill: 'none',
    stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round',
  };
  if (kind === 'audio') {
    return (
      <svg {...common}><path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" /></svg>
    );
  }
  if (kind === 'image') {
    return (
      <svg {...common}><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="m21 15-5-5L5 21" /></svg>
    );
  }
  if (kind === 'video') {
    return (
      <svg {...common}><rect x="2" y="5" width="15" height="14" rx="2" /><path d="m17 10 5-3v10l-5-3" /></svg>
    );
  }
  return (
    <svg {...common}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6" />
      {kind === 'pdf' && <path d="M8 13h8M8 17h5" />}
    </svg>
  );
}

function ExternalIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <path d="M15 3h6v6" />
      <path d="M10 14 21 3" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

function GridIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" />
    </svg>
  );
}

function ListIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
    </svg>
  );
}

/* ── Thumbnail (grid card top area) ── */
function Thumb({ doc, kind, label }) {
  const [imgFailed, setImgFailed] = useState(false);

  if (kind === 'image' && doc.view_url && !imgFailed) {
    return (
      <div className="thumb thumb--image">
        <img src={doc.view_url} alt="" loading="lazy" onError={() => setImgFailed(true)} />
      </div>
    );
  }

  return (
    <div className={`thumb thumb--${kind}`}>
      {kind === 'audio' ? (
        <div className="thumb-wave" aria-hidden="true">
          {[40, 70, 55, 90, 60, 80, 45, 75, 50, 65, 35, 85, 55].map((h, i) => (
            <span key={i} style={{ height: `${h}%` }} />
          ))}
        </div>
      ) : (
        <div className="thumb-paper">
          <FileIcon kind={kind} size={28} />
          <span className="thumb-ext">{label}</span>
        </div>
      )}
    </div>
  );
}

/* ── Viewer modal ── */
function FileViewer({ doc, onClose }) {
  const { kind, label } = getFileKind(doc.mime_type, doc.filename);
  const [mediaError, setMediaError] = useState(false);

  // Esc press panna close + background scroll lock
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  const url = doc.view_url;

  const renderPreview = () => {
    if (!url) {
      return <div className="viewer-fallback">File link is unavailable. Please refresh the page and try again.</div>;
    }
    if (mediaError) {
      return (
        <div className="viewer-fallback">
          <p>Couldn't load the preview. The link may have expired.</p>
          <p className="viewer-fallback-sub">Refresh the page and open the file again.</p>
        </div>
      );
    }
    switch (kind) {
      case 'pdf':
      case 'text':
        return <iframe className="viewer-frame" src={url} title={doc.filename} />;
      case 'doc':
      case 'sheet':
      case 'slides':
        // Browser-ku .docx/.xlsx/.pptx render panna theriyaadhu —
        // Microsoft Office Online viewer presigned URL-a fetch panni render pannum
        return (
          <iframe
            className="viewer-frame"
            src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(url)}`}
            title={doc.filename}
          />
        );
      case 'image':
        return <img className="viewer-image" src={url} alt={doc.filename} onError={() => setMediaError(true)} />;
      case 'audio':
        return (
          <div className="viewer-audio">
            <div className="viewer-audio-icon"><FileIcon kind="audio" size={40} /></div>
            <audio controls autoPlay src={url} onError={() => setMediaError(true)} />
          </div>
        );
      case 'video':
        return <video className="viewer-video" controls src={url} onError={() => setMediaError(true)} />;
      default:
        return (
          <div className="viewer-fallback">
            <div className="docs-empty-icon"><FileIcon kind={kind} /></div>
            <p>Preview is not available for this file type.</p>
            <p className="viewer-fallback-sub">Click "Open in new tab" to view it.</p>
          </div>
        );
    }
  };

  return (
    <div className="viewer-overlay" onMouseDown={onClose} role="dialog" aria-modal="true" aria-label={doc.filename}>
      <div className="viewer-modal" onMouseDown={(e) => e.stopPropagation()}>
        <header className="viewer-header">
          <div className={`doc-icon doc-icon--${kind}`}><FileIcon kind={kind} /></div>
          <div className="viewer-title-wrap">
            <h2 className="viewer-title" title={doc.filename}>{doc.filename || 'Untitled'}</h2>
            <div className="doc-meta">
              <span className="doc-badge">{label}</span>
              <span>{formatBytes(doc.size_bytes)}</span>
              <span>· {formatDate(doc.uploaded_at)}</span>
            </div>
          </div>
          <div className="viewer-actions">
            {url && (
              <a className="viewer-btn" href={url} target="_blank" rel="noopener noreferrer">
                <ExternalIcon /> <span className="viewer-btn-text">Open in new tab</span>
              </a>
            )}
            <button className="viewer-btn viewer-btn--icon" onClick={onClose} aria-label="Close">
              <CloseIcon />
            </button>
          </div>
        </header>
        <div className={`viewer-body viewer-body--${kind}`}>{renderPreview()}</div>
      </div>
    </div>
  );
}

/* ── component ── */
function DocumentIndex() {
  const { user } = useAuth();
  const user_id = user?.id;

  const [page, setPage] = useState(1);
  const [docs, setDocs] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);
  const [activeDoc, setActiveDoc] = useState(null);
  const [view, setView] = useState(() => {
    try { return localStorage.getItem('docs-view') || 'grid'; } catch { return 'grid'; }
  });

  const limit = LIMITS[view] || LIMITS.grid;

  useEffect(() => {
    try { localStorage.setItem('docs-view', view); } catch { /* ignore */ }
  }, [view]);

  // View maarina limit maarum — page 1-ku reset
  const changeView = (next) => {
    if (next === view) return;
    setView(next);
    setPage(1);
  };

  const fetchDocs = useCallback(
    async (signal) => {
      if (!user_id) return;
      setLoading(true);
      setError('');
      try {
        const res = await axiosInstance.get(`document_ledger/document/${user_id}`, {
          params: { page, limit },
          signal,
        });

        const json = res.data;
        setDocs(json.data || []);
        setPagination(json.pagination || null);

        if (json.pagination && page > json.pagination.totalPages) {
          setPage(json.pagination.totalPages);
        }
      } catch (err) {
        if (err.name === 'CanceledError' || err.code === 'ERR_CANCELED') return;
        console.error('Docs fetch error:', err.response?.status, err.response?.data || err.message);
        setError("Couldn't load your documents. Please try again in a moment.");
      } finally {
        if (!signal?.aborted) setLoading(false);
      }
    },
    [user_id, page, limit]
  );

  useEffect(() => {
    const controller = new AbortController();
    fetchDocs(controller.signal);
    return () => controller.abort();
  }, [fetchDocs, reloadKey]);

  const closeViewer = useCallback(() => setActiveDoc(null), []);

  const goTo = (p) => {
    if (!pagination) return;
    if (p < 1 || p > pagination.totalPages || p === page) return;
    setPage(p);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const total = pagination?.total ?? 0;
  const from = total === 0 ? 0 : (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  const showContent = user_id && !error && !loading && docs.length > 0;

  return (
    <div className="docs-page">
      <header className="docs-header">
        <div>
          <h2 className="docs-title">Documents Ledger</h2>
          <p className="docs-subtitle">
            {loading && !pagination
              ? 'Loading…'
              : total > 0
              ? `Showing ${from}–${to} of ${total} files`
              : 'No uploads yet'}
          </p>
        </div>

        <div className="view-toggle" role="group" aria-label="View mode">
          <button
            className={`view-toggle-btn ${view === 'grid' ? 'is-active' : ''}`}
            onClick={() => changeView('grid')}
            aria-pressed={view === 'grid'}
            aria-label="Grid view"
          >
            <GridIcon />
          </button>
          <button
            className={`view-toggle-btn ${view === 'list' ? 'is-active' : ''}`}
            onClick={() => changeView('list')}
            aria-pressed={view === 'list'}
            aria-label="List view"
          >
            <ListIcon />
          </button>
        </div>
      </header>

      {!user_id && <div className="docs-state">User not found. Please sign in again.</div>}

      {user_id && error && (
        <div className="docs-state docs-state--error">
          <p>{error}</p>
          <button className="docs-btn" onClick={() => setReloadKey((k) => k + 1)}>
            Retry
          </button>
        </div>
      )}

      {/* ── Loading skeletons ── */}
      {user_id && !error && loading && (
        view === 'grid' ? (
          <div className="docs-grid" aria-busy="true">
            {Array.from({ length: limit }).map((_, i) => (
              <div key={i} className="g-card g-card--skeleton">
                <div className="sk sk-thumb" />
                <div className="g-card-info">
                  <div className="sk sk-line" />
                  <div className="sk sk-line sk-line--short" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="docs-list" aria-busy="true">
            {Array.from({ length: limit }).map((_, i) => (
              <div key={i} className="l-row l-row--skeleton">
                <div className="sk sk-icon" />
                <div className="sk sk-line" />
              </div>
            ))}
          </div>
        )
      )}

      {/* ── Empty ── */}
      {user_id && !error && !loading && docs.length === 0 && (
        <div className="docs-state">
          <div className="docs-empty-icon"><FileIcon kind="file" /></div>
          <p className="docs-empty-title">No documents yet</p>
          <p className="docs-empty-sub">Files you upload in chat will appear here.</p>
        </div>
      )}

      {/* ── Grid view ── */}
      {showContent && view === 'grid' && (
        <div className="docs-grid">
          {docs.map((doc) => {
            const { kind, label } = getFileKind(doc.mime_type, doc.filename);
            const disabled = !doc.view_url;
            return (
              <button
                type="button"
                key={doc._id || doc.document_id}
                className={`g-card ${disabled ? 'is-disabled' : ''}`}
                title={disabled ? 'File unavailable' : doc.filename}
                onClick={() => !disabled && setActiveDoc(doc)}
                disabled={disabled}
              >
                <Thumb doc={doc} kind={kind} label={label} />
                <span className={`g-chip g-chip--${kind}`}>{label}</span>
                <div className="g-card-info">
                  <h3 className="g-name">{doc.filename || 'Untitled'}</h3>
                  <div className="g-meta">
                    <span>{formatBytes(doc.size_bytes)}</span>
                    <span className="dot" />
                    <time dateTime={doc.uploaded_at}>{formatShortDate(doc.uploaded_at)}</time>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* ── List view ── */}
      {showContent && view === 'list' && (
        <div className="docs-list">
          <div className="l-head">
            <span>Name</span>
            <span>Type</span>
            <span>Size</span>
            <span>Uploaded</span>
          </div>
          {docs.map((doc) => {
            const { kind, label } = getFileKind(doc.mime_type, doc.filename);
            const disabled = !doc.view_url;
            return (
              <button
                type="button"
                key={doc._id || doc.document_id}
                className={`l-row ${disabled ? 'is-disabled' : ''}`}
                title={disabled ? 'File unavailable' : doc.filename}
                onClick={() => !disabled && setActiveDoc(doc)}
                disabled={disabled}
              >
                <span className="l-name">
                  <span className={`doc-icon doc-icon--sm doc-icon--${kind}`}><FileIcon kind={kind} size={18} /></span>
                  <span className="l-name-text">{doc.filename || 'Untitled'}</span>
                </span>
                <span className="l-type"><span className={`g-chip g-chip--inline g-chip--${kind}`}>{label}</span></span>
                <span className="l-size">{formatBytes(doc.size_bytes)}</span>
                <span className="l-date">{formatDate(doc.uploaded_at)}</span>
              </button>
            );
          })}
        </div>
      )}

      {pagination && pagination.totalPages > 1 && !error && (
        <nav className="docs-pagination" aria-label="Pagination">
          <button
            className="page-btn"
            onClick={() => goTo(page - 1)}
            disabled={!pagination.hasPrev || loading}
            aria-label="Previous page"
          >
            ‹ Prev
          </button>

          <div className="page-numbers">
            {getPageNumbers(page, pagination.totalPages).map((p, i) =>
              p === '…' ? (
                <span key={`e${i}`} className="page-ellipsis">…</span>
              ) : (
                <button
                  key={p}
                  className={`page-btn page-num ${p === page ? 'is-active' : ''}`}
                  onClick={() => goTo(p)}
                  disabled={loading}
                  aria-current={p === page ? 'page' : undefined}
                >
                  {p}
                </button>
              )
            )}
          </div>

          <button
            className="page-btn"
            onClick={() => goTo(page + 1)}
            disabled={!pagination.hasNext || loading}
            aria-label="Next page"
          >
            Next ›
          </button>
        </nav>
      )}

      {activeDoc && <FileViewer doc={activeDoc} onClose={closeViewer} />}
    </div>
  );
}

export default DocumentIndex;