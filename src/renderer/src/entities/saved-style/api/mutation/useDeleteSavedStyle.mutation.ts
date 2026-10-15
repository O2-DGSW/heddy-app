import { useMutation, useQueryClient } from "@tanstack/react-query";

import { deleteSavedStyleApi } from "../savedStyleApi";
import { savedStyleQueryKeys } from "../query/savedStyleQueryKeys";
import type { SavedStylesResponse } from "@/entities/saved-style/model/savedStyle.types";

export const useDeleteSavedStyle = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (savedStyleId: string) => deleteSavedStyleApi(savedStyleId),
    onSuccess: async (_data, savedStyleId) => {
      queryClient.setQueryData<SavedStylesResponse>(savedStyleQueryKeys.lists(), current =>
        current
          ? { items: current.items.filter(item => item.saved_style_id !== savedStyleId) }
          : current
      );
      await queryClient.invalidateQueries({ queryKey: savedStyleQueryKeys.all });
    },
  });
};
