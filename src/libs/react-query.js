import { QueryClient } from '@tanstack/react-query';

// Single shared QueryClient for the whole app.
// Firebase reads cost money and are slow, so defaults are tuned to avoid
// unnecessary refetches: no refetch on window focus / reconnect, generous
// staleTime so navigating back to a screen serves cache instead of re-querying.
export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 5 * 60 * 1000, // 5 min: data considered fresh, no refetch
            gcTime: 30 * 60 * 1000, // 30 min: keep unused cache around
            refetchOnWindowFocus: false,
            refetchOnReconnect: false,
            retry: 1
        },
        mutations: {
            retry: 0
        }
    }
});
