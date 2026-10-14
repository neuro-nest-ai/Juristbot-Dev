import React from 'react';
import { Routes, Route } from 'react-router-dom';
import '../ecourt/ecourt.css';
import './citations.css';
import CitationSearch from './CitationSearch';
import CitationDoc from './CitationDoc';
import { Empty } from '../ecourt/EcourtUi';


export default function CitationsApp() {
  return (
    <div className="ecourt-app">
      <div className="ec-page">
        <Routes>
          <Route index element={<CitationSearch />} />
          <Route path="doc/:tid" element={<CitationDoc />} />
          <Route path="*" element={<Empty>This page does not exist.</Empty>} />
        </Routes>
      </div>
    </div>
  );
}