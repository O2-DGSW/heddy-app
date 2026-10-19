import { useQuery } from "@tanstack/react-query";
import { env } from "@/shared/config";

import { getArGrooms } from "../arServerApi";
import { arGroomQueryKeys } from "./arGroomQueryKeys";

const AR_GROOM_STALE_TIME_MS = 30 * 60 * 1000;
const AR_GROOM_GC_TIME_MS = 60 * 60 * 1000;

export const useGetArGrooms = () =>
  useQuery({
    queryKey: arGroomQueryKeys.list(env.arServerUrl),
    queryFn: ({ signal }) => getArGrooms(signal),
    staleTime: AR_GROOM_STALE_TIME_MS,
    gcTime: AR_GROOM_GC_TIME_MS,
    retry: false,
    refetchOnWindowFocus: false,
  });
