import { useQuery } from "@tanstack/react-query";

import type { GetSharesParams } from "../../model";
import { getSharesApi } from "../shareApi";
import { shareQueryKeys } from "./shareQueryKeys";

interface UseGetSharesOptions {
  enabled?: boolean;
}

export const useGetShares = (
  params: GetSharesParams = {},
  { enabled = true }: UseGetSharesOptions = {}
) =>
  useQuery({
    queryKey: shareQueryKeys.list(params),
    queryFn: () => getSharesApi(params),
    enabled,
  });
