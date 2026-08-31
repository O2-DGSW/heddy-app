export const styleQueryKeys = {
  all: ["style"] as const,
  tags: () => [...styleQueryKeys.all, "tags"] as const,
  preferences: () => [...styleQueryKeys.all, "preferences"] as const,
};
