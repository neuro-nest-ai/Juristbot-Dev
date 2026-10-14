import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import Pagination from '@mui/material/Pagination';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown } from "@fortawesome/free-solid-svg-icons";
import { DateRange } from 'react-date-range';
import { format } from 'date-fns';
import { enUS } from 'date-fns/locale';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import config from "../config/config";
import { useAuth } from '../AuthContext';
import './chathistory.css';
import { Link } from "react-router-dom";
import { faArrowLeft,  } from '@fortawesome/free-solid-svg-icons';

const TABS = [
  { key: 'Scenario_history',       label: 'Scenario'            },
  { key: 'Crossquestions_history', label: 'Cross Questions'     },
  { key: 'Draft_history',          label: 'Draft'               },
  { key: 'Relevant_judgements',    label: 'Relevant Judgements' },
];

const formatDate = (iso) => {
  if (!iso) return '-';
  return new Date(iso).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
};

const mdComponents = {
  h1: ({ children }) => <h5 className="chat-old-history-md-h1">{children}</h5>,
  h2: ({ children }) => <h6 className="chat-old-history-md-h2">{children}</h6>,
  h3: ({ children }) => <strong className="chat-old-history-md-h3">{children}</strong>,
  p:  ({ children }) => <p className="chat-old-history-md-p">{children}</p>,
  ul: ({ children }) => <ul className="chat-old-history-md-ul">{children}</ul>,
  ol: ({ children }) => <ol className="chat-old-history-md-ol">{children}</ol>,
  li: ({ children }) => <li className="chat-old-history-md-li">{children}</li>,
  hr: () => <hr className="chat-old-history-md-hr" />,
  strong: ({ children }) => <strong className="chat-old-history-md-strong">{children}</strong>,
};

/* ---------- Chat Modal ---------- */
const ChatModal = ({ row, onClose }) => {
  if (!row) return null;
  return (
    <>
      {/* Backdrop */}
      <div onClick={onClose} className="chat-old-history-modal-backdrop" />

      {/* Modal panel */}
      <div className="chat-old-history-modal-panel">
        {/* Modal header */}
        <div className="chat-old-history-modal-header">
          <div>
            <div className="chat-old-history-modal-header-title">🤖 JuristBot AI</div>
            <div className="chat-old-history-modal-header-subtitle">{row.title}</div>
          </div>
          <button onClick={onClose} className="chat-old-history-modal-close-btn">
            ✕
          </button>
        </div>

        {/* Chat messages */}
        <div className="chat-old-history-modal-body">
          {row.messages?.length > 0 ? row.messages.map((msg, mIdx) => (
            <React.Fragment key={mIdx}>
              {/* User bubble */}
              <div className="chat-old-history-msg-user-row">
                <div>
                  <div className="chat-old-history-msg-user-bubble">
                    {msg.prompt}
                  </div>
                  <div className="chat-old-history-msg-user-timestamp">
                    {formatDate(msg.timestamp)}
                  </div>
                </div>
              </div>

              {/* Bot bubble */}
              <div className="chat-old-history-msg-bot-row">
                <div className="chat-old-history-msg-bot-avatar">
                  🤖
                </div>
                <div>
                  <div className="chat-old-history-msg-bot-name">
                    JuristBot AI
                  </div>
                  <div className="chat-old-history-msg-bot-bubble">
                    <ReactMarkdown components={mdComponents}>{msg.answer}</ReactMarkdown>
                  </div>
                  <div className="chat-old-history-msg-bot-timestamp">
                    {formatDate(msg.timestamp)}
                  </div>
                </div>
              </div>
            </React.Fragment>
          )) : (
            <div className="text-center text-muted py-4">No messages.</div>
          )}
        </div>

        {/* Modal footer */}
        <div className="chat-old-history-modal-footer">
          {row.messages?.length ?? 0} message(s) · {formatDate(row.Date)}
        </div>
      </div>
    </>
  );
};

