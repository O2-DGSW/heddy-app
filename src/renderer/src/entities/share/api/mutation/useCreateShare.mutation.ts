import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { CreateShareRequest } from "../../model";
import { createShareApi } from "../shareApi";
import { shareQueryKeys } from "../query/shareQueryKeys";

export const useCreateShare = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: CreateShareRequest) => createShareApi(body),
    onSuccess: () => {
      // 새 공유가 생겼으니 공유 목록을 다시 받아온다.
      void queryClient.invalidateQueries({ queryKey: shareQueryKeys.lists() });
    },
  });
};
