import '@testing-library/jest-dom';

declare global {
  interface Window {
    ACS_CONFIG?: any;
  }
}

window.ACS_CONFIG = { apiUrl: '' };
import { beforeAll, afterEach, afterAll } from 'vitest';
import { setupServer } from 'msw/node';

// Setup Mock Service Worker (MSW) server
export const server = setupServer();

beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
