import { useMutation, useQueryClient } from "@tanstack/react-query";

import { addTreatmentRecordPhotoApi } from "../treatmentRecordPhotoApi";
import { recordQueryKeys } from "../query/recordQueryKeys";
import type { AddTreatmentRecordPhotoRequest } from "@/entities/record/model/treatmentRecord.types";

interface AddTreatmentRecordPhotosVariables {
  recordId: string;
  photos: AddTreatmentRecordPhotoRequest[];
}

/** 일부 사진만 실패했을 때 던진다. 실패한 사진만 다시 올릴 수 있도록 요청 배열의 순번을 담는다 */
export class TreatmentRecordPhotoUploadError extends Error {
  readonly failedIndexes: number[];

  constructor(failedIndexes: number[], cause: unknown) {
    super(
      `사진 ${failedIndexes.length}장을 올리지 못했습니다. 다시 저장하면 실패한 사진만 올립니다.`,
      {
        cause,
      }
    );
    this.name = "TreatmentRecordPhotoUploadError";
    this.failedIndexes = failedIndexes;
  }
}

const uploadPhotos = async ({ recordId, photos }: AddTreatmentRecordPhotosVariables) => {
  const results = await Promise.allSettled(
    photos.map(photo => addTreatmentRecordPhotoApi(recordId, photo))
  );
  const failedIndexes = results.flatMap((result, index) =>
    result.status === "rejected" ? [index] : []
  );

  if (failedIndexes.length > 0) {
    const firstFailure = results.find(result => result.status === "rejected");
    throw new TreatmentRecordPhotoUploadError(
      failedIndexes,
      firstFailure?.status === "rejected" ? firstFailure.reason : undefined
    );
  }

  return results.flatMap(result => (result.status === "fulfilled" ? [result.value] : []));
};

export const useAddTreatmentRecordPhotos = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: uploadPhotos,
    // 일부만 성공해도 서버에는 사진이 붙었으므로 성공·실패 모두 다시 불러온다
    onSettled: (_photos, _error, { recordId }) => {
      void queryClient.invalidateQueries({ queryKey: recordQueryKeys.detail(recordId) });
      void queryClient.invalidateQueries({ queryKey: recordQueryKeys.lists() });
    },
  });
};
