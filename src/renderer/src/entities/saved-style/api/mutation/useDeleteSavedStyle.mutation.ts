import { useMutation, useQueryClient } from "@tanstack/react-query";

import { deleteSavedStyleApi } from "../savedStyleApi";
import { savedStyleQueryKeys } from "../query/savedStyleQueryKeys";

export const useDeleteSavedStyle = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (savedStyleId: string) => deleteSavedStyleApi(savedStyleId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: savedStyleQueryKeys.all });
    },
  });
};
