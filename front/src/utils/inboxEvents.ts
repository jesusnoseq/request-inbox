import { type Inbox } from '../types/inbox';

export const INBOX_UPDATED_EVENT = 'request-inbox:updated';

export const notifyInboxUpdated = (inbox: Inbox) => {
  window.dispatchEvent(new CustomEvent<Inbox>(INBOX_UPDATED_EVENT, { detail: inbox }));
};
