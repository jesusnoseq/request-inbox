import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
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

const twoCallbacksRequest = () =>
  aRequest({
    CallbackResponses: [
      aCallbackResponse({ Body: 'first attempt' }),
      aCallbackResponse({ Body: 'second callback', Code: 0, Error: 'connection refused' }),
    ],
  });

const renderDetail = (request: InboxRequest = aRequest()) =>
  render(<RequestDetail request={request} inboxId="inbox-1" />);

const showCallbacks = async (user: ReturnType<typeof userEvent.setup>, count = 1) => {
  await user.click(screen.getByText(`Show callback results (${count})`));
};

/** The box of one callback, so the retry feedback can be checked where it belongs. */
const callbackBox = (position: number) => screen.getByRole('group', { name: `Callback ${position}` });

const retryButtonOf = (position: number) =>
  within(callbackBox(position)).getByRole('button', { name: /retry/i });

const invokeTool = (form: HTMLElement) => {
  let response: Promise<unknown> | undefined;
  const submitEvent = new Event('submit', { bubbles: true, cancelable: true }) as SubmitEvent;
  Object.defineProperties(submitEvent, {
    agentInvoked: { value: true },
    respondWith: { value: vi.fn((value: Promise<unknown>) => { response = value; }) },
  });
  fireEvent(form, submitEvent);
  return response;
};

afterEach(() => {
  vi.clearAllMocks();
});

test('exposes copying the captured request as a declarative WebMCP tool', async () => {
  const writeText = vi.fn().mockResolvedValue(undefined);
  Object.defineProperty(navigator, 'clipboard', {
    configurable: true,
    value: { writeText },
  });
  renderDetail();

  const form = screen.getByRole('form', { name: 'Copy request 4 as cURL' });
  expect(form).toHaveAttribute('toolname', 'copy_request_as_curl_3');
  expect(form).toHaveAttribute('tooltitle', 'Copy Request 4 as cURL');
  expect(form).toHaveAttribute('toolautosubmit');

  const response = invokeTool(form);
  await expect(response).resolves.toEqual({
    requestId: 3,
    curl: expect.stringContaining("curl -X POST 'http://localhost/inboxes/inbox-1/in/hook'"),
  });
  expect(writeText).toHaveBeenCalledWith(expect.stringContaining('curl -X POST'));
});

test('exposes callback retry as a declarative WebMCP tool', async () => {
  const user = userEvent.setup();
  const retried = aCallbackResponse({ Code: 202, Body: 'accepted' });
  mockRetryCallback.mockResolvedValue(retried);
  renderDetail();
  await showCallbacks(user);

  const form = screen.getByRole('form', { name: 'Retry callback 1 for request 4' });
  expect(form).toHaveAttribute('toolname', 'retry_callback_3_0');
  expect(form).toHaveAttribute('tooltitle', 'Retry Callback 1 for Request 4');
  expect(form).toHaveAttribute('toolautosubmit');

  const response = invokeTool(form);
  await expect(response).resolves.toEqual({ requestId: 3, callbackIndex: 0, response: retried });
  expect(mockRetryCallback).toHaveBeenCalledWith('inbox-1', 3, 0);
  expect(await screen.findByText('accepted')).toBeInTheDocument();
});

test('retries the callback of a request and shows the new response', async () => {
  const user = userEvent.setup();
  mockRetryCallback.mockResolvedValue(aCallbackResponse({ Code: 200, Body: 'retried body' }));

  renderDetail();
  await showCallbacks(user);
  expect(screen.getByText('first attempt')).toBeInTheDocument();

  await user.click(retryButtonOf(1));

  expect(await screen.findByText('retried body')).toBeInTheDocument();
  expect(mockRetryCallback).toHaveBeenCalledWith('inbox-1', 3, 0);
  expect(screen.queryByText('first attempt')).not.toBeInTheDocument();
  expect(within(callbackBox(1)).getByText(/the destination answered 200/)).toBeInTheDocument();
  // The summary chip follows the retried response and marks it as a retry.
  expect(screen.getByText('↻ POST 200')).toBeInTheDocument();
});

