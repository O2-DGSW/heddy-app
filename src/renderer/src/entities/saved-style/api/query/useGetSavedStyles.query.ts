import { useQuery } from "@tanstack/react-query";

import { getSavedStylesApi } from "../savedStyleApi";
import { savedStyleQueryKeys } from "./savedStyleQueryKeys";

export const useGetSavedStyles = () =>
  useQuery({
    queryKey: savedStyleQueryKeys.lists(),
    queryFn: getSavedStylesApi,
  });
