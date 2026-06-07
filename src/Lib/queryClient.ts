// src/lib/queryClient.ts
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // 5 min tak cache fresh rahega — GitHub JSON ke liye kafi hai
      staleTime: 0,
      // App background se aane par auto refetch
      refetchOnWindowFocus: true,
      // Network error pe 2 baar retry
      retry: 2,
    },
  },
});
