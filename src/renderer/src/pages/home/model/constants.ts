import type { ServiceType, TreatmentRecordListParams } from "@/entities";

export const HOME_RECENT_RECORD_PARAMS: TreatmentRecordListParams = {
  sort: "performedAt,desc",
};

export const SERVICE_TYPE_LABEL: Record<ServiceType, string> = {
  CUT: "커트",
  PERM: "펌",
  COLOR: "염색",
  BLEACH: "탈색",
  CLINIC: "클리닉",
  STYLING: "스타일링",
  OTHER: "기타",
};
