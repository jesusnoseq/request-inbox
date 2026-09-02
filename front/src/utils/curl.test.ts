import { describe, it, expect } from 'vitest';
import { buildCurlCommand } from './curl';
import { InboxRequest } from '../types/inbox';

const makeRequest = (overrides: Partial<InboxRequest> = {}): InboxRequest => ({
    ID: 0,
    Timestamp: 1700000000000,
    URI: '/api/v1/inboxes/abc/in/hook?a=1',
    Headers: { 'Content-Type': ['application/json'] } as unknown as InboxRequest['Headers'],
    Body: '',
    Host: 'request-inbox.test',
    RemoteAddr: '10.0.0.1:5555',
    Protocol: 'HTTP/1.1',
    Method: 'POST',
    ContentLength: 0,
    ...overrides,
});

describe('buildCurlCommand', () => {
    it('includes method, url, headers and body', () => {
        const curl = buildCurlCommand(makeRequest({ Body: '{"a":1}' }));
        expect(curl).toContain("curl -X POST 'https://request-inbox.test/api/v1/inboxes/abc/in/hook?a=1'");
        expect(curl).toContain("-H 'Content-Type: application/json'");
        expect(curl).toContain(`--data-raw '{"a":1}'`);
    });

    it('omits the body flag when there is no body', () => {
        expect(buildCurlCommand(makeRequest())).not.toContain('--data-raw');
    });

    it('repeats a header that was sent several times', () => {
        const curl = buildCurlCommand(makeRequest({
            Headers: { 'X-Tag': ['one', 'two'] } as unknown as InboxRequest['Headers'],
        }));
        expect(curl).toContain("-H 'X-Tag: one'");
        expect(curl).toContain("-H 'X-Tag: two'");
    });

    it('accepts plain string header values', () => {
        const curl = buildCurlCommand(makeRequest({ Headers: { Accept: '*/*' } }));
        expect(curl).toContain("-H 'Accept: */*'");
    });

    it('drops headers curl derives on its own', () => {
        const curl = buildCurlCommand(makeRequest({
            Headers: { Host: ['other.test'], 'Content-Length': ['7'], Accept: ['*/*'] } as unknown as InboxRequest['Headers'],
            Body: 'payload',
        }));
        expect(curl).not.toContain('-H \'Host:');
        expect(curl).not.toContain('Content-Length');
        expect(curl).toContain("-H 'Accept: */*'");
    });

    it('uses http for local hosts and honours x-forwarded-proto', () => {
        expect(buildCurlCommand(makeRequest({ Host: 'localhost:8080' })))
            .toContain("'http://localhost:8080/api/v1/inboxes/abc/in/hook?a=1'");
        expect(buildCurlCommand(makeRequest({
            Host: 'localhost:8080',
            Headers: { 'X-Forwarded-Proto': ['https', 'http'] } as unknown as InboxRequest['Headers'],
        }))).toContain("'https://localhost:8080/");
    });

    it('escapes single quotes so the command stays valid', () => {
        const curl = buildCurlCommand(makeRequest({ Body: "it's here" }));
        expect(curl).toContain(`--data-raw 'it'\''s here'`);
    });

    it('keeps an absolute request URI as-is', () => {
        expect(buildCurlCommand(makeRequest({ URI: 'http://proxy.test/path' })))
            .toContain("curl -X POST 'http://proxy.test/path'");
    });
});
