import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { api, apiErrorMessage } from '../config/api';
import { paiseToRupees } from '../utils/format';

const PAGE_SIZE = 5;

function ActionIcon({ type }) {
  if (type === 'read') return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M21.2571 10.962C21.7311 11.582 21.7311 12.419 21.2571 13.038C19.7641 14.987 16.1821 19 12.0001 19C7.81806 19 4.23606 14.987 2.74306 13.038C2.51211 12.7413 2.38672 12.376 2.38672 12C2.38672 11.624 2.51211 11.2587 2.74306 10.962C4.23606 9.013 7.81806 5 12.0001 5C16.1821 5 19.7641 9.013 21.2571 10.962Z" stroke="#08947D" strokeLinecap="round" strokeLinejoin="round" /><path d="M15 12C15 13.6569 13.6569 15 12 15C10.3431 15 9 13.6569 9 12C9 10.3431 10.3431 9 12 9C13.6569 9 15 10.3431 15 12Z" stroke="#08947D" strokeLinecap="round" strokeLinejoin="round" /></svg>;
  if (type === 'edit') return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4.5 17.2071V19.0001C4.5 19.1327 4.55268 19.2599 4.64645 19.3536C4.74021 19.4474 4.86739 19.5001 5 19.5001H6.793C6.92535 19.5001 7.05229 19.4476 7.146 19.3541L15.646 10.8541L13.146 8.35409L4.646 16.8541C4.55253 16.9478 4.50003 17.0747 4.5 17.2071ZM15.09 6.41009L17.59 8.91009L18.793 7.70709C18.9805 7.51957 19.0858 7.26526 19.0858 7.00009C19.0858 6.73493 18.9805 6.48062 18.793 6.29309L17.707 5.20709C17.5195 5.01962 17.2652 4.91431 17 4.91431C16.7348 4.91431 16.4805 5.01962 16.293 5.20709L15.09 6.41009Z" stroke="#1D6DE6" /></svg>;
  return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 7H20M9 7V5H15V7M7 7L8 19H16L17 7M10 10V16M14 10V16" stroke="#E82F2F" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

export default function DraftPosts() {
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [openMenu, setOpenMenu] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/marketplace/requests/my');
      const details = await Promise.all((data.requests || []).map(async (request) => {
        const response = await api.get(`/marketplace/requests/${request.id}`);
        return { request, bids: response.data.bids || [] };
      }));
      setRows(details.flatMap(({ request, bids }) => bids.length ? bids.map((bid) => ({ request, bid })) : [{ request, bid: null }]));
      setPage(1);
    } catch (error) {
      toast.error(apiErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const removeRequest = async (requestId) => {
    try {
      await api.post(`/marketplace/requests/${requestId}/cancel`);
      toast.success('Draft request cancelled');
      setOpenMenu(null);
      load();
    } catch (error) { toast.error(apiErrorMessage(error)); }
  };

  const pageCount = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const visibleRows = rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const pageItems = pageCount <= 7
    ? Array.from({ length: pageCount }, (_, index) => index + 1)
    : page <= 4
      ? [1, 2, 3, 4, 'ellipsis', pageCount]
      : page >= pageCount - 3
        ? [1, 'ellipsis', pageCount - 3, pageCount - 2, pageCount - 1, pageCount]
        : [1, 'ellipsis', page - 1, page, page + 1, 'ellipsis', pageCount];

  return <div className="draft-posts-page" onClick={() => openMenu && setOpenMenu(null)}>
    <button className="back-link" onClick={() => navigate('/marketplace')}>&larr; Back to Marketplace</button>
    <div className="draft-posts-heading"><div><h1 className="marketplace-title">View Draft Post</h1><p className="marketplace-subtitle">Review your posted legal drafting requirements and received quotes.</p></div><button className="yellow-btn" onClick={() => navigate('/marketplace/requests/new')}>+ New Draft Request</button></div>
    <div className="draft-posts-table-wrap">
       <table className="draft-posts-table"><thead><tr><th>Name</th><th>Draft Title</th><th>Bidding Amount</th><th>Action</th></tr></thead><tbody>
         {loading ? <tr><td colSpan="4" className="draft-table-empty">Loading draft posts...</td></tr> : !rows.length ? <tr><td colSpan="4" className="draft-table-empty">No draft posts yet.</td></tr> : visibleRows.map(({ request, bid }, index) => <tr key={`${request.id}-${bid?.id || 'none'}-${index}`}><td>{bid?.advocate_name || 'Awaiting advocate'}</td><td>{request.title}</td><td>{bid ? paiseToRupees(bid.amount) : '—'}</td><td className="draft-action-cell"><button className="dots-button" onClick={(event) => { event.stopPropagation(); setOpenMenu(openMenu === `${request.id}-${bid?.id}` ? null : `${request.id}-${bid?.id}`); }}>⋮</button>{openMenu === `${request.id}-${bid?.id}` && <div className="draft-action-menu" onClick={(event) => event.stopPropagation()}><button onClick={() => navigate(`/marketplace/requests/${request.id}/quotes`)}><ActionIcon type="read" />Read</button><button onClick={() => navigate(`/marketplace/requests/${request.id}`)}><ActionIcon type="edit" />Edit</button><button className="delete-action" onClick={() => removeRequest(request.id)}><ActionIcon type="delete" />Delete</button></div>}</td></tr>)}
       </tbody></table>
      <div className="draft-pagination"><button aria-label="Previous page" disabled={page === 1} onClick={() => setPage((value) => Math.max(1, value - 1))}>‹</button>{pageItems.map((item, index) => item === 'ellipsis' ? <span key={`ellipsis-${index}`}>...</span> : <button key={item} className={page === item ? 'current' : ''} onClick={() => setPage(item)}>{item}</button>)}<button aria-label="Next page" disabled={page === pageCount} onClick={() => setPage((value) => Math.min(pageCount, value + 1))}>›</button></div>
    </div>
  </div>;
}
