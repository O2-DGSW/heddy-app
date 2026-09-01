import { useMutation, useQueryClient } from "@tanstack/react-query";

import { updateTreatmentRecordApi } from "../treatmentRecordApi";
import { recordQueryKeys } from "../query/recordQueryKeys";
import type { UpdateTreatmentRecordRequest } from "@/entities/record/model/treatmentRecord.types";

interface UpdateTreatmentRecordVariables {
  recordId: string;
  body: UpdateTreatmentRecordRequest;
}

export const useUpdateTreatmentRecord = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ recordId, body }: UpdateTreatmentRecordVariables) =>
      updateTreatmentRecordApi(recordId, body),
    onSuccess: updated => {
      // 수정한 기록의 상세는 응답으로 바로 갱신하고, 목록은 다시 받아온다.
      queryClient.setQueryData(recordQueryKeys.detail(updated.record_id), updated);
      void queryClient.invalidateQueries({ queryKey: recordQueryKeys.lists() });
    },
  });
};
