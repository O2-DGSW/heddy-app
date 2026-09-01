import { useMutation, useQueryClient } from "@tanstack/react-query";

import { revokeShareApi } from "../shareApi";
import { shareQueryKeys } from "../query/shareQueryKeys";

export const useRevokeShare = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (shareId: string) => revokeShareApi(shareId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: shareQueryKeys.all });
    },
  });
};
