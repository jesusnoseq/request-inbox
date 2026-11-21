// jest-dom adds custom matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom/vitest';
import { TextDecoder, TextEncoder } from 'util';

Object.assign(globalThis, { TextDecoder, TextEncoder });

// Use the test document's storage instead of Node's file-backed global.
Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    get: () => jsdom.window.localStorage,
});
