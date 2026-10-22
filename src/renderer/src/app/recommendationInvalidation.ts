import { MutationCache, type QueryClient } from "@tanstack/react-query";

import { recommendationQueryKeys } from "@/entities/recommendation";

/** Saved inputs invalidate even a fresh recommendation. Cancel old requests before clearing data. */
export const createRecommendationMutationCache = (getClient: () => QueryClient) =>
  new MutationCache({
    onSettled: async (_data, error, _variables, _context, mutation) => {
      if (!mutation.meta?.affectsRecommendations || (error && !mutation.meta?.mayPartiallySucceed))
        return;
      const client = getClient();
      await client.cancelQueries({ queryKey: recommendationQueryKeys.all });
      await client.resetQueries({ queryKey: recommendationQueryKeys.all });
    },
  });
