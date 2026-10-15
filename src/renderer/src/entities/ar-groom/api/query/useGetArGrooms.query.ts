import { useQuery } from "@tanstack/react-query";
import { env } from "@/shared/config";

import { getArGrooms } from "../arServerApi";
import { arGroomQueryKeys } from "./arGroomQueryKeys";

export const useGetArGrooms = () =>
  useQuery({
    queryKey: arGroomQueryKeys.list(env.arServerUrl),
    queryFn: ({ signal }) => getArGrooms(signal),
    retry: false,
    refetchOnWindowFocus: false,
  });
