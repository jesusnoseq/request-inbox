import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import InboxListPage from './pages/InboxListPage';
import InboxDetailPage from './pages/InboxDetailPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<InboxListPage />} />
        <Route path="/inbox/:inboxId" element={<InboxDetailPage />} />
      </Routes>
    </Router>
  );
}

export default App;