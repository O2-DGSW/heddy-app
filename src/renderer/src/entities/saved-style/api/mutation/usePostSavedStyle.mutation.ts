import { useMutation, useQueryClient } from "@tanstack/react-query";

import { saveStyleApi } from "../savedStyleApi";
import { savedStyleQueryKeys } from "../query/savedStyleQueryKeys";
import type {
  SaveStyleRequest,
  SavedStylesResponse,
} from "@/entities/saved-style/model/savedStyle.types";

export const usePostSavedStyle = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: SaveStyleRequest) => saveStyleApi(body),
    onSuccess: async (savedStyle, request) => {
      const savedStyleWithHairstyleId = {
        ...savedStyle,
        hairstyle_id: savedStyle.hairstyle_id ?? request.hairstyle_id,
      };

      queryClient.setQueryData<SavedStylesResponse>(savedStyleQueryKeys.lists(), current =>
        current
          ? {
              items: [
                savedStyleWithHairstyleId,
                ...current.items.filter(item => item.saved_style_id !== savedStyle.saved_style_id),
              ],
            }
          : current
      );
      await queryClient.invalidateQueries({ queryKey: savedStyleQueryKeys.all });
    },
  });
};
