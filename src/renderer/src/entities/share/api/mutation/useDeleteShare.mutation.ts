import { useMutation, useQueryClient } from "@tanstack/react-query";

import { deleteShareApi } from "../shareApi";
import { shareQueryKeys } from "../query/shareQueryKeys";

export const useDeleteShare = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (shareId: string) => deleteShareApi(shareId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: shareQueryKeys.all });
    },
  });
};
