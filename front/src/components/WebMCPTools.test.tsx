import { act, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import { buildInboxURL, getInbox, newInbox } from '../services/inbox';
import { type Inbox } from '../types/inbox';
import WebMCPTools from './WebMCPTools';

jest.mock('../services/inbox', () => ({
  buildInboxURL: jest.fn(),
  getInbox: jest.fn(),
  newInbox: jest.fn(),
}));

const mockBuildInboxURL = buildInboxURL as jest.MockedFunction<typeof buildInboxURL>;
const mockGetInbox = getInbox as jest.MockedFunction<typeof getInbox>;
const mockNewInbox = newInbox as jest.MockedFunction<typeof newInbox>;

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

const setModelContext = (registerTool?: jest.Mock) => {
  Object.defineProperty(document, 'modelContext', {
    configurable: true,
    value: registerTool ? { registerTool } : undefined,
  });
};

const renderTools = () =>
  render(
    <MemoryRouter initialEntries={['/']}>
      <WebMCPTools />
      <Routes>
        <Route path="/" element={<span>home page</span>} />
        <Route path="/inbox/:inboxId" element={<span>inbox detail page</span>} />
      </Routes>
    </MemoryRouter>
  );

const registeredTool = (registerTool: jest.Mock, name: string) =>
  registerTool.mock.calls.map((call) => call[0] as WebMCPTool).find((tool) => tool.name === name)!;

afterEach(() => {
  jest.clearAllMocks();
  setModelContext();
});

test('does nothing when WebMCP is unavailable', () => {
  setModelContext();

  expect(() => renderTools()).not.toThrow();
});

test('registers the inbox tools and unregisters them on cleanup', () => {
  const registerTool = jest.fn().mockResolvedValue(undefined);
  setModelContext(registerTool);

  const { unmount } = renderTools();

  expect(registerTool.mock.calls.map((call) => call[0].name)).toEqual([
    'create_request_inbox',
    'open_request_inbox',
  ]);
  expect(registeredTool(registerTool, 'create_request_inbox')).toMatchObject({
    inputSchema: {
      type: 'object',
      properties: {},
      additionalProperties: false,
    },
    annotations: { readOnlyHint: false },
  });
  expect(registeredTool(registerTool, 'open_request_inbox')).toMatchObject({
    inputSchema: {
      type: 'object',
      properties: { inboxId: { type: 'string' } },
      required: ['inboxId'],
      additionalProperties: false,
    },
  });

  const registrationSignals = registerTool.mock.calls.map((call) => call[1].signal as AbortSignal);
  expect(registrationSignals.every((signal) => signal.aborted)).toBe(false);

  unmount();

  expect(registrationSignals.every((signal) => signal.aborted)).toBe(true);
});

test('creates an inbox and returns URLs and the anonymous access warning', async () => {
  const registerTool = jest.fn().mockResolvedValue(undefined);
  setModelContext(registerTool);
  mockBuildInboxURL.mockReturnValue('https://api.example.test/api/v1/inboxes/inbox-1/in');
  mockNewInbox.mockResolvedValue(anInbox());

  renderTools();
  const tool = registeredTool(registerTool, 'create_request_inbox');
  const executionController = new AbortController();
  const result = await tool.execute({}, { signal: executionController.signal });

  expect(mockNewInbox).toHaveBeenCalledWith(executionController.signal);
  expect(result).toEqual({
    inboxId: 'inbox-1',
    name: 'New Inbox',
    captureUrl: 'https://api.example.test/api/v1/inboxes/inbox-1/in',
    detailUrl: 'http://localhost/inbox/inbox-1',
    isPrivate: false,
    warning: 'This inbox is anonymous and can be accessed or modified by anyone with its ID.',
  });
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
  const executionController = new AbortController();
  let result: WebMCPToolResult | undefined;
  await act(async () => {
    result = await tool.execute({ inboxId: ' inbox-1 ' }, { signal: executionController.signal });
  });

  expect(mockGetInbox).toHaveBeenCalledWith('inbox-1', executionController.signal);
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

  await expect(tool.execute({ inboxId: '  ' }, { signal: new AbortController().signal })).rejects.toThrow(
    'inboxId is required'
  );
  expect(mockGetInbox).not.toHaveBeenCalled();
  expect(screen.getByText('home page')).toBeInTheDocument();
});
