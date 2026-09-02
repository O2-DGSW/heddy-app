import type { GetSharesParams } from "../../model";

export const shareQueryKeys = {
  all: ["share"] as const,
  lists: () => [...shareQueryKeys.all, "list"] as const,
  list: (params: GetSharesParams) => [...shareQueryKeys.lists(), params] as const,
  publicShare: (shareToken: string) => [...shareQueryKeys.all, "public", shareToken] as const,
};
