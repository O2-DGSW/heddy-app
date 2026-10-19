import { skipToken, useQuery } from "@tanstack/react-query";

import { getAnalysisJobPhase, getAnalysisJobPollInterval } from "../../model/analysisJob";
import { getAnalysisJobApi } from "../analysisApi";
import { recordQueryKeys } from "./recordQueryKeys";

import type { AnalysisJobAcceptedApiData } from "../../model/analysis.types";

/**
 * 기록마다 진행 중인 분석 작업. 서버에 "기록의 진행 중 작업" 조회 API가 없어,
 * 요청할 때 받은 작업을 캐시에 넣어 두고 화면을 나갔다 와도 같은 작업을 이어서 본다.
 */
export const useGetActiveAnalysisJob = (recordId: string | undefined) =>
  useQuery<AnalysisJobAcceptedApiData | null>({
    queryKey: recordQueryKeys.activeAnalysisJob(recordId ?? ""),
    // 요청·재시도 mutation이 setQueryData로 채운다. 캐시가 없을 때만 빈 값으로 시작한다.
    queryFn: () => null,
    enabled: Boolean(recordId),
    staleTime: Infinity,
    gcTime: 30 * 60_000,
  });

/** 작업이 끝날 때까지 상태를 확인한다. 끝나면(성공·실패·재촬영) 확인을 멈춘다 */
export const useGetAnalysisJob = (jobId: string | null | undefined) =>
  useQuery({
    queryKey: recordQueryKeys.analysisJob(jobId ?? ""),
    queryFn: jobId ? () => getAnalysisJobApi(jobId) : skipToken,
    refetchInterval: query =>
      getAnalysisJobPhase(query.state.data) === "pending"
        ? getAnalysisJobPollInterval(query.state.dataUpdateCount)
        : false,
    // 백그라운드에서도 분석은 진행되므로, 돌아왔을 때 바로 최신 상태를 본다
    refetchOnWindowFocus: "always",
  });
