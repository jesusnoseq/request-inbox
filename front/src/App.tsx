import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Container from '@mui/material/Container';

import AboutPage from './pages/AboutPage';
import InboxListPage from './pages/InboxListPage';
import InboxDetailPage from './pages/InboxDetailPage';
import APIDocPage from './pages/APIDocPage';
import HealthPage from './pages/HealthPage';
import UsersManualPage from './pages/UsersManualPage';
import UserProfilePage from './pages/UserProfilePage';
import ScrollConsistencyLayout from './components/ScrollConsistencyLayout';
import Header from './components/Header';
import Footer from './components/Footer';
import CookieBanner from './components/CookieBanner';

function App() {
  return (
    <ScrollConsistencyLayout>
      <Router>
        <Container>
          <Header />
          <Routes>
            <Route path="/" element={<InboxListPage />} />
            <Route path="/inbox" element={<InboxListPage />} />
            <Route path="/api-doc" element={<APIDocPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/users-manual" element={<UsersManualPage />} />
            <Route path="/inbox/:inboxId" element={<InboxDetailPage />} />
            <Route path="/profile" element={<UserProfilePage />} />
            <Route path="/health" element={<HealthPage />} />
          </Routes>
          <CookieBanner />
          <Footer />
        </Container>
      </Router>
    </ScrollConsistencyLayout>
  );
}

export default App;