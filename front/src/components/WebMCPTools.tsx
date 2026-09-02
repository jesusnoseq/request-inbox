import { useNavigate } from 'react-router-dom';

import useWebMCPTool from '../hooks/useWebMCPTool';
import { buildInboxURL, getInbox, newInbox } from '../services/inbox';
import { type Inbox } from '../types/inbox';

const buildInboxDetailPath = (id: string) => `/inbox/${id}`;

const buildInboxDetailURL = (id: string) =>
  new URL(buildInboxDetailPath(id), window.location.origin).href;

/** Fields every inbox tool reports back, so both output schemas share them. */
const inboxProperties = {
  inboxId: { type: 'string', description: 'Identifier of the inbox.' },
  name: { type: 'string', description: 'Display name of the inbox.' },
  captureUrl: { type: 'string', description: 'URL that requests must be sent to for the inbox to capture them.' },
  detailUrl: { type: 'string', description: 'App page showing the captured requests and the inbox settings.' },
  isPrivate: { type: 'boolean', description: 'Whether the inbox is only readable by its owner.' },
} as const;

const inboxRequired = ['inboxId', 'name', 'captureUrl', 'detailUrl', 'isPrivate'] as const;

const describeInbox = (inbox: Inbox) => ({
  inboxId: inbox.ID,
  name: inbox.Name,
  captureUrl: buildInboxURL(inbox.ID),
  detailUrl: buildInboxDetailURL(inbox.ID),
  isPrivate: inbox.IsPrivate,
});

const WebMCPTools = () => {
  const navigate = useNavigate();

  useWebMCPTool({
    name: 'create_request_inbox',
    title: 'Create Request Inbox',
    description:
      'Create an HTTP request inbox for webhook testing. If the user is not signed in, the inbox is public and ownerless.',
    inputSchema: {
      type: 'object',
      properties: {},
      additionalProperties: false,
    } as const,
    outputSchema: {
      type: 'object',
      properties: {
        ...inboxProperties,
        warning: { type: 'string', description: 'Present when the inbox has no owner and anyone can reach it.' },
      },
      required: inboxRequired,
    } as const,
    annotations: {
      readOnlyHint: false,
      untrustedContentHint: false,
    },
    execute: async () => {
      const inbox = await newInbox();

      return {
        ...describeInbox(inbox),
        ...(inbox.OwnerID
          ? {}
          : { warning: 'This inbox is anonymous and can be accessed or modified by anyone with its ID.' }),
      };
    },
  });

  useWebMCPTool({
    name: 'open_request_inbox',
    title: 'Open Request Inbox',
    description:
      'Navigate the app to a specific request inbox so the user sees its captured requests and response settings.',
    inputSchema: {
      type: 'object',
      properties: {
        inboxId: {
          type: 'string',
          description: 'Identifier of the inbox to open, as returned by create_request_inbox.',
        },
      },
      required: ['inboxId'],
      additionalProperties: false,
    } as const,
    outputSchema: {
      type: 'object',
      properties: {
        ...inboxProperties,
        requestCount: { type: 'number', description: 'How many requests the inbox has captured so far.' },
      },
      required: [...inboxRequired, 'requestCount'],
    } as const,
    annotations: {
      readOnlyHint: false,
      untrustedContentHint: true,
    },
    execute: async (input) => {
      const inboxId = typeof input.inboxId === 'string' ? input.inboxId.trim() : '';
      if (!inboxId) {
        throw new Error('inboxId is required to open a request inbox.');
      }

      // Resolve the inbox first so a wrong or inaccessible ID fails here
      // instead of navigating the user to an error page.
      const inbox = await getInbox(inboxId);
      navigate(buildInboxDetailPath(inbox.ID));

      return {
        ...describeInbox(inbox),
        requestCount: inbox.Requests?.length ?? 0,
      };
    },
  });

  return null;
};

export default WebMCPTools;
