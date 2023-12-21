import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import InboxListPage from './pages/InboxListPage';
import InboxDetailPage from './pages/InboxDetailPage';
import AboutPage from './pages/AboutPage';
import APIDocPage from './pages/APIDocPage';
import SignInPage from './pages/SignInPage';
import SignUpPage from './pages/SignUpPage';
import SignUpConfirmationPage from './pages/SignUpConfirmationPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<InboxListPage />} />
        <Route path="/inbox" element={<InboxListPage />} />
        <Route path="/api-doc" element={<APIDocPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/sign-in" element={<SignInPage />} />
        <Route path="/sign-up" element={<SignUpPage />} />
        <Route path="/sign-up-confirmation" element={<SignUpConfirmationPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/inbox/:inboxId" element={<InboxDetailPage />} />
      </Routes>
    </Router>
  );
}

export default App;