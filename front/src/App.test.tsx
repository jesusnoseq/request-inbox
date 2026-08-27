import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

jest.mock('./context/UserContext', () => ({
  useUser: () => ({
    user: null,
    logout: jest.fn(),
    isLoggedIn: () => false,
  }),
}));

jest.mock('./context/ErrorContext', () => ({
  useError: () => ({
    error: null,
    setError: jest.fn(),
    clearError: jest.fn(),
  }),
}));

test('renders the landing page', () => {
  render(<App />);
  expect(screen.getByRole('heading', { name: /test callbacks and webhooks with ease/i })).toBeInTheDocument();
});