test('reports the outcome of a retry that reached the destination', async () => {
  const user = userEvent.setup();
  mockRetryCallback.mockResolvedValue(aCallbackResponse({ Code: 503, Body: 'still down' }));

  renderDetail();
  await showCallbacks(user);
  await user.click(retryButtonOf(1));

  expect(await within(callbackBox(1)).findByText(/Retried at .* · the destination answered 503/)).toBeInTheDocument();
});

test('reports a retry that got no response at all', async () => {
  const user = userEvent.setup();
  mockRetryCallback.mockResolvedValue(aCallbackResponse({ Code: 0, Body: '', Error: 'connection refused' }));

  renderDetail();
  await showCallbacks(user);
  await user.click(retryButtonOf(1));

  expect(await within(callbackBox(1)).findByText(/no response: connection refused/)).toBeInTheDocument();
});

test('counts the retries of the same callback', async () => {
  const user = userEvent.setup();
  mockRetryCallback.mockResolvedValue(aCallbackResponse({ Code: 200, Body: 'retried body' }));

  renderDetail();
  await showCallbacks(user);

  await user.click(retryButtonOf(1));
  expect(await within(callbackBox(1)).findByText(/Retried at/)).toBeInTheDocument();

  await user.click(retryButtonOf(1));

  expect(await within(callbackBox(1)).findByText(/· 2 retries ·/)).toBeInTheDocument();
});

test('shows the error when the retry fails and keeps the captured response', async () => {
  const user = userEvent.setup();
  mockRetryCallback.mockRejectedValue(new Error('callback is disabled'));

  renderDetail();
  await showCallbacks(user);

  await user.click(retryButtonOf(1));

  expect(await within(callbackBox(1)).findByText(/Could not be retried: callback is disabled/)).toBeInTheDocument();
  expect(screen.getByText('first attempt')).toBeInTheDocument();
});

test('has one retry button per callback response', async () => {
  const user = userEvent.setup();

  renderDetail(twoCallbacksRequest());
  await showCallbacks(user, 2);

  expect(screen.getAllByRole('button', { name: /retry/i })).toHaveLength(2);

  mockRetryCallback.mockResolvedValue(aCallbackResponse({ Code: 201, Body: 'second retried' }));
  await user.click(retryButtonOf(2));

  await waitFor(() => expect(mockRetryCallback).toHaveBeenCalledWith('inbox-1', 3, 1));
  expect(screen.getByText('first attempt')).toBeInTheDocument();
});

test('keeps the retry outcome inside the box of the retried callback', async () => {
  const user = userEvent.setup();
  mockRetryCallback.mockResolvedValue(aCallbackResponse({ Code: 201, Body: 'second retried' }));

  renderDetail(twoCallbacksRequest());
  await showCallbacks(user, 2);

  await user.click(retryButtonOf(2));

  expect(await within(callbackBox(2)).findByText(/the destination answered 201/)).toBeInTheDocument();
  expect(within(callbackBox(1)).queryByText(/Retried at/)).not.toBeInTheDocument();
});

test('keeps a failed retry inside the box of the retried callback', async () => {
  const user = userEvent.setup();
  mockRetryCallback.mockRejectedValue(new Error('callback is disabled'));

  renderDetail(twoCallbacksRequest());
  await showCallbacks(user, 2);

  await user.click(retryButtonOf(2));

  expect(await within(callbackBox(2)).findByText(/Could not be retried: callback is disabled/)).toBeInTheDocument();
  expect(within(callbackBox(1)).queryByText(/Could not be retried/)).not.toBeInTheDocument();

  // Dismissing it clears only that callback's error.
  await user.click(within(callbackBox(2)).getByRole('button', { name: /close/i }));
  await waitFor(() =>
    expect(within(callbackBox(2)).queryByText(/Could not be retried/)).not.toBeInTheDocument()
  );
});
