import { useNavigate } from 'react-router-dom';

import { useUser } from '../context/UserContext';
import useWebMCPTool from '../hooks/useWebMCPTool';
import { buildInboxURL, getInbox, getInboxList, newInbox } from '../services/inbox';
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

const inboxSummaryProperties = {
  ...inboxProperties,
  requestCount: { type: 'integer', description: 'How many requests the inbox has captured.' },
} as const;

const inboxSummaryRequired = [...inboxRequired, 'requestCount'] as const;

const inboxCollectionSchema = {
  type: 'object',
  properties: {
    inboxes: {
      type: 'array',
      items: {
        type: 'object',
        properties: inboxSummaryProperties,
        required: inboxSummaryRequired,
        additionalProperties: false,
      },
    },
    count: { type: 'integer', description: 'Number of inboxes returned.' },
  },
  required: ['inboxes', 'count'],
  additionalProperties: false,
} as const;

const describeInbox = (inbox: Inbox) => ({
  inboxId: inbox.ID,
  name: inbox.Name,
  captureUrl: buildInboxURL(inbox.ID),
  detailUrl: buildInboxDetailURL(inbox.ID),
  isPrivate: inbox.IsPrivate,
});

const summarizeInbox = (inbox: Inbox) => ({
  ...describeInbox(inbox),
  requestCount: inbox.Requests?.length ?? 0,
});

const documentationToolSchema = {
  type: 'object',
  properties: {
    page: { type: 'string', description: 'Name of the documentation page that was opened.' },
    url: { type: 'string', description: 'Absolute URL of the documentation page.' },
  },
  required: ['page', 'url'],
  additionalProperties: false,
} as const;

const WebMCPTools = () => {
  const navigate = useNavigate();
  const { isLoggedIn } = useUser();
  const authenticated = isLoggedIn();

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

  useWebMCPTool({
    name: 'list_request_inboxes',
    title: 'List Request Inboxes',
    description: 'List the request inboxes owned by the signed-in user, newest first.',
    inputSchema: {
      type: 'object',
      properties: {},
      additionalProperties: false,
    } as const,
    outputSchema: inboxCollectionSchema,
    annotations: {
      readOnlyHint: true,
      untrustedContentHint: true,
    },
    execute: async () => {
      const inboxes = await getInboxList();
      return { inboxes: inboxes.map(summarizeInbox), count: inboxes.length };
    },
  }, authenticated);

  useWebMCPTool({
    name: 'search_request_inboxes',
    title: 'Search Request Inboxes',
    description: 'Search the signed-in user\'s request inboxes by name or identifier.',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', minLength: 1, description: 'Text to match against inbox names and identifiers.' },
      },
      required: ['query'],
      additionalProperties: false,
    } as const,
    outputSchema: inboxCollectionSchema,
    annotations: {
      readOnlyHint: true,
      untrustedContentHint: true,
    },
    execute: async (input) => {
      const query = input.query.trim().toLowerCase();
      if (!query) {
        throw new Error('query is required to search request inboxes.');
      }

      const inboxes = (await getInboxList()).filter(
        (inbox) => inbox.ID.toLowerCase().includes(query) || inbox.Name.toLowerCase().includes(query)
      );
      return { inboxes: inboxes.map(summarizeInbox), count: inboxes.length };
    },
  }, authenticated);

  useWebMCPTool({
    name: 'inspect_request_inbox',
    title: 'Inspect Request Inbox',
    description: 'Inspect one of the signed-in user\'s inboxes and return a bounded set of its newest requests.',
    inputSchema: {
      type: 'object',
      properties: {
        inboxId: { type: 'string', minLength: 1, description: 'Identifier of the inbox to inspect.' },
        requestLimit: {
          type: 'integer',
          minimum: 1,
          maximum: 20,
          default: 5,
          description: 'Maximum number of newest captured requests to return.',
        },
      },
      required: ['inboxId'],
      additionalProperties: false,
    } as const,
    outputSchema: {
      type: 'object',
      properties: {
        ...inboxSummaryProperties,
        requests: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              requestId: { type: 'integer' },
              timestamp: { type: 'number' },
              method: { type: 'string' },
              uri: { type: 'string' },
              headers: { type: 'object', additionalProperties: { type: 'string' } },
              body: { type: 'string' },
              host: { type: 'string' },
              remoteAddress: { type: 'string' },
              protocol: { type: 'string' },
              contentLength: { type: 'integer' },
            },
            required: [
              'requestId',
              'timestamp',
              'method',
              'uri',
              'headers',
              'body',
              'host',
              'remoteAddress',
              'protocol',
              'contentLength',
            ],
            additionalProperties: false,
          },
        },
      },
      required: [...inboxSummaryRequired, 'requests'],
      additionalProperties: false,
    } as const,
    annotations: {
      readOnlyHint: true,
      untrustedContentHint: true,
    },
    execute: async (input) => {
      const inboxId = input.inboxId.trim();
      if (!inboxId) {
        throw new Error('inboxId is required to inspect a request inbox.');
      }

      const requestLimit = Math.min(20, Math.max(1, input.requestLimit ?? 5));
      const inbox = await getInbox(inboxId);
      const requests = (inbox.Requests ?? []).slice(-requestLimit).reverse().map((request) => ({
        requestId: request.ID,
        timestamp: request.Timestamp,
        method: request.Method,
        uri: request.URI,
        headers: request.Headers,
        body: request.Body,
        host: request.Host,
        remoteAddress: request.RemoteAddr,
        protocol: request.Protocol,
        contentLength: request.ContentLength,
      }));

      return { ...summarizeInbox(inbox), requests };
    },
  }, authenticated);

  useWebMCPTool({
    name: 'open_api_documentation',
    title: 'Open API Documentation',
    description: 'Navigate the app to its interactive HTTP API documentation.',
    inputSchema: { type: 'object', properties: {}, additionalProperties: false } as const,
    outputSchema: documentationToolSchema,
    annotations: { readOnlyHint: false, untrustedContentHint: false },
    execute: async () => {
      const path = '/api-docs';
      navigate(path);
      return { page: 'API documentation', url: new URL(path, window.location.origin).href };
    },
  });

  useWebMCPTool({
    name: 'open_user_documentation',
    title: 'Open User Documentation',
    description: 'Navigate the app to its request inbox user documentation.',
    inputSchema: { type: 'object', properties: {}, additionalProperties: false } as const,
    outputSchema: documentationToolSchema,
    annotations: { readOnlyHint: false, untrustedContentHint: false },
    execute: async () => {
      const path = '/docs';
      navigate(path);
      return { page: 'User documentation', url: new URL(path, window.location.origin).href };
    },
  });

  return null;
};

export default WebMCPTools;
