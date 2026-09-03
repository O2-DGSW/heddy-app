import { useQuery } from "@tanstack/react-query";

import { getConsentsApi } from "../consentApi";
import { consentQueryKeys } from "./consentQueryKeys";

interface UseGetConsentsOptions {
  enabled?: boolean;
}

export const useGetConsents = ({ enabled = true }: UseGetConsentsOptions = {}) =>
  useQuery({
    queryKey: consentQueryKeys.lists(),
    queryFn: getConsentsApi,
    enabled,
  });
