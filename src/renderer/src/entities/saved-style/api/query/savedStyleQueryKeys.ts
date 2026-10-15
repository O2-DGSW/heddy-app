export const savedStyleQueryKeys = {
  all: ["savedStyle"] as const,
  lists: () => [...savedStyleQueryKeys.all, "list"] as const,
};
