import { useMutation, useQueryClient } from "@tanstack/react-query";

import { createTreatmentRecordApi } from "../treatmentRecordApi";
import { recordQueryKeys } from "../query/recordQueryKeys";
import type { CreateTreatmentRecordRequest } from "@/entities/record/model/treatmentRecord.types";

export const useCreateTreatmentRecord = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: CreateTreatmentRecordRequest) => createTreatmentRecordApi(body),
    onSuccess: created => {
      queryClient.setQueryData(recordQueryKeys.detail(created.record_id), created);
      void queryClient.invalidateQueries({ queryKey: recordQueryKeys.lists() });
    },
  });
};
