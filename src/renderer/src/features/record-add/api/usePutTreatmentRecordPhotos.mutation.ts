import { useMutation, useQueryClient } from "@tanstack/react-query";

import { recordQueryKeys } from "@/entities/record";

import { syncRecordPhotos } from "./syncRecordPhotos";

/**
 * 수정 화면의 사진을 서버와 맞춘다. 삭제·순서 변경·추가가 섞여 여러 번 호출되므로
 * 한 묶음으로 처리하고, 끝나면 기록을 다시 읽는다.
 */
export const usePutTreatmentRecordPhotos = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: syncRecordPhotos,
    // 변수에 사진 File이 담겨 있어 화면을 떠나면 바로 캐시에서 지운다(기본 5분 보관).
    gcTime: 0,
    onSuccess: (_result, { recordId }) => {
      void queryClient.invalidateQueries({ queryKey: recordQueryKeys.detail(recordId) });
      void queryClient.invalidateQueries({ queryKey: recordQueryKeys.lists() });
    },
  });
};
