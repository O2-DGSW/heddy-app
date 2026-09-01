import type { TreatmentRecordListParams } from "@/entities/record/model/treatmentRecord.types";

export const recordQueryKeys = {
  all: ["record"] as const,
  lists: () => [...recordQueryKeys.all, "list"] as const,
  list: (params: TreatmentRecordListParams) => [...recordQueryKeys.lists(), params] as const,
};
