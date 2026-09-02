import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import App from './App';
import * as inboxService from './services/inbox';
import { type Inbox } from './types/inbox';

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

afterEach(() => {
  jest.restoreAllMocks();
});

test('renders the landing page', () => {
  render(<App />);
  expect(
    screen.getByRole('heading', { level: 1, name: /debug any webhook without deploying anything/i })
  ).toBeInTheDocument();
});

test('leads with a single primary call to action', () => {
  render(<App />);
  expect(screen.getAllByRole('button', { name: /create new inbox/i }).length).toBeGreaterThan(0);
});

test('exposes the primary create action as a declarative WebMCP tool', () => {
  render(<App />);
  const form = screen.getByRole('form', { name: /create request inbox/i });

  expect(form).toHaveAttribute('toolname', 'create_request_inbox');
  expect(form).toHaveAttribute('tooltitle', 'Create Request Inbox');
  expect(form).toHaveAttribute(
    'tooldescription',
    'Create an HTTP request inbox for webhook testing. If the user is not signed in, the inbox is public and ownerless.'
  );
  expect(form).toHaveAttribute('toolautosubmit');
});

test('returns the created inbox from an agent-invoked home page action', async () => {
  const inbox: Inbox = {
    ID: 'inbox-1',
    Name: 'New Inbox',
    Timestamp: 1,
    Response: { Code: 200, CodeTemplate: 'OK', Body: '', Headers: {}, IsDynamic: false },
    Requests: [],
    ObfuscateHeaderFields: [],
    IsPrivate: false,
    OwnerID: '',
    Callbacks: [],
  };
  jest.spyOn(inboxService, 'newInbox').mockResolvedValue(inbox);
  jest.spyOn(inboxService, 'getInbox').mockResolvedValue(inbox);
  jest.spyOn(inboxService, 'buildInboxURL').mockReturnValue('https://api.example.test/inboxes/inbox-1/in');
  render(<App />);

  const form = screen.getByRole('form', { name: /create request inbox/i });
  let response: Promise<unknown> | undefined;
  const submitEvent = new Event('submit', { bubbles: true, cancelable: true }) as SubmitEvent;
  Object.defineProperties(submitEvent, {
    agentInvoked: { value: true },
    respondWith: { value: jest.fn((value: Promise<unknown>) => { response = value; }) },
  });

  fireEvent(form, submitEvent);
  await waitFor(() =>
    expect(response).resolves.toEqual({
      inboxId: 'inbox-1',
      name: 'New Inbox',
      captureUrl: 'https://api.example.test/inboxes/inbox-1/in',
      detailUrl: 'http://localhost/inbox/inbox-1',
      isPrivate: false,
      warning: 'This inbox is anonymous and can be accessed or modified by anyone with its ID.',
    })
  );
});
