import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

afterEach(() => {
  cleanup();
});

/**
 * Mock this interface as it is not native to jsdom and it is used by shadcn/radix 's Tooltip component
 */
vi.stubGlobal('ResizeObserver', class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
});
