import { useMutation, useQueryClient } from "@tanstack/react-query";

import { addTreatmentRecordPhotoApi } from "../treatmentRecordApi";
import { recordQueryKeys } from "../query/recordQueryKeys";
import type { AddTreatmentRecordPhotoRequest } from "@/entities/record/model/treatmentRecord.types";

interface AddTreatmentRecordPhotosVariables {
  recordId: string;
  photos: AddTreatmentRecordPhotoRequest[];
}

export const useAddTreatmentRecordPhotos = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ recordId, photos }: AddTreatmentRecordPhotosVariables) =>
      Promise.all(photos.map(photo => addTreatmentRecordPhotoApi(recordId, photo))),
    onSuccess: (_photos, { recordId }) => {
      void queryClient.invalidateQueries({ queryKey: recordQueryKeys.detail(recordId) });
      void queryClient.invalidateQueries({ queryKey: recordQueryKeys.lists() });
    },
  });
};
