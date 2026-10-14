import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBookOpen } from '@fortawesome/free-solid-svg-icons';
import '../ecourt/ecourt.css';
import { PageHeader } from '../ecourt/EcourtUi';

/**
 * Citations page. Mounted in App.js:
 *   <Route path="/citations" element={<PrivateRoute><Citations /></PrivateRoute>} />
 * Sidebar: Navbar.js → EXTRA_MODULES.
 */
export default function Citations() {
  return (
    <div className="ecourt-app">
      <div className="ec-page">
        <PageHeader title="Citations" subtitle="Find and verify case law citations." />
        <div className="ec-empty">
          <span className="ec-tool-icon tone-blue mb-2"><FontAwesomeIcon icon={faBookOpen} /></span>
          <div className="fw-semibold ec-strong">Citations</div>
          <div>Your citations content goes here.</div>
        </div>
      </div>
    </div>
  );
}