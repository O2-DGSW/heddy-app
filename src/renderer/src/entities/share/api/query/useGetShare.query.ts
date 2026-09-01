import { useQuery } from "@tanstack/react-query";

import { getShareApi } from "../shareApi";
import { shareQueryKeys } from "./shareQueryKeys";

export const useGetShare = (shareId: string | undefined) =>
  useQuery({
    queryKey: shareQueryKeys.detail(shareId ?? ""),
    queryFn: () => getShareApi(shareId as string),
    enabled: Boolean(shareId),
  });
