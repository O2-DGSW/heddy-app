import { skipToken, useQuery } from "@tanstack/react-query";

import { getPublicShareApi } from "../shareApi";
import { shareQueryKeys } from "./shareQueryKeys";

export const useGetPublicShare = (shareToken: string | undefined) =>
  useQuery({
    queryKey: shareQueryKeys.publicShare(shareToken ?? ""),
    queryFn: shareToken ? () => getPublicShareApi(shareToken) : skipToken,
  });
