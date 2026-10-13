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
};
