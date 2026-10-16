import { queryOptions, skipToken, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";

import { getAnalysisApi, getLatestAnalysisApi } from "../analysisApi";
import { recordQueryKeys } from "./recordQueryKeys";

export const getLatestAnalysisQueryOptions = (recordId: string | undefined) =>
  queryOptions({
    queryKey: recordQueryKeys.latestAnalysis(recordId ?? ""),
    queryFn: recordId ? () => getLatestAnalysisApi(recordId) : skipToken,
  });

/** 결과는 만들어진 뒤 바뀌지 않아 한 번 받으면 다시 요청하지 않는다 */
export const getAnalysisQueryOptions = (analysisId: string) =>
  queryOptions({
    queryKey: recordQueryKeys.analysis(analysisId),
    queryFn: () => getAnalysisApi(analysisId),
    staleTime: Infinity,
  });

export const useGetLatestAnalysis = (recordId: string | undefined) =>
  useQuery(getLatestAnalysisQueryOptions(recordId));

/** 분석 탭을 열기 전에(상세 진입, 목록 선택) 결과를 미리 받아 탭 전환 즉시 보이게 한다 */
export const usePrefetchLatestAnalysis = () => {
  const queryClient = useQueryClient();

  return useCallback(
    (recordId: string) => {
      void queryClient.prefetchQuery(getLatestAnalysisQueryOptions(recordId));
    },
    [queryClient]
  );
};
