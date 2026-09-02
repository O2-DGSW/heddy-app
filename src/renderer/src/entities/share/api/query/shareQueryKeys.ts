import type { ShareListParams } from "@/entities/share/model/share.types";

export const shareQueryKeys = {
  all: ["share"] as const,
  lists: () => [...shareQueryKeys.all, "list"] as const,
  list: (params: ShareListParams) => [...shareQueryKeys.lists(), params] as const,
  details: () => [...shareQueryKeys.all, "detail"] as const,
  detail: (shareId: string) => [...shareQueryKeys.details(), shareId] as const,
  publicShare: (shareToken: string) => [...shareQueryKeys.all, "public", shareToken] as const,
};
