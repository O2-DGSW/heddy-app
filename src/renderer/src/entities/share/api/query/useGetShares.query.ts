import { useQuery } from "@tanstack/react-query";

import { getSharesApi } from "../shareApi";
import { shareQueryKeys } from "./shareQueryKeys";
import type { ShareListParams } from "@/entities/share/model/share.types";

export const useGetShares = (params: ShareListParams = {}) =>
  useQuery({
    queryKey: shareQueryKeys.list(params),
    queryFn: () => getSharesApi(params),
  });
