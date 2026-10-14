import { useMutation, useQueryClient } from "@tanstack/react-query";

import { saveStyleApi } from "../savedStyleApi";
import { savedStyleQueryKeys } from "../query/savedStyleQueryKeys";
import type { SaveStyleRequest } from "@/entities/saved-style/model/savedStyle.types";

export const usePostSavedStyle = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: SaveStyleRequest) => saveStyleApi(body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: savedStyleQueryKeys.all });
    },
  });
};
