import { useState } from 'react';
import { Alert, Box, Typography } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import TrackOrderTab from '../components/TrackOrderTab';
import AdvocateWorkspace from '../components/AdvocateWorkspace';
import { useNavigate } from 'react-router-dom';

export default function MarketplaceHome() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState(0);

  return (
    <Box>
      <div className="post-head">
        <div><h1 className="marketplace-title">Legal Marketplace</h1><p className="marketplace-subtitle">Connect with qualified advocates for legal drafting and professional services.</p></div>
        <div className="market-tabs">
          <button className={`market-tab ${tab === 0 ? 'market-tab-active' : ''}`} onClick={() => setTab(0)}>Need a Legal Draft</button>
          <button className={`market-tab ${tab === 1 ? 'market-tab-active' : ''}`} onClick={() => navigate('/marketplace/assignments')}>My Assignments</button>
          <button className={`market-tab ${tab === 2 ? 'market-tab-active' : ''}`} onClick={() => setTab(2)}>Workspace</button>
        </div>
      </div>

      {user?.role === 'advocate' ? (
        <AdvocateWorkspace />
      ) : tab === 1 ? <TrackOrderTab /> : tab === 2 ? <Alert severity="info">Your advocate workspace will show bids and active assignments here.</Alert> : <>
        <section className="hero-banner"><div className="hero-kicker">✦ VERIFIED ADVOCATE NETWORK</div><h1>Get Your Legal Document Drafted</h1><p>Post your drafting requirement, review advocate quotes, and choose the offer that best suits your needs.</p><svg className="hero-art" viewBox="0 0 187 187" role="img" aria-label="JuristBot advocate assistant"><circle cx="93.5" cy="94" r="76" fill="#F4F4F4"/><path d="M94 19v29" stroke="#FFB000" strokeWidth="5" strokeLinecap="round"/><circle cx="94" cy="18" r="10" fill="#FFB000"/><path d="M57 64c3-14 17-22 37-22s34 8 37 22" fill="#FFA900"/><rect x="24" y="64" width="139" height="52" rx="24" fill="#FFB817"/><rect x="45" y="74" width="97" height="32" rx="16" fill="#202020"/><circle cx="75" cy="90" r="6" fill="#FFB000"/><circle cx="112" cy="90" r="6" fill="#FFB000"/><path d="M84 98h18" stroke="#FFB000" strokeWidth="3" strokeLinecap="round"/><circle cx="26" cy="90" r="10" fill="#FFB000"/><circle cx="161" cy="90" r="10" fill="#FFB000"/><path d="M58 113c12 10 49 10 71 0-8 17-57 17-71 0Z" fill="#202020"/><path d="M70 119h48l-24 17-24-17Z" fill="#F4F4F4"/><path d="M65 121 42 165l30 5 22-44-29-5Z" fill="#171717"/><path d="m122 121 23 44-30 5-22-44 29-5Z" fill="#171717"/><path d="m94 136-8 8 8 7 8-7-8-8Z" fill="#FFB817"/></svg></section>
        <div className="home-grid">
           <div className="feature-card"><div className="feature-icon post-feature-icon"><svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true"><path d="M12.8346 2.75H5.5013C5.01507 2.75 4.54876 2.94315 4.20494 3.28697C3.86112 3.63079 3.66797 4.0971 3.66797 4.58333V17.4167C3.66797 17.9029 3.86112 18.3692 4.20494 18.713C4.54876 19.0568 5.01507 19.25 5.5013 19.25H16.5013C16.9875 19.25 17.4538 19.0568 17.7977 18.713C18.1415 18.3692 18.3346 17.9029 18.3346 17.4167V8.25L12.8346 2.75Z" stroke="#F5B400" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round"/><path d="M12.8333 2.75V8.25H18.3333M11 16.5V13.75M11 13.75V11M11 13.75H8.25M11 13.75H13.75" stroke="#F5B400" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round"/></svg></div><h3>Post a Legal Draft</h3><p>Tell us what you need drafted and receive quotes from advocates.</p><button className="yellow-btn" onClick={() => window.location.href = '/marketplace/requests/new'}>Post a Legal Draft</button></div>
           <div className="feature-card"><div className="feature-icon view-feature-icon"><svg width="48" height="48" viewBox="0 0 48 48" fill="none" aria-hidden="true"><rect width="48" height="48" rx="14" fill="#FFF6D6"/><path d="M14.832 23.9999C14.832 23.9999 18.0404 17.5833 23.9987 17.5833C29.957 17.5833 33.1654 23.9999 33.1654 23.9999C33.1654 23.9999 29.957 30.4166 23.9987 30.4166C18.0404 30.4166 14.832 23.9999 14.832 23.9999Z" stroke="#6E4E00" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round"/><path d="M26.75 24C26.75 25.5188 25.5188 26.75 24 26.75C22.4812 26.75 21.25 25.5188 21.25 24C21.25 22.4812 22.4812 21.25 24 21.25C25.5188 21.25 26.75 22.4812 26.75 24Z" stroke="#6E4E00" strokeWidth="1.65"/></svg></div><h3>View Draft Post</h3><p>See the list of draft requests you have posted.</p><button className="outline-btn" onClick={() => navigate('/marketplace/requests')}>View Draft Post</button></div>
        </div>
        <h2 className="section-title">How it works</h2>
        <div className="how-grid">
          <div className="how-card"><strong><span className="step-dot">1</span>Post your requirement</strong><p>Describe the document, deadline and budget.</p></div>
          <div className="how-card"><strong><span className="step-dot">2</span>Compare quotes</strong><p>Verified advocates respond with scope, timeline and fee.</p></div>
          <div className="how-card"><strong><span className="step-dot">3</span>Accept &amp; pay</strong><p>Pay securely via UPI, card or net banking.</p></div>
          <div className="how-card"><strong><span className="step-dot">4</span>Track delivery</strong><p>Follow every milestone in your workspace.</p></div>
        </div>
         <div className="trust-row"><span><svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M8.0013 2L13.3346 4V8C13.3346 11.3333 11.0013 13.3333 8.0013 14C5.0013 13.3333 2.66797 11.3333 2.66797 8V4L8.0013 2Z" stroke="#5F5D58" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/><path d="M6 8.00008L7.33333 9.33341L10 6.66675" stroke="#5F5D58" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>Bar Council-verified advocates</span><span><svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M4.0013 7.33325H12.0013C12.7377 7.33325 13.3346 7.93021 13.3346 8.66659V12.6666C13.3346 13.403 12.7377 13.9999 12.0013 13.9999H4.0013C3.26492 13.9999 2.66797 13.403 2.66797 12.6666V8.66659C2.66797 7.93021 3.26492 7.33325 4.0013 7.33325Z" stroke="#5F5D58" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/><path d="M5.33203 7.33333V4.66667C5.33203 3.95942 5.61298 3.28115 6.11308 2.78105C6.61318 2.28095 7.29145 2 7.9987 2C8.70594 2 9.38422 2.28095 9.88432 2.78105C10.3844 3.28115 10.6654 3.95942 10.6654 4.66667V7.33333" stroke="#5F5D58" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>Secure payments</span><span><svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M14 8C14 11.3137 11.3137 14 8 14C4.68629 14 2 11.3137 2 8C2 4.68629 4.68629 2 8 2C11.3137 2 14 4.68629 14 8Z" stroke="#5F5D58" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/><path d="M8 4.66675V8.00008L10 9.33342" stroke="#5F5D58" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>Milestone tracking</span></div>
      </>}
    </Box>
  );
}
