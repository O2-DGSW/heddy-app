import { useMutation, useQueryClient } from "@tanstack/react-query";

import { postAnalysisApi, postAnalysisJobRetryApi } from "../analysisApi";
import { recordQueryKeys } from "../query/recordQueryKeys";

interface PostAnalysisVariables {
  recordId: string;
  photoId: string;
}

interface PostAnalysisJobRetryVariables {
  recordId: string;
  jobId: string;
}

/** 머리 분석 요청. 접수된 작업을 기록의 진행 중 작업으로 기억해 화면이 바로 진행 상태를 확인하게 한다 */
export const usePostAnalysis = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ recordId, photoId }: PostAnalysisVariables) =>
      postAnalysisApi(recordId, { photo_id: photoId }),
    onSuccess: (job, { recordId }) => {
      queryClient.setQueryData(recordQueryKeys.activeAnalysisJob(recordId), job);
    },
  });
};

/** 실패한 작업 재시도. 새 작업 ID로 접수되므로 진행 중 작업을 새 작업으로 바꾼다 */
export const usePostAnalysisJobRetry = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ jobId }: PostAnalysisJobRetryVariables) => postAnalysisJobRetryApi(jobId),
    onSuccess: (job, { recordId }) => {
      queryClient.setQueryData(recordQueryKeys.activeAnalysisJob(recordId), job);
    },
  });
};
