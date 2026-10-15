import type { TreatmentRecordListParams } from "@/entities/record";

export const HOME_RECENT_RECORD_PARAMS: TreatmentRecordListParams = {
  page: 0,
  size: 1,
  sort: "performedAt,desc",
};
