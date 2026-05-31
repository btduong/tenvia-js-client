import { render, renderHook, type RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React, { type ReactElement } from 'react';

// https://tanstack.com/query/latest/docs/framework/react/guides/testing

// Create a new QueryClient config for testing.
export const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      retry: false, // Turn off retries so error tests fail immediately
    },
    mutations: {
      retry: false,
    }
  },
});

/**
 * Custom render for React Components that require React Query
 */
export const renderWithClient = (ui: ReactElement, options?: Omit<RenderOptions, 'wrapper'>) => {
  const testClient = createTestQueryClient();
  const { rerender, ...result } = render(
    <QueryClientProvider client={testClient}>{ui}</QueryClientProvider>,
    options
  );
  return {
    ...result,
    // Also wrap a QueryClientProvider for a rerender().
    rerender: (rerenderUi: React.ReactElement) =>
      rerender(<QueryClientProvider client={testClient}>{rerenderUi}</QueryClientProvider>),
  };
};

/**
 * Custom renderHook for React Hooks that require React Query (like useUser)
 */
export function renderHookWithClient<Result, Props>(
  render: (initialProps: Props) => Result
) {
  const testClient = createTestQueryClient();
  return renderHook(render, {
    wrapper: ({ children }) => (
      <QueryClientProvider client={testClient}>{children}</QueryClientProvider>
    ),
  });
}

