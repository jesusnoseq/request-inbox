import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { type Mock, type MockedFunction, vi } from 'vitest';

import { getInbox, updateInbox } from '../services/inbox';
import { type Inbox } from '../types/inbox';
import { INBOX_UPDATED_EVENT } from '../utils/inboxEvents';
import PageWebMCPTools from './PageWebMCPTools';

vi.mock('../services/inbox', () => ({
  getInbox: vi.fn(),
  updateInbox: vi.fn(),
}));

const mockGetInbox = getInbox as MockedFunction<typeof getInbox>;
const mockUpdateInbox = updateInbox as MockedFunction<typeof updateInbox>;

type RegisteredTool = {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
  annotations: Record<string, unknown>;
  execute: (input: Record<string, unknown>) => Promise<Record<string, unknown>>;
};

const anInbox = (overrides: Partial<Inbox> = {}): Inbox => ({
  ID: 'inbox-1',
  Name: 'New Inbox',
  Timestamp: 1,
  Response: {
    Code: 200,
    CodeTemplate: '',
    Body: 'original body',
    Headers: { 'content-type': 'text/plain' },
    IsDynamic: false,
  },
  Requests: [{ ID: 1 }] as Inbox['Requests'],
  ObfuscateHeaderFields: ['authorization'],
  IsPrivate: false,
  OwnerID: 'user-1',
  Callbacks: [],
  ...overrides,
});

const setModelContext = (registerTool?: Mock) => {
  Object.defineProperty(document, 'modelContext', {
    configurable: true,
    value: registerTool ? { registerTool } : undefined,
  });
};

const renderTools = (path: string) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <PageWebMCPTools />
    </MemoryRouter>
  );

afterEach(() => {
  vi.clearAllMocks();
  setModelContext();
});

test('registers the imperative inbox tools on a detail page', () => {
  const registerTool = vi.fn().mockResolvedValue(undefined);
  setModelContext(registerTool);

  renderTools('/docs');
  expect(registerTool).not.toHaveBeenCalled();

  const { unmount } = renderTools('/inbox/inbox-1');
  const names = registerTool.mock.calls.map((call) => (call[0] as RegisteredTool).name);
  const signals = registerTool.mock.calls.map((call) => call[1].signal as AbortSignal);

  expect(names).toEqual(['update_request_inbox', 'add_request_inbox_callback', 'get_request_inbox_requests']);
  expect(signals.every((signal) => !signal.aborted)).toBe(true);

  unmount();
  expect(signals.every((signal) => signal.aborted)).toBe(true);
});

test('updates every supported inbox field and describes the complete edit surface', async () => {
  const registerTool = vi.fn().mockResolvedValue(undefined);
  setModelContext(registerTool);
  const current = anInbox();
  const response = {
    Code: 201,
    CodeTemplate: '{{ if .Request.Body }}201{{ else }}204{{ end }}',
    Body: '{{ .Request.Body }}',
    Headers: { 'content-type': 'application/json' },
    IsDynamic: true,
  };
  const updatedInbox = anInbox({ Name: 'Webhook', IsPrivate: true, Response: response });
  const onInboxUpdated = vi.fn();
  window.addEventListener(INBOX_UPDATED_EVENT, onInboxUpdated);
  mockGetInbox.mockResolvedValue(current);
  mockUpdateInbox.mockResolvedValue(updatedInbox);

  renderTools('/inbox/inbox-1');
  const tool = registerTool.mock.calls
    .map((call) => call[0] as RegisteredTool)
    .find((candidate) => candidate.name === 'update_request_inbox')!;
  const result = await tool.execute({
    name: ' Webhook ',
    isPrivate: true,
    response: {
      code: response.Code,
      codeTemplate: response.CodeTemplate,
      body: response.Body,
      headers: response.Headers,
      isDynamic: response.IsDynamic,
    },
  });

  expect(tool.description).toContain('display name');
  expect(tool.description).toContain('visibility');
  expect(tool.description).toContain('status code');
  expect(tool.description).toContain('status-code template');
  expect(tool.description).toContain('body');
  expect(tool.description).toContain('header map');
  expect(tool.description).toContain('Go-template rendering');
  expect(mockUpdateInbox).toHaveBeenCalledWith({
    ...current,
    Name: 'Webhook',
    IsPrivate: true,
    Response: response,
  });
  expect(result).toEqual({
    inboxId: 'inbox-1',
    name: 'Webhook',
    isPrivate: true,
    response: {
      code: response.Code,
      codeTemplate: response.CodeTemplate,
      body: response.Body,
      headers: response.Headers,
      isDynamic: true,
    },
  });
  expect(onInboxUpdated).toHaveBeenCalledOnce();
  window.removeEventListener(INBOX_UPDATED_EVENT, onInboxUpdated);
});

