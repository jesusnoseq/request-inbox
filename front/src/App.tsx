import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Container from '@mui/material/Container';

import LandingPage from './pages/LandingPage';
import AboutPage from './pages/AboutPage';
import InboxListPage from './pages/InboxListPage';
import InboxDetailPage from './pages/InboxDetailPage';
import APIDocPage from './pages/APIDocPage';
import HealthPage from './pages/HealthPage';
import UsersManualPage from './pages/UsersManualPage';
import UserProfilePage from './pages/UserProfilePage';
import CookiePolicyPage from './pages/legal/CookiePolicyPage';
import PrivacyPolicyPage from './pages/legal/PrivacyPolicyPage';
import TermsOfServicePage from './pages/legal/TermsOfServicePage';

import ScrollConsistencyLayout from './components/ScrollConsistencyLayout';
import Header from './components/Header';
import Footer from './components/Footer';
import CookieBanner from './components/legal/CookieBanner';
import PageTracker from './components/PageTracker';
import { useUser } from './context/UserContext';



function App() {
  const { isLoggedIn } = useUser();

  return (
    <ScrollConsistencyLayout>
      <Router>
        <PageTracker />
        <Container>
          <Header />
          <Routes>
            {isLoggedIn() ? (
              <Route path="/" element={<InboxListPage />} />
            ) : (
              <Route path="/" element={<LandingPage />} />
            )}
            <Route path="/inbox" element={<InboxListPage />} />
            <Route path="/api-docs" element={<APIDocPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/users-manual" element={<UsersManualPage />} />
            <Route path="/docs" element={<UsersManualPage />} />
            <Route path="/inbox/:inboxId" element={<InboxDetailPage />} />
            <Route path="/profile" element={<UserProfilePage />} />
            <Route path="/health" element={<HealthPage />} />
            <Route path="/home" element={<LandingPage />} />
            <Route path="/cookies" element={<CookiePolicyPage />} />
            <Route path="/privacy" element={<PrivacyPolicyPage />} />
            <Route path="/terms" element={<TermsOfServicePage />} />
          </Routes>
          <CookieBanner />
          <Footer />
        </Container>
      </Router>
    </ScrollConsistencyLayout>
  );
}

export default App;