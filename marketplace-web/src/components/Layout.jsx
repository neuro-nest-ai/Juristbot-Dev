import { Box, Button } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AddIcon from '@mui/icons-material/Add';
import GavelIcon from '@mui/icons-material/Gavel';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import HistoryIcon from '@mui/icons-material/History';
import WorkOutlineIcon from '@mui/icons-material/WorkOutline';
import CloseIcon from '@mui/icons-material/Close';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchOpen, setSearchOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [query, setQuery] = useState('');

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const handleSearch = (event) => {
    event.preventDefault();
    const value = query.trim().toLowerCase();
    if (value.includes('assignment') || value.includes('order') || value.includes('track')) {
      navigate('/marketplace/assignments');
    } else if (value.includes('request') || value.includes('draft')) {
      navigate('/marketplace/requests');
    } else if (value) {
      navigate('/marketplace');
    }
    setSearchOpen(false);
  };

  return (
    <Box className="app-shell">
      <aside className="sidebar">
        <div className="brand-mark" aria-label="JuristBot"><svg className="brand-robot" viewBox="0 0 32 32" aria-hidden="true"><circle cx="16" cy="17" r="13" fill="#444"/><path d="M16 4v5" stroke="#FFB000" strokeWidth="1.5" strokeLinecap="round"/><circle cx="16" cy="3.5" r="2" fill="#FFB000"/><rect x="6" y="11" width="20" height="10" rx="5" fill="#FFB817"/><rect x="9" y="13" width="14" height="6" rx="3" fill="#202020"/><circle cx="13" cy="16" r="1.2" fill="#FFB000"/><circle cx="19" cy="16" r="1.2" fill="#FFB000"/><path d="M12 22h8l-4 3-4-3Z" fill="#FFF"/></svg><span className="brand-wordmark">JURIST <strong>BOT</strong></span></div>
        <div className="sidebar-tools">
          <Button className="new-chat" onClick={() => navigate('/marketplace')}>
            <span>New Chat</span><EditOutlinedIcon fontSize="small" />
          </Button>
          <button className="sidebar-search" aria-label="Search"><SearchIcon fontSize="small" /></button>
        </div>
        <nav className="side-nav">
          <div className="nav-heading"><GavelIcon fontSize="small" /> AI Tools</div>
          <div className="nav-heading nav-heading-open"><DescriptionOutlinedIcon fontSize="small" /> E-Court <ExpandMoreIcon fontSize="small" /></div>
          <div className="nav-child">E-Courts Home</div>
          <div className="nav-child">Case Search</div>
          <div className="nav-child">Cause List</div>
          <div className="nav-child">Bulk Refresh</div>
          <div className="nav-child">Legal Check</div>
          <div className="nav-heading nav-active"><WorkOutlineIcon fontSize="small" /> Legal Marketplace <ExpandMoreIcon fontSize="small" /></div>
          {user?.role === 'advocate' ? <button className="nav-child nav-child-active" onClick={() => navigate('/marketplace')}><AddIcon fontSize="inherit" /> Browse Requests</button> : <button className="nav-child nav-child-active" onClick={() => navigate('/marketplace/requests/new')}><AddIcon fontSize="inherit" /> Need A Legal Draft</button>}
          <button className="nav-child" onClick={() => navigate('/marketplace/assignments')}><HistoryIcon fontSize="inherit" /> My Assignments</button>
          <div className="nav-heading"><GavelIcon fontSize="small" /> Citation</div>
        </nav>
        <div className="sidebar-user">
          <div className="avatar">{user?.name?.charAt(0)?.toUpperCase() || 'U'}</div>
          <div><strong>{user?.name || 'User'}</strong><small>{user?.role || 'Client'}</small></div>
          <button onClick={handleLogout} aria-label="Logout">↗</button>
        </div>
      </aside>
      <main className="main-area">
        <header className="topbar">
          <div className="breadcrumbs">Dashboard <span>/</span> Legal Marketplace</div>
          <div className="top-actions">
            <button aria-label="Search" className={searchOpen ? 'top-action-active' : ''} onClick={() => { setSearchOpen(!searchOpen); setNotificationsOpen(false); }}><SearchIcon fontSize="small" /></button>
            <button aria-label="Notifications" className={notificationsOpen ? 'top-action-active' : ''} onClick={() => { setNotificationsOpen(!notificationsOpen); setSearchOpen(false); }}><NotificationsNoneIcon fontSize="small" /></button>
            {searchOpen && <form className="top-search-panel" onSubmit={handleSearch}><SearchIcon fontSize="small" /><input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search marketplace" aria-label="Search marketplace" /><button type="button" aria-label="Close search" onClick={() => setSearchOpen(false)}><CloseIcon fontSize="small" /></button></form>}
            {notificationsOpen && <div className="notification-panel"><div className="notification-panel-head"><strong>Notifications</strong><button onClick={() => setNotificationsOpen(false)} aria-label="Close notifications"><CloseIcon fontSize="small" /></button></div><div className="notification-item"><span className="notification-dot" /><div><strong>Marketplace updates</strong><p>Track your legal drafting requests and advocate quotes here.</p><small>Just now</small></div></div><div className="notification-item"><span className="notification-dot muted" /><div><strong>Secure payments</strong><p>Your payment and order milestones are protected.</p><small>Today</small></div></div></div>}
          </div>
        </header>
        <div className="content-area">{children}</div>
      </main>
    </Box>
  );
}
