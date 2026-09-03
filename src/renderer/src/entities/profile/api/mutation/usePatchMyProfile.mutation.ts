import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { UpdateMyProfileRequest } from "../../model";
import { profileQueryKeys } from "../../model";
import { patchMyProfileApi } from "../profileApi";

export const usePatchMyProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: UpdateMyProfileRequest) => patchMyProfileApi(body),
    onSuccess: profile => {
      queryClient.setQueryData(profileQueryKeys.mine(), profile);
    },
  });
};
