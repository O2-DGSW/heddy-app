import { useQuery } from "@tanstack/react-query";

import { getArGrooms } from "./arServerApi";

const arGroomQueryKeys = {
  all: ["ar-groom"] as const,
  list: (server: string) => [...arGroomQueryKeys.all, "list", server] as const,
};

export const useGetArGrooms = () =>
  useQuery({
    queryKey: arGroomQueryKeys.list(import.meta.env.VITE_AR_SERVER_URL ?? ""),
    queryFn: ({ signal }) => getArGrooms(signal),
    retry: false,
    refetchOnWindowFocus: false,
  });
