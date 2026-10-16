import type { TreatmentRecordListParams } from "@/entities/record/model/treatmentRecord.types";

export const recordQueryKeys = {
  all: ["record"] as const,
  lists: () => [...recordQueryKeys.all, "list"] as const,
  list: (params: TreatmentRecordListParams) => [...recordQueryKeys.lists(), params] as const,
  // 무한 스크롤은 페이지 묶음을 캐시하므로 일반 목록과 같은 키를 쓰면 데이터 모양이 섞인다
  infiniteList: (params: Omit<TreatmentRecordListParams, "page">) =>
    [...recordQueryKeys.lists(), "infinite", params] as const,
  details: () => [...recordQueryKeys.all, "detail"] as const,
  detail: (recordId: string) => [...recordQueryKeys.details(), recordId] as const,
  analyses: () => [...recordQueryKeys.all, "analysis"] as const,
  latestAnalysis: (recordId: string) =>
    [...recordQueryKeys.analyses(), recordId, "latest"] as const,
  analysis: (analysisId: string) => [...recordQueryKeys.analyses(), "result", analysisId] as const,
  // 기록마다 진행 중인 분석 작업. 화면을 나갔다 와도 같은 작업을 이어서 보려고 캐시에 둔다
  activeAnalysisJob: (recordId: string) =>
    [...recordQueryKeys.analyses(), recordId, "active-job"] as const,
  analysisJob: (jobId: string) => [...recordQueryKeys.analyses(), "job", jobId] as const,
};
