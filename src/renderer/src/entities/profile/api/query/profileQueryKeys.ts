export const profileQueryKeys = {
  all: ["profile"] as const,
  mine: () => [...profileQueryKeys.all, "mine"] as const,
};
