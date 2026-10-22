import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { UpdateMyProfileRequest } from "../../model";
import { profileQueryKeys } from "../query/profileQueryKeys";
import { patchMyProfileApi } from "../profileApi";

export const usePatchMyProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    meta: { affectsRecommendations: true },
    mutationFn: (body: UpdateMyProfileRequest) => patchMyProfileApi(body),
    onSuccess: profile => {
      queryClient.setQueryData(profileQueryKeys.mine(), profile);
    },
  });
};
