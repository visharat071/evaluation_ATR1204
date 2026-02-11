import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 0, // Always stale -> Always refetch in background
            retry: 2,
            refetchOnWindowFocus: false, // Good for mobile apps
        },
    },
});
