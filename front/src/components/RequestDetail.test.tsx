import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { type MockedFunction, vi } from 'vitest';

import { retryCallback } from '../services/inbox';
import { type CallbackResponse, type InboxRequest } from '../types/inbox';
import RequestDetail from './RequestDetail';

vi.mock('../services/inbox', () => ({
  retryCallback: vi.fn(),
}));

const mockRetryCallback = retryCallback as MockedFunction<typeof retryCallback>;

const aCallbackResponse = (overrides: Partial<CallbackResponse> = {}): CallbackResponse => ({
  URL: 'https://example.com/webhook',
  Method: 'POST',
  Error: '',
  Code: 500,
  CodeTemplate: '',
  Body: 'first attempt',
  Headers: {},
  ...overrides,
});

const aRequest = (overrides: Partial<InboxRequest> = {}): InboxRequest => ({
  ID: 3,
  Timestamp: 1700000000000,
  URI: '/inboxes/inbox-1/in/hook',
  Headers: { 'content-type': 'text/plain' },
  Body: 'request body',
  Host: 'localhost',
  RemoteAddr: '127.0.0.1',
  Protocol: 'HTTP/1.1',
  Method: 'POST',
  ContentLength: 12,
  CallbackResponses: [aCallbackResponse()],
  ...overrides,
});

const renderDetail = (request: InboxRequest = aRequest()) =>
  render(<RequestDetail request={request} inboxId="inbox-1" />);

const showCallbacks = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.click(screen.getByText('Show callback results (1)'));
};

afterEach(() => {
  vi.clearAllMocks();
});

test('retries the callback of a request and shows the new response', async () => {
  const user = userEvent.setup();
  mockRetryCallback.mockResolvedValue(aCallbackResponse({ Code: 200, Body: 'retried body' }));

  renderDetail();
  await showCallbacks(user);
  expect(screen.getByText('first attempt')).toBeInTheDocument();

  await user.click(screen.getByRole('button', { name: /retry/i }));

  expect(await screen.findByText('retried body')).toBeInTheDocument();
  expect(mockRetryCallback).toHaveBeenCalledWith('inbox-1', 3, 0);
  expect(screen.queryByText('first attempt')).not.toBeInTheDocument();
  expect(screen.getByText('Callback 1 · retried')).toBeInTheDocument();
  // The summary chip follows the retried response.
  expect(screen.getByText('POST 200')).toBeInTheDocument();
});

test('shows the error when the retry fails and keeps the captured response', async () => {
  const user = userEvent.setup();
  mockRetryCallback.mockRejectedValue(new Error('Failed to retry callback'));

  renderDetail();
  await showCallbacks(user);

  await user.click(screen.getByRole('button', { name: /retry/i }));

  expect(await screen.findByText('Failed to retry callback')).toBeInTheDocument();
  expect(screen.getByText('first attempt')).toBeInTheDocument();
});

test('has one retry button per callback response', async () => {
  const user = userEvent.setup();
  const request = aRequest({
    CallbackResponses: [
      aCallbackResponse({ Body: 'first attempt' }),
      aCallbackResponse({ Body: 'second callback', Error: 'connection refused' }),
    ],
  });

  renderDetail(request);
  await user.click(screen.getByText('Show callback results (2)'));

  expect(screen.getAllByRole('button', { name: /retry/i })).toHaveLength(2);

  mockRetryCallback.mockResolvedValue(aCallbackResponse({ Code: 201, Body: 'second retried' }));
  await user.click(screen.getAllByRole('button', { name: /retry/i })[1]);

  await waitFor(() => expect(mockRetryCallback).toHaveBeenCalledWith('inbox-1', 3, 1));
  expect(screen.getByText('first attempt')).toBeInTheDocument();
});
