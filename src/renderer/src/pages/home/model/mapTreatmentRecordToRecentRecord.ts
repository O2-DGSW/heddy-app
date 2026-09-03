import { createDateValue, getTreatmentRecordThumbnailUrl } from "@/entities";
import type { TreatmentRecordSummaryApiData } from "@/entities";

import { SERVICE_TYPE_LABEL } from "./constants";
import type { RecentRecordType } from "./types";

const formatPerformedAt = (performedAt: string) => {
  const performedDate = new Date(performedAt);

  if (Number.isNaN(performedDate.getTime())) {
    return "";
  }

  return createDateValue(
    performedDate.getFullYear(),
    performedDate.getMonth() + 1,
    performedDate.getDate()
  );
};

export const mapTreatmentRecordToRecentRecord = (
  item: TreatmentRecordSummaryApiData
): RecentRecordType => {
  const serviceTypes = item.service_types ?? [];
  const procedureName = serviceTypes.map(type => SERVICE_TYPE_LABEL[type] ?? "기타").join(" · ");

  return {
    id: item.record_id,
    date: formatPerformedAt(item.performed_at),
    procedureName: procedureName || "시술 기록",
    salonName: item.salon_name || "미용실 정보 없음",
    designerName: item.designer_name || "디자이너 정보 없음",
    rating: item.satisfaction ?? 0,
    thumbnailUrl: getTreatmentRecordThumbnailUrl(item),
  };
};
