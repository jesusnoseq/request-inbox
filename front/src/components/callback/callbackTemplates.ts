import { InboxCallback } from '../../types/inbox';

export type CallbackTemplate = {
    name: string;
    description: string;
    callback: Partial<InboxCallback>;
};

export const callbackTemplates: CallbackTemplate[] = [
    {
        name: 'Pass Forward',
        description: 'Forward all headers, HTTP method, and body from the original request',
        callback: {
            IsDynamic: true,
            ToURL: '{{extractURI .Request.URI}}',
            Method: '{{.Request.Method}}',
            Headers: {},
            Body: '{{.Request.Body}}',
            IsForwardingHeaders: true
        }
    },
    {
        name: 'JSON Webhook',
        description: 'Standard JSON webhook with POST method',
        callback: {
            IsDynamic: true,
            ToURL: '',
            Method: 'POST',
            Headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'RequestInbox-Webhook/1.0'
            },
            Body: '{"message": "Webhook received", "timestamp": "{{.Timestamp}}"}',
            IsForwardingHeaders: false
        }
    },
    {
        name: 'Slack Webhook',
        description: 'Slack-compatible webhook format',
        callback: {
            IsDynamic: true,
            ToURL: '',
            Method: 'POST',
            Headers: {
                'Content-Type': 'application/json'
            },
            Body: '{"text": "New request received from {{.Request.RemoteAddr}} to {{.Request.URI}}"}',
            IsForwardingHeaders: false
        }
    },
    {
        name: 'Discord Webhook',
        description: 'Discord-compatible webhook format',
        callback: {
            IsDynamic: true,
            ToURL: '',
            Method: 'POST',
            Headers: {
                'Content-Type': 'application/json'
            },
            Body: '{"content": "🔔 **New Request Alert**\\n**Method:** {{.Request.Method}}\\n**URI:** {{.Request.URI}}\\n**From:** {{.Request.RemoteAddr}}"}',
            IsForwardingHeaders: false
        }
    },
    {
        name: 'Stripe Webhook',
        description: 'Forward webhooks to Stripe-compatible endpoint',
        callback: {
            IsDynamic: true,
            ToURL: '',
            Method: 'POST',
            Headers: {
                'Content-Type': 'application/json',
                'Stripe-Signature': '{{.Request.Header.Stripe-Signature}}'
            },
            Body: '{{.Request.Body}}',
            IsForwardingHeaders: false
        }
    }
];
