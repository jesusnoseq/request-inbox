import { InboxRequest } from '../types/inbox';

// Headers curl derives on its own from the URL and the body. Sending the captured
// values would either be redundant (Host) or plain wrong (Content-Length).
const SKIPPED_HEADERS = ['host', 'content-length'];

const LOCAL_HOSTS = ['localhost', '127.0.0.1', '[::1]', '::1'];

const shellQuote = (value: string): string => `'${value.replace(/'/g, `'\''`)}'`;

const headerValues = (value: string | string[] | undefined): string[] => {
    if (value === undefined || value === null) {
        return [];
    }
    return Array.isArray(value) ? value : [value];
};

const findHeader = (headers: InboxRequest['Headers'], name: string): string | undefined => {
    const entry = Object.entries(headers || {}).find(([key]) => key.toLowerCase() === name);
    return entry ? headerValues(entry[1])[0] : undefined;
};

const buildURL = (request: InboxRequest): string => {
    const uri = request.URI || '/';
    if (/^https?:\/\//i.test(uri)) {
        return uri;
    }

    const host = request.Host || findHeader(request.Headers, 'host') || 'localhost';
    const forwardedProto = findHeader(request.Headers, 'x-forwarded-proto');
    const hostname = host.split(':')[0].toLowerCase();
    const scheme = forwardedProto
        ? forwardedProto.split(',')[0].trim()
        : LOCAL_HOSTS.includes(hostname) ? 'http' : 'https';

    return `${scheme}://${host}${uri.startsWith('/') ? '' : '/'}${uri}`;
};

export const buildCurlCommand = (request: InboxRequest): string => {
    const parts = [`curl -X ${(request.Method || 'GET').toUpperCase()} ${shellQuote(buildURL(request))}`];

    Object.entries(request.Headers || {}).forEach(([name, value]) => {
        if (SKIPPED_HEADERS.includes(name.toLowerCase())) {
            return;
        }
        headerValues(value).forEach((v) => {
            parts.push(`-H ${shellQuote(`${name}: ${v}`)}`);
        });
    });

    if (request.Body) {
        parts.push(`--data-raw ${shellQuote(request.Body)}`);
    }

    return parts.join(' \\n  ');
};