/* ---------- Date Range Filter (react-date-range, single pill trigger) ---------- */
const DateRangeFilter = ({ appliedFrom, appliedTo, onApply, onClear }) => {
  const [showPicker, setShowPicker] = useState(false);
  const [range, setRange] = useState([{
    startDate: appliedFrom || null,
    endDate: appliedTo || null,
    key: 'selection',
  }]);
  const pickerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        setShowPicker(false);
      }
    };
    if (showPicker) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showPicker]);

  const prettyRange = range[0].startDate && range[0].endDate
    ? `${format(range[0].startDate, 'dd MMM yy')} – ${format(range[0].endDate, 'dd MMM yy')}`
    : 'Date range';

  const handleTogglePicker = () => setShowPicker(prev => !prev);

  const handleApply = () => {
    onApply(range[0].startDate, range[0].endDate);
    setShowPicker(false);
  };

  const handleClear = () => {
    setRange([{ startDate: null, endDate: null, key: 'selection' }]);
    onClear();
    setShowPicker(false);
  };

  return (
    <div className="chat-old-history-daterange-wrapper" ref={pickerRef}>
      <button
        type="button"
        className="chat-old-history-daterange-btn"
        onClick={handleTogglePicker}
      >
        {prettyRange} <FontAwesomeIcon icon={faChevronDown}  className="chat-old-history-daterange-chevron" />
      </button>

      {showPicker && (
        <div className="chat-old-history-daterange-popover shadow">
          <DateRange
            ranges={[{
              startDate: range[0].startDate || new Date(),
              endDate: range[0].endDate || new Date(),
              key: 'selection',
            }]}
            locale={enUS}
            onChange={(item) => setRange([item.selection])}
            moveRangeOnFirstSelection={false}
            maxDate={new Date()}
          />
          <div className="chat-old-history-daterange-actions">
            <button className="chat-old-history-filter-clear-btn" onClick={handleClear}>
              Clear
            </button>
            <button className="chat-old-history-filter-apply-btn" onClick={handleApply}>
              Apply
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

/* ---------- Main Component ---------- */
const Chathistory = () => {
  const [activeTab, setActiveTab] = useState(TABS[0].key);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedRow, setSelectedRow] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [appliedFromDate, setAppliedFromDate] = useState(null);
  const [appliedToDate, setAppliedToDate] = useState(null);

  const PER_PAGE = 12;
  const { user } = useAuth();
  const userId = user?.id;

useEffect(() => {
  setLoading(true);
  setError('');
  setData([]);
  setSelectedRow(null);
  setCurrentPage(1);
  setAppliedFromDate(null);
  setAppliedToDate(null);
  axios
    .get(`${config.apiBaseUrl}/adminhistory/${activeTab}/${userId}`)
    .then(res => setData(res.data))
    .catch(() => setError('Failed to load history.'))
    .finally(() => setLoading(false));
}, [activeTab, userId]);

  const filteredData = data.filter(row => {
    if (!appliedFromDate && !appliedToDate) return true;
    if (!row.Date) return false;
    const rowTime = new Date(row.Date).getTime();

    if (appliedFromDate) {
      const fromTime = new Date(appliedFromDate).setHours(0, 0, 0, 0);
      if (rowTime < fromTime) return false;
    }
    if (appliedToDate) {
      const toTime = new Date(appliedToDate).setHours(23, 59, 59, 999);
      if (rowTime > toTime) return false;
    }
    return true;
  });

  const totalPages = Math.ceil(filteredData.length / PER_PAGE);
  const paginatedData = filteredData.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);

  const handleApplyFilter = (from, to) => {
    setAppliedFromDate(from);
    setAppliedToDate(to);
    setCurrentPage(1);
  };

  const handleClearFilter = () => {
    setAppliedFromDate(null);
    setAppliedToDate(null);
    setCurrentPage(1);
  };

  return (
    <div className="chat-old-history">

       <div className="">
        <Link to="/chat">
          <h1><FontAwesomeIcon className='iconback' icon={faArrowLeft} /></h1>
        </Link>
      </div>
      <div className="chat-old-history-topbar">
        <Select
          value={activeTab}
          onChange={(e) => setActiveTab(e.target.value)}
          size="small"
          className="chat-old-history-tab-select"
          sx={{
            minWidth: 180,
            fontSize: 13.5,
            '& .MuiOutlinedInput-notchedOutline': { borderColor: '#d7d7dc' },
          }}
        >
          {TABS.map(tab => (
            <MenuItem key={tab.key} value={tab.key} sx={{ fontSize: 13.5 }}>
              {tab.label}
            </MenuItem>
          ))}
        </Select>

        <DateRangeFilter
          appliedFrom={appliedFromDate}
          appliedTo={appliedToDate}
          onApply={handleApplyFilter}
          onClear={handleClearFilter}
        />
      </div>

      {/* Content */}
      <div className="common-overall-container">
        {loading && (
          <div className="text-center py-4">
            <div className="spinner-border text-primary" role="status" />
          </div>
        )}
        {error && <div className="alert alert-danger">{error}</div>}
        {!loading && !error && filteredData.length === 0 && (
          <div className="chat-old-history-empty-state">No history found.</div>
        )}

        {!loading && !error && filteredData.length > 0 && (
          <div className="chat-old-history-table-wrapper">
            <table className="chat-old-history-table">
              <thead>
                <tr>
                  <th className="text-center" style={{ width: 60 }}>S.no</th>
                  <th>Title</th>
                  <th style={{ width: 200 }}>Date</th>
                  <th className="text-center" style={{ width: 80 }}>View</th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.map((row, idx) => (
                  <tr key={row._id || idx}>
                    <td className="text-center chat-old-history-sno">
                      {(currentPage - 1) * PER_PAGE + idx + 1}
                    </td>
                    <td>{row.title || '-'}</td>
                    <td>{formatDate(row.Date)}</td>
                    <td className="text-center">
                      <button
                        className="chat-old-history-view-btn"
                        onClick={() => setSelectedRow(row)}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="chat-old-history-pagination-row">
          <Pagination
            count={totalPages}
            page={currentPage}
            onChange={(e, val) => setCurrentPage(val)}
            color="primary"
            siblingCount={1}
            boundaryCount={1}
          />
        </div>
      )}

      {/* Chat Modal */}
      <ChatModal row={selectedRow} onClose={() => setSelectedRow(null)} />
    </div>
  );
};
export default Chathistory