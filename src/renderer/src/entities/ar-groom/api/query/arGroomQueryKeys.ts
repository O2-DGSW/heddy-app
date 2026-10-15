export const arGroomQueryKeys = {
  all: ["ar-groom"] as const,
  list: (server: string) => [...arGroomQueryKeys.all, "list", server] as const,
};
