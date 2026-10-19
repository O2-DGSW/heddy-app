import { formatServiceTypes, getTreatmentRecordThumbnailUrl, toDateValue } from "@/entities/record";
import type { TreatmentRecordSummaryApiData } from "@/entities/record";

import type { RecentRecordType } from "@/features/home";

const formatElapsedDays = (performedAt: string) => {
  const performedDate = new Date(performedAt);

  if (Number.isNaN(performedDate.getTime())) {
    return undefined;
  }

  const today = new Date();
  const todayStart = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
  const performedDateStart = Date.UTC(
    performedDate.getFullYear(),
    performedDate.getMonth(),
    performedDate.getDate()
  );
  const elapsedDays = Math.floor((todayStart - performedDateStart) / (24 * 60 * 60 * 1000));

  if (elapsedDays < 0) {
    return undefined;
  }

  return elapsedDays === 0 ? "오늘" : `${elapsedDays}일 전`;
};

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
    daysAgo: formatElapsedDays(item.performed_at),
  };
};
