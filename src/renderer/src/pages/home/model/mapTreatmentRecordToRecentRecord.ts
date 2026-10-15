import { formatServiceTypes, getTreatmentRecordThumbnailUrl, toDateValue } from "@/entities/record";
import type { TreatmentRecordSummaryApiData } from "@/entities/record";

import type { RecentRecordType } from "@/features/home";

export const mapTreatmentRecordToRecentRecord = (
  item: TreatmentRecordSummaryApiData
): RecentRecordType => {
  const procedureName = formatServiceTypes(item.service_types ?? []);

  return {
    id: item.record_id,
    date: toDateValue(item.performed_at),
    procedureName: procedureName || "시술 기록",
    salonName: item.salon_name || "미용실 정보 없음",
    designerName: item.designer_name || "디자이너 정보 없음",
    rating: item.satisfaction ?? 0,
    thumbnailUrl: getTreatmentRecordThumbnailUrl(item),
  };
};
