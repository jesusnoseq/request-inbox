import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import InboxListPage from './pages/InboxListPage';
import InboxDetailPage from './pages/InboxDetailPage';
import AboutPage from './pages/AboutPage';
import APIDocPage from './pages/APIDocPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<InboxListPage />} />
        <Route path="/inbox" element={<InboxListPage />} />
        <Route path="/api-doc" element={<APIDocPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/inbox/:inboxId" element={<InboxDetailPage />} />
      </Routes>
    </Router>
  );
}

export default App;