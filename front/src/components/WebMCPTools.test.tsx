import { act, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import { buildInboxURL, getInbox, getInboxList, newInbox } from '../services/inbox';
import { type Inbox, type InboxRequest } from '../types/inbox';
import WebMCPTools from './WebMCPTools';

let mockLoggedIn = false;

jest.mock('../context/UserContext', () => ({
  useUser: () => ({ isLoggedIn: () => mockLoggedIn }),
}));

jest.mock('../services/inbox', () => ({
  buildInboxURL: jest.fn(),
  getInbox: jest.fn(),
  getInboxList: jest.fn(),
  newInbox: jest.fn(),
}));

const mockBuildInboxURL = buildInboxURL as jest.MockedFunction<typeof buildInboxURL>;
const mockGetInbox = getInbox as jest.MockedFunction<typeof getInbox>;
const mockGetInboxList = getInboxList as jest.MockedFunction<typeof getInboxList>;
const mockNewInbox = newInbox as jest.MockedFunction<typeof newInbox>;

/** Descriptor the hook hands to `document.modelContext.registerTool`. */
type RegisteredTool = {
  name: string;
  title: string;
  description: string;
  inputSchema: Record<string, unknown>;
  outputSchema: Record<string, unknown>;
  annotations?: Record<string, unknown>;
  execute: (input: Record<string, unknown>) => Promise<Record<string, unknown>>;
};

const anInbox = (overrides: Partial<Inbox> = {}): Inbox => ({
  ID: 'inbox-1',
  Name: 'New Inbox',
  Timestamp: 1,
  Response: {
    Code: 200,
    CodeTemplate: 'OK',
    Body: '',
    Headers: {},
    IsDynamic: false,
  },
  Requests: [],
  ObfuscateHeaderFields: [],
  IsPrivate: false,
  OwnerID: '',
  Callbacks: [],
  ...overrides,
});

const aRequest = (id: number, overrides: Partial<InboxRequest> = {}): InboxRequest => ({
  ID: id,
  Timestamp: id,
  URI: `/hooks/${id}`,
  Headers: { 'content-type': 'application/json' },
  Body: `{"request":${id}}`,
  Host: 'request-inbox.test',
  RemoteAddr: '192.0.2.1',
  Protocol: 'HTTP/1.1',
  Method: 'POST',
  ContentLength: 13,
  ...overrides,
});

const setModelContext = (registerTool?: jest.Mock) => {
  Object.defineProperty(document, 'modelContext', {
    configurable: true,
    value: registerTool ? { registerTool } : undefined,
  });
};

const renderTools = (initialEntry = '/') =>
  render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <WebMCPTools />
      <Routes>
        <Route path="/" element={<span>home page</span>} />
        <Route path="/inbox" element={<span>inbox list page</span>} />
        <Route path="/inbox/:inboxId" element={<span>inbox detail page</span>} />
        <Route path="/api-docs" element={<span>api documentation page</span>} />
        <Route path="/docs" element={<span>user documentation page</span>} />
      </Routes>
    </MemoryRouter>
  );

const registeredTool = (registerTool: jest.Mock, name: string) =>
  registerTool.mock.calls.map((call) => call[0] as RegisteredTool).find((tool) => tool.name === name)!;

afterEach(() => {
  mockLoggedIn = false;
  jest.clearAllMocks();
  setModelContext();
});

test('does nothing when WebMCP is unavailable', () => {
  setModelContext();

  expect(() => renderTools()).not.toThrow();
});

test('registers global tools but not authenticated tools while logged out', () => {
  const registerTool = jest.fn().mockResolvedValue(undefined);
  setModelContext(registerTool);

  const { unmount } = renderTools();

  expect(registerTool.mock.calls.map((call) => call[0].name)).toEqual([
    'open_request_inbox',
    'open_api_documentation',
    'open_user_documentation',
  ]);
  expect(registeredTool(registerTool, 'open_request_inbox')).toMatchObject({
    title: 'Open Request Inbox',
    inputSchema: {
      type: 'object',
      properties: { inboxId: { type: 'string' } },
      required: ['inboxId'],
      additionalProperties: false,
    },
    outputSchema: { required: expect.arrayContaining(['requestCount']) },
    annotations: { untrustedContentHint: true },
  });

  const registrationSignals = registerTool.mock.calls.map((call) => call[1].signal as AbortSignal);
  expect(registrationSignals.every((signal) => signal.aborted)).toBe(false);

  unmount();

  expect(registrationSignals.every((signal) => signal.aborted)).toBe(true);
});

test('lists and searches inboxes only while logged in', async () => {
  mockLoggedIn = true;
  const registerTool = jest.fn().mockResolvedValue(undefined);
  setModelContext(registerTool);
  mockBuildInboxURL.mockImplementation((id) => `https://api.example.test/inboxes/${id}/in`);
  mockGetInboxList.mockResolvedValue([
    anInbox({ ID: 'stripe-1', Name: 'Stripe webhooks', OwnerID: 'user-1', IsPrivate: true }),
    anInbox({ ID: 'github-1', Name: 'GitHub webhooks', OwnerID: 'user-1', IsPrivate: true }),
  ]);

  renderTools();

  expect(registerTool.mock.calls.map((call) => call[0].name)).toEqual([
    'create_request_inbox',
    'open_request_inbox',
    'list_request_inboxes',
    'search_request_inboxes',
    'inspect_request_inbox',
    'open_api_documentation',
    'open_user_documentation',
  ]);

  await expect(registeredTool(registerTool, 'list_request_inboxes').execute({})).resolves.toMatchObject({
    count: 2,
    inboxes: [{ inboxId: 'stripe-1' }, { inboxId: 'github-1' }],
  });
  await expect(
    registeredTool(registerTool, 'search_request_inboxes').execute({ query: ' github ' })
  ).resolves.toMatchObject({ count: 1, inboxes: [{ inboxId: 'github-1' }] });
});

test('inspects only the requested number of newest inbox requests', async () => {
  mockLoggedIn = true;
  const registerTool = jest.fn().mockResolvedValue(undefined);
  setModelContext(registerTool);
  mockBuildInboxURL.mockReturnValue('https://api.example.test/inboxes/inbox-1/in');
  mockGetInbox.mockResolvedValue(
    anInbox({
      OwnerID: 'user-1',
      IsPrivate: true,
      Requests: [aRequest(1), aRequest(2), aRequest(3)],
    })
  );

  renderTools();
  const result = await registeredTool(registerTool, 'inspect_request_inbox').execute({
    inboxId: ' inbox-1 ',
    requestLimit: 2,
  });

  expect(mockGetInbox).toHaveBeenCalledWith('inbox-1');
  expect(result).toMatchObject({
    inboxId: 'inbox-1',
    requestCount: 3,
    requests: [{ requestId: 3 }, { requestId: 2 }],
  });
});

test('opens the API and user documentation pages', async () => {
  const registerTool = jest.fn().mockResolvedValue(undefined);
  setModelContext(registerTool);

  renderTools();

  await act(async () => {
    await registeredTool(registerTool, 'open_api_documentation').execute({});
  });
  expect(screen.getByText('api documentation page')).toBeInTheDocument();

  await act(async () => {
    await registeredTool(registerTool, 'open_user_documentation').execute({});
  });
  expect(screen.getByText('user documentation page')).toBeInTheDocument();
});

test('creates an inbox and returns URLs and the anonymous access warning', async () => {
  const registerTool = jest.fn().mockResolvedValue(undefined);
  setModelContext(registerTool);
  mockBuildInboxURL.mockReturnValue('https://api.example.test/api/v1/inboxes/inbox-1/in');
  mockNewInbox.mockResolvedValue(anInbox());

  renderTools('/inbox');
  const tool = registeredTool(registerTool, 'create_request_inbox');
  const result = await tool.execute({});

  expect(result).toEqual({
    inboxId: 'inbox-1',
    name: 'New Inbox',
    captureUrl: 'https://api.example.test/api/v1/inboxes/inbox-1/in',
    detailUrl: 'http://localhost/inbox/inbox-1',
    isPrivate: false,
    warning: 'This inbox is anonymous and can be accessed or modified by anyone with its ID.',
  });

  expect(mockNewInbox).toHaveBeenCalledWith();
});

test('navigates to the inbox detail page and returns its details', async () => {
  const registerTool = jest.fn().mockResolvedValue(undefined);
  setModelContext(registerTool);
  mockBuildInboxURL.mockReturnValue('https://api.example.test/api/v1/inboxes/inbox-1/in');
  mockGetInbox.mockResolvedValue(
    anInbox({
      Name: 'Stripe webhooks',
      IsPrivate: true,
      OwnerID: 'user-1',
      Requests: [{ ID: 1 }, { ID: 2 }] as Inbox['Requests'],
    })
  );

  renderTools();
  expect(screen.getByText('home page')).toBeInTheDocument();

  const tool = registeredTool(registerTool, 'open_request_inbox');
  let result: Record<string, unknown> | undefined;
  await act(async () => {
    result = await tool.execute({ inboxId: ' inbox-1 ' });
  });

  expect(mockGetInbox).toHaveBeenCalledWith('inbox-1');
  expect(result).toEqual({
    inboxId: 'inbox-1',
    name: 'Stripe webhooks',
    captureUrl: 'https://api.example.test/api/v1/inboxes/inbox-1/in',
    detailUrl: 'http://localhost/inbox/inbox-1',
    isPrivate: true,
    requestCount: 2,
  });
  expect(screen.getByText('inbox detail page')).toBeInTheDocument();
});

test('rejects an empty inbox id without navigating', async () => {
  const registerTool = jest.fn().mockResolvedValue(undefined);
  setModelContext(registerTool);

  renderTools();
  const tool = registeredTool(registerTool, 'open_request_inbox');

  await expect(tool.execute({ inboxId: '  ' })).rejects.toThrow('inboxId is required');
  expect(mockGetInbox).not.toHaveBeenCalled();
  expect(screen.getByText('home page')).toBeInTheDocument();
});