test('adds a pass-forward callback from the documented dynamic template', async () => {
  const registerTool = vi.fn().mockResolvedValue(undefined);
  setModelContext(registerTool);
  const current = anInbox();
  const callback = {
    IsEnabled: true,
    IsDynamic: true,
    ToURL: 'https://receiver.example.com{{extractURI .Request.URI}}',
    Method: '{{.Request.Method}}',
    Headers: {},
    Body: '{{.Request.Body}}',
    IsForwardingHeaders: true,
  };
  const updatedInbox = anInbox({ Callbacks: [callback] });
  const onInboxUpdated = vi.fn();
  window.addEventListener(INBOX_UPDATED_EVENT, onInboxUpdated);
  mockGetInbox.mockResolvedValue(current);
  mockUpdateInbox.mockResolvedValue(updatedInbox);

  renderTools('/inbox/inbox-1');
  const tool = registerTool.mock.calls
    .map((call) => call[0] as RegisteredTool)
    .find((candidate) => candidate.name === 'add_request_inbox_callback')!;
  const result = await tool.execute({
    destinationUrl: ' https://receiver.example.com ',
    template: 'pass_forward',
  });

  expect(mockUpdateInbox).toHaveBeenCalledWith({ ...current, Callbacks: [callback] });
  expect(onInboxUpdated).toHaveBeenCalledOnce();
  expect((onInboxUpdated.mock.calls[0][0] as CustomEvent<Inbox>).detail).toEqual(updatedInbox);
  expect(result).toEqual({
    inboxId: 'inbox-1',
    callbackIndex: 0,
    callbackCount: 1,
    template: 'pass_forward',
    callback: {
      destinationUrl: callback.ToURL,
      method: callback.Method,
      headers: {},
      body: callback.Body,
      isEnabled: true,
      isDynamic: true,
      forwardHeaders: true,
    },
  });
  window.removeEventListener(INBOX_UPDATED_EVENT, onInboxUpdated);
});

test('lets custom fields override callback template defaults', async () => {
  const registerTool = vi.fn().mockResolvedValue(undefined);
  setModelContext(registerTool);
  const current = anInbox();
  const callback = {
    IsEnabled: false,
    IsDynamic: true,
    ToURL: 'https://hooks.example.com/slack',
    Method: 'PUT',
    Headers: { Authorization: 'Bearer {{.Inbox.ID}}' },
    Body: '{"text":"request {{.Index}}"}',
    IsForwardingHeaders: true,
  };
  mockGetInbox.mockResolvedValue(current);
  mockUpdateInbox.mockResolvedValue(anInbox({ Callbacks: [callback] }));

  renderTools('/inbox/inbox-1');
  const tool = registerTool.mock.calls
    .map((call) => call[0] as RegisteredTool)
    .find((candidate) => candidate.name === 'add_request_inbox_callback')!;
  await tool.execute({
    destinationUrl: 'https://hooks.example.com/slack',
    template: 'slack_webhook',
    method: 'PUT',
    headers: callback.Headers,
    body: callback.Body,
    isEnabled: false,
    forwardHeaders: true,
  });

  expect(mockUpdateInbox).toHaveBeenCalledWith({ ...current, Callbacks: [callback] });
});

test('rejects callback template actions when dynamic mode is disabled', async () => {
  const registerTool = vi.fn().mockResolvedValue(undefined);
  setModelContext(registerTool);
  renderTools('/inbox/inbox-1');
  const tool = registerTool.mock.calls
    .map((call) => call[0] as RegisteredTool)
    .find((candidate) => candidate.name === 'add_request_inbox_callback')!;

  await expect(tool.execute({
    destinationUrl: 'https://receiver.example.com/hook',
    body: '{{.Request.Body}}',
    isDynamic: false,
  })).rejects.toThrow('Set isDynamic to true');
  expect(mockGetInbox).not.toHaveBeenCalled();
  expect(mockUpdateInbox).not.toHaveBeenCalled();
});

test('returns the latest incoming request window in arrival order', async () => {
  const registerTool = vi.fn().mockResolvedValue(undefined);
  setModelContext(registerTool);
  const requests = [1, 2, 3].map((id) => ({
    ID: id,
    Timestamp: id * 100,
    URI: `/hooks/${id}`,
    Headers: { 'x-request-id': String(id) },
    Body: `body ${id}`,
    Host: 'request-inbox.test',
    RemoteAddr: '192.0.2.1',
    Protocol: 'HTTP/1.1',
    Method: 'POST',
    ContentLength: 6,
  }));
  mockGetInbox.mockResolvedValue(anInbox({ Requests: requests }));

  renderTools('/inbox/inbox-1');
  const tool = registerTool.mock.calls
    .map((call) => call[0] as RegisteredTool)
    .find((candidate) => candidate.name === 'get_request_inbox_requests')!;
  const result = await tool.execute({ requestLimit: 2 });

  expect(mockGetInbox).toHaveBeenCalledWith('inbox-1');
  expect(result).toMatchObject({
    inboxId: 'inbox-1',
    totalRequestCount: 3,
    matchingRequestCount: 3,
    returnedCount: 2,
    hasMore: false,
    nextAfterRequestId: 3,
    requests: [{ requestId: 2 }, { requestId: 3 }],
  });
});

test('uses the request cursor without skipping an older unprocessed arrival', async () => {
  const registerTool = vi.fn().mockResolvedValue(undefined);
  setModelContext(registerTool);
  const requests = [1, 2, 3].map((id) => ({
    ID: id,
    Timestamp: id,
    URI: '/',
    Headers: {},
    Body: '',
    Host: 'request-inbox.test',
    RemoteAddr: '192.0.2.1',
    Protocol: 'HTTP/1.1',
    Method: 'GET',
    ContentLength: 0,
  }));
  mockGetInbox.mockResolvedValue(anInbox({ Requests: requests }));

  renderTools('/inbox/inbox-1');
  const tool = registerTool.mock.calls
    .map((call) => call[0] as RegisteredTool)
    .find((candidate) => candidate.name === 'get_request_inbox_requests')!;
  const result = await tool.execute({ requestLimit: 1, afterRequestId: 1 });

  expect(result).toMatchObject({
    matchingRequestCount: 2,
    returnedCount: 1,
    hasMore: true,
    nextAfterRequestId: 2,
    requests: [{ requestId: 2 }],
  });
});
