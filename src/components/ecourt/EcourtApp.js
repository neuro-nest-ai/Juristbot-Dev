import React from 'react';
import { Routes, Route } from 'react-router-dom';
import './ecourt.css';
import EcourtHome from './EcourtHome';
import CaseSearch from './CaseSearch';
import CaseDetail from './CaseDetail';
import OrderViewer from './OrderViewer';
import CauseList from './CauseList';
import BulkRefresh from './BulkRefresh';
import LegalCheck from './LegalCheck';
import { Empty } from './EcourtUi';


export default function EcourtApp() {
  return (
    <div className="ecourt-app">
      <div className="ec-page">
        <Routes>
          <Route index element={<EcourtHome />} />
          <Route path="search" element={<CaseSearch />} />
          <Route path="case/:cnr" element={<CaseDetail />} />
          <Route path="case/:cnr/order/:file" element={<OrderViewer />} />
          <Route path="causelist" element={<CauseList />} />
          <Route path="refresh" element={<BulkRefresh />} />
          <Route path="legal-check" element={<LegalCheck />} />
          <Route path="*" element={<Empty>This eCourts page does not exist.</Empty>} />
        </Routes>
      </div>
    </div>
  );
}