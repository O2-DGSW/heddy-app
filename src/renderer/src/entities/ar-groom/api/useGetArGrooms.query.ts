import { useQuery } from "@tanstack/react-query";
import { env } from "@/shared/config";

import { getArGrooms } from "./arServerApi";

const arGroomQueryKeys = {
  all: ["ar-groom"] as const,
  list: (server: string) => [...arGroomQueryKeys.all, "list", server] as const,
};

export const useGetArGrooms = () =>
  useQuery({
    queryKey: arGroomQueryKeys.list(env.arServerUrl),
    queryFn: ({ signal }) => getArGrooms(signal),
    retry: false,
    refetchOnWindowFocus: false,
  });
