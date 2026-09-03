import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { type MockedFunction, vi } from 'vitest';

import { getInbox } from '../services/inbox';
import { type Inbox } from '../types/inbox';
import { notifyInboxUpdated } from '../utils/inboxEvents';
import InboxDetailPage from './InboxDetailPage';

vi.mock('../services/inbox', () => ({
  getInbox: vi.fn(),
  deleteInboxRequests: vi.fn(),
}));

vi.mock('../context/UserContext', () => ({
  useUser: () => ({ isLoggedIn: () => true }),
}));

vi.mock('../components/InboxDetail', () => ({
  default: ({ inbox }: { inbox: Inbox }) => <div data-testid="callback-count">{inbox.Callbacks.length}</div>,
}));

vi.mock('../components/RequestList', () => ({
  default: () => null,
}));

const mockGetInbox = getInbox as MockedFunction<typeof getInbox>;

const anInbox = (callbackCount = 0): Inbox => ({
  ID: 'inbox-1',
  Name: 'Inbox',
  Timestamp: 1,
  Response: { Code: 200, CodeTemplate: '', Body: '', Headers: {}, IsDynamic: false },
  Requests: [],
  ObfuscateHeaderFields: [],
  IsPrivate: false,
  OwnerID: 'user-1',
  Callbacks: Array.from({ length: callbackCount }, () => ({
    IsEnabled: true,
    IsDynamic: false,
    ToURL: 'https://example.com/webhook',
    Method: 'POST',
    Headers: {},
    Body: '',
    IsForwardingHeaders: false,
  })),
});

afterEach(() => {
  vi.clearAllMocks();
});

test('updates the open inbox when a WebMCP operation publishes its saved state', async () => {
  mockGetInbox.mockResolvedValue(anInbox());
  render(
    <MemoryRouter initialEntries={['/inbox/inbox-1']}>
      <Routes>
        <Route path="/inbox/:inboxId" element={<InboxDetailPage />} />
      </Routes>
    </MemoryRouter>
  );

  expect(await screen.findByTestId('callback-count')).toHaveTextContent('0');
  notifyInboxUpdated(anInbox(1));

  await waitFor(() => expect(screen.getByTestId('callback-count')).toHaveTextContent('1'));
});
