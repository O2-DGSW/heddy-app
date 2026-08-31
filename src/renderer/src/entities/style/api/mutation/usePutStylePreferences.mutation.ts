import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { StylePreferencesRequest } from "../../model";
import { putStylePreferencesApi } from "../styleApi";
import { styleQueryKeys } from "../query/styleQueryKeys";

export const usePutStylePreferences = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: StylePreferencesRequest) => putStylePreferencesApi(body),
    onSuccess: data => {
      queryClient.setQueryData(styleQueryKeys.preferences(), data);
      void queryClient.invalidateQueries({ queryKey: styleQueryKeys.all });
    },
  });
};
