import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

// Manually extend Vitest's expect with Jest-DOM matchers
// This is what makes .toBeInTheDocument() work!
afterEach(() => {
  cleanup();
});