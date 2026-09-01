import { useMutation, useQueryClient } from "@tanstack/react-query";

import { updateShareApi } from "../shareApi";
import { shareQueryKeys } from "../query/shareQueryKeys";
import type { UpdateShareRequest } from "@/entities/share/model/share.types";

interface UpdateShareVariables {
  shareId: string;
  body: UpdateShareRequest;
}

export const useUpdateShare = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ shareId, body }: UpdateShareVariables) => updateShareApi(shareId, body),
    onSuccess: updated => {
      queryClient.setQueryData(shareQueryKeys.detail(updated.share_id), updated);
      void queryClient.invalidateQueries({ queryKey: shareQueryKeys.lists() });
    },
  });
};
