import type { TreatmentRecordListParams } from "@/entities/record/model/treatmentRecord.types";

export const recordQueryKeys = {
  all: ["record"] as const,
  lists: () => [...recordQueryKeys.all, "list"] as const,
  list: (params: TreatmentRecordListParams) => [...recordQueryKeys.lists(), params] as const,
  details: () => [...recordQueryKeys.all, "detail"] as const,
  detail: (recordId: string) => [...recordQueryKeys.details(), recordId] as const,
};
