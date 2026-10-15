export const consentQueryKeys = {
  all: ["consent"] as const,
  lists: () => [...consentQueryKeys.all, "list"] as const,
};
