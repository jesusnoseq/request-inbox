import { useMatch } from 'react-router-dom';

import useWebMCPTool from '../hooks/useWebMCPTool';
import { getInbox, updateInbox } from '../services/inbox';
import { notifyInboxUpdated } from '../utils/inboxEvents';
import { callbackTemplates } from './callback/callbackTemplates';

const callbackTemplateNames = {
  pass_forward: 'Pass Forward',
  json_webhook: 'JSON Webhook',
  slack_webhook: 'Slack Webhook',
  discord_webhook: 'Discord Webhook',
  stripe_webhook: 'Stripe Webhook',
} as const;

type CallbackTemplateKey = keyof typeof callbackTemplateNames;

const hasTemplateAction = (value: string) => value.includes('{{');

/** Tools that operate on the inbox currently open in the app. */
const InboxDetailWebMCPTools = ({ inboxId }: { inboxId: string }) => {
  useWebMCPTool({
    name: 'add_request_inbox_callback',
    title: 'Add Request Inbox Callback',
    description:
      'Add a callback to the open inbox. Use a built-in dynamic template for request forwarding, JSON, Slack, Discord, or Stripe, or configure a custom callback. The callback runs once whenever a request is captured.',
    inputSchema: {
      type: 'object',
      properties: {
        destinationUrl: {
          type: 'string',
          minLength: 1,
          description: 'HTTP or HTTPS destination with a real host. Dynamic templates may appear in its path, but not in place of the scheme or host.',
        },
        template: {
          type: 'string',
          enum: ['pass_forward', 'json_webhook', 'slack_webhook', 'discord_webhook', 'stripe_webhook'],
          description: 'Optional built-in dynamic template. Omit for a custom callback. Supplied callback fields override template defaults.',
        },
        method: {
          type: 'string',
          minLength: 1,
          description: 'HTTP method or dynamic Go template. Defaults to POST for a custom callback.',
        },
        headers: {
          type: 'object',
          description: 'Complete custom header map. Overrides preset headers; values may be Go templates in dynamic mode.',
          additionalProperties: { type: 'string' },
        },
        body: {
          type: 'string',
          description: 'Callback request body. May be a Go template in dynamic mode.',
        },
        isEnabled: {
          type: 'boolean',
          description: 'Whether to run the callback for new requests. Defaults to true.',
        },
        isDynamic: {
          type: 'boolean',
          description: 'Enable Go templates in URL, method, body, and header values. Presets require and default to true; custom callbacks default to false.',
        },
        forwardHeaders: {
          type: 'boolean',
          description: 'Forward incoming request headers. Custom callback headers override forwarded headers with the same name.',
        },
      },
      required: ['destinationUrl'],
      additionalProperties: false,
    } as const,
    outputSchema: {
      type: 'object',
      properties: {
        inboxId: { type: 'string' },
        callbackIndex: { type: 'integer', description: 'Zero-based callback position, available as .Index in templates.' },
        callbackCount: { type: 'integer' },
        template: { type: 'string' },
        callback: {
          type: 'object',
          properties: {
            destinationUrl: { type: 'string' },
            method: { type: 'string' },
            headers: { type: 'object', additionalProperties: { type: 'string' } },
            body: { type: 'string' },
            isEnabled: { type: 'boolean' },
            isDynamic: { type: 'boolean' },
            forwardHeaders: { type: 'boolean' },
          },
          required: ['destinationUrl', 'method', 'headers', 'body', 'isEnabled', 'isDynamic', 'forwardHeaders'],
          additionalProperties: false,
        },
      },
      required: ['inboxId', 'callbackIndex', 'callbackCount', 'template', 'callback'],
      additionalProperties: false,
    } as const,
    annotations: {
      readOnlyHint: false,
      untrustedContentHint: true,
    },
    execute: async (input) => {
      const destinationUrl = input.destinationUrl.trim();
      if (!/^https?:\/\/[^/\s]+/i.test(destinationUrl)) {
        throw new Error('destinationUrl must start with http:// or https:// followed by a host.');
      }

      const templateKey = input.template as CallbackTemplateKey | undefined;
      const templateName = templateKey ? callbackTemplateNames[templateKey] : undefined;
      const preset = templateName
        ? callbackTemplates.find((candidate) => candidate.name === templateName)?.callback
        : undefined;
      if (templateName && !preset) {
        throw new Error(`Callback template "${templateName}" is unavailable.`);
      }
      if (preset && input.isDynamic === false) {
        throw new Error('Built-in callback templates require isDynamic to be true.');
      }

      const method = (input.method ?? preset?.Method ?? 'POST').trim();
      if (!method) {
        throw new Error('method must not be empty.');
      }

      const callback = {
        IsEnabled: input.isEnabled ?? true,
        IsDynamic: input.isDynamic ?? Boolean(preset),
        ToURL: templateKey === 'pass_forward'
          ? `${destinationUrl}{{extractURI .Request.URI}}`
          : `${destinationUrl}${preset?.ToURL ?? ''}`,
        Method: method,
        Headers: input.headers ?? preset?.Headers ?? {},
        Body: input.body ?? preset?.Body ?? '',
        IsForwardingHeaders: input.forwardHeaders ?? preset?.IsForwardingHeaders ?? false,
      };
      const containsTemplate = [
        callback.ToURL,
        callback.Method,
        callback.Body,
        ...Object.values(callback.Headers),
      ].some(hasTemplateAction);
      if (containsTemplate && !callback.IsDynamic) {
        throw new Error('Set isDynamic to true when callback fields contain Go template actions.');
      }

      const current = await getInbox(inboxId);
      const callbackIndex = current.Callbacks.length;
      const updated = await updateInbox({
        ...current,
        Callbacks: [...current.Callbacks, callback],
      });
      const saved = updated.Callbacks[callbackIndex];
      if (!saved) {
        throw new Error('The API did not return the added callback.');
      }
      notifyInboxUpdated(updated);

      return {
        inboxId: updated.ID,
        callbackIndex,
        callbackCount: updated.Callbacks.length,
        template: templateKey ?? 'custom',
        callback: {
          destinationUrl: saved.ToURL,
          method: saved.Method,
          headers: saved.Headers,
          body: saved.Body,
          isEnabled: saved.IsEnabled,
          isDynamic: saved.IsDynamic,
          forwardHeaders: saved.IsForwardingHeaders,
        },
      };
    },
  });

  useWebMCPTool({
    name: 'get_request_inbox_requests',
    title: 'Get Incoming Requests',
    description:
      'Get captured requests from the open inbox in arrival order. Use afterRequestId with the returned nextAfterRequestId to poll for newly incoming requests without returning previously processed traffic.',
    inputSchema: {
      type: 'object',
      properties: {
        requestLimit: {
          type: 'integer',
          minimum: 1,
          maximum: 20,
          default: 5,
          description: 'Maximum requests to return. An initial call returns the latest window; a cursor call returns the next window.',
        },
        afterRequestId: {
          type: 'integer',
          minimum: 0,
          description: 'Return only requests with a larger ID. Set this to nextAfterRequestId from the previous call to poll for new arrivals.',
        },
      },
      additionalProperties: false,
    } as const,
    outputSchema: {
      type: 'object',
      properties: {
        inboxId: { type: 'string' },
        totalRequestCount: { type: 'integer' },
        matchingRequestCount: { type: 'integer' },
        returnedCount: { type: 'integer' },
        hasMore: {
          type: 'boolean',
          description: 'Whether more requests remain in a cursor-based batch. False for the initial latest-window call.',
        },
        nextAfterRequestId: { type: 'integer' },
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
      required: [
        'inboxId',
        'totalRequestCount',
        'matchingRequestCount',
        'returnedCount',
        'hasMore',
        'nextAfterRequestId',
        'requests',
      ],
      additionalProperties: false,
    } as const,
    annotations: {
      readOnlyHint: true,
      untrustedContentHint: true,
    },
    execute: async (input) => {
      const requestLimit = Math.min(20, Math.max(1, input.requestLimit ?? 5));
      const afterRequestId = input.afterRequestId;
      const inbox = await getInbox(inboxId);
      const inboxRequests = inbox.Requests ?? [];
      const matchingRequests = afterRequestId === undefined
        ? inboxRequests
        : inboxRequests.filter((request) => request.ID > afterRequestId);
      const selectedRequests = afterRequestId === undefined
        ? matchingRequests.slice(-requestLimit)
        : matchingRequests.slice(0, requestLimit);
      const requests = selectedRequests.map((request) => ({
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

      return {
        inboxId: inbox.ID,
        totalRequestCount: inboxRequests.length,
        matchingRequestCount: matchingRequests.length,
        returnedCount: requests.length,
        hasMore: afterRequestId !== undefined && matchingRequests.length > requests.length,
        nextAfterRequestId: requests.at(-1)?.requestId ?? afterRequestId ?? 0,
        requests,
      };
    },
  });

  return null;
};

/** Keeps future page-specific tools mounted only while their page is active. */
const PageWebMCPTools = () => {
  const inboxDetailMatch = useMatch('/inbox/:inboxId');

  return inboxDetailMatch?.params.inboxId
    ? <InboxDetailWebMCPTools inboxId={inboxDetailMatch.params.inboxId} />
    : null;
};

export default PageWebMCPTools;
