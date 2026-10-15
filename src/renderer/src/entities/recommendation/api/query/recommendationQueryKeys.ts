export const recommendationQueryKeys = {
  all: ["recommendation"] as const,
  latest: () => [...recommendationQueryKeys.all, "latest"] as const,
};
