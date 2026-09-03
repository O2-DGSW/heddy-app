import { useQuery } from "@tanstack/react-query";

import { getStylePreferencesApi } from "../styleApi";
import { styleQueryKeys } from "./styleQueryKeys";

export const useGetStylePreferences = () =>
  useQuery({
    queryKey: styleQueryKeys.preferences(),
    queryFn: getStylePreferencesApi,
  });
