import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

import { buildInboxURL, getInbox, newInbox } from '../services/inbox';
import { type Inbox } from '../types/inbox';

const buildInboxDetailPath = (id: string) => `/inbox/${id}`;

const buildInboxDetailURL = (id: string) =>
  new URL(buildInboxDetailPath(id), window.location.origin).href;

const describeInbox = (inbox: Inbox): WebMCPToolResult => ({
  inboxId: inbox.ID,
  name: inbox.Name,
  captureUrl: buildInboxURL(inbox.ID),
  detailUrl: buildInboxDetailURL(inbox.ID),
  isPrivate: inbox.IsPrivate,
});

const WebMCPTools = () => {
  const navigate = useNavigate();
  // The tools are registered once, so they read the navigate function through a
  // ref instead of capturing the one from the render that registered them.
  const navigateRef = useRef(navigate);
  navigateRef.current = navigate;

  useEffect(() => {
    const modelContext = document.modelContext;
    if (!modelContext) {
      return;
    }

    const controller = new AbortController();

    const register = (tool: WebMCPTool) =>
      void modelContext.registerTool(tool, { signal: controller.signal }).catch((error: unknown) => {
        if (!controller.signal.aborted) {
          console.error('Failed to register WebMCP tools', error);
        }
      });

    register({
      name: 'create_request_inbox',
      title: 'Create Request Inbox',
      description: 'Create an HTTP request inbox for webhook testing. If the user is not signed in, the inbox is public and ownerless.',
      inputSchema: {
        type: 'object',
        properties: {},
        additionalProperties: false,
      },
      annotations: {
        readOnlyHint: false,
        untrustedContentHint: false,
      },
      execute: async (_input, { signal }) => {
        const inbox = await newInbox(signal);
        const result = describeInbox(inbox);

        if (!inbox.OwnerID) {
          result.warning = 'This inbox is anonymous and can be accessed or modified by anyone with its ID.';
        }

        return result;
      },
    });

    register({
      name: 'open_request_inbox',
      title: 'Open Request Inbox',
      description: 'Navigate the app to a specific request inbox so the user sees its captured requests and response settings.',
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
      },
      annotations: {
        readOnlyHint: false,
        untrustedContentHint: true,
      },
      execute: async (input, { signal }) => {
        const inboxId = typeof input.inboxId === 'string' ? input.inboxId.trim() : '';
        if (!inboxId) {
          throw new Error('inboxId is required to open a request inbox.');
        }

        // Resolve the inbox first so a wrong or inaccessible ID fails here
        // instead of navigating the user to an error page.
        const inbox = await getInbox(inboxId, signal);
        navigateRef.current(buildInboxDetailPath(inbox.ID));

        return {
          ...describeInbox(inbox),
          requestCount: inbox.Requests?.length ?? 0,
        };
      },
    });

    return () => controller.abort();
  }, []);

  return null;
};

export default WebMCPTools;
