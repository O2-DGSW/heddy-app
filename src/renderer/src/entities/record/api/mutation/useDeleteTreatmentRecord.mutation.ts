import { useMutation, useQueryClient } from "@tanstack/react-query";

import { deleteTreatmentRecordApi } from "../treatmentRecordApi";
import { recordQueryKeys } from "../query/recordQueryKeys";

export const useDeleteTreatmentRecord = () => {
  const queryClient = useQueryClient();

  return useMutation({
    meta: { affectsRecommendations: true },
    mutationFn: (recordId: string) => deleteTreatmentRecordApi(recordId),
    onSuccess: (_result, recordId) => {
      queryClient.removeQueries({ queryKey: recordQueryKeys.detail(recordId) });
      void queryClient.invalidateQueries({ queryKey: recordQueryKeys.lists() });
    },
  });
};
