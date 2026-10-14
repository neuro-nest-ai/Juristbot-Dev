import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStore } from '@fortawesome/free-solid-svg-icons';
import '../ecourt/ecourt.css';
import { PageHeader } from '../ecourt/EcourtUi';

/**
 * Marketplace page. Mounted in App.js:
 *   <Route path="/marketplace" element={<PrivateRoute><Marketplace /></PrivateRoute>} />
 * Sidebar: Navbar.js → EXTRA_MODULES.
 */
export default function Marketplace() {
  return (
    <div className="ecourt-app">
      <div className="ec-page">
        <PageHeader title="Marketplace" subtitle="Legal services, templates and tools for your practice." />
        <div className="ec-empty">
          <span className="ec-tool-icon tone-yellow mb-2"><FontAwesomeIcon icon={faStore} /></span>
          <div className="fw-semibold ec-strong">Marketplace</div>
          <div>Your marketplace content goes here.</div>
        </div>
      </div>
    </div>
  );
}