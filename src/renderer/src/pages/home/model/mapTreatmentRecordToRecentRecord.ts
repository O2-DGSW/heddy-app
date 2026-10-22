import { formatServiceTypes, getTreatmentRecordThumbnailUrl, toDateValue } from "@/entities/record";
import type { TreatmentRecordSummaryApiData } from "@/entities/record";

import type { RecentRecordType } from "@/features/home";

// 월·년은 달력 경계 대신 각각 30일·365일의 경과 시간으로 표시한다.
const ELAPSED_TIME_UNITS = [
  { seconds: 365 * 24 * 60 * 60, label: "년" },
  { seconds: 30 * 24 * 60 * 60, label: "개월" },
  { seconds: 7 * 24 * 60 * 60, label: "주" },
  { seconds: 24 * 60 * 60, label: "일" },
  { seconds: 60 * 60, label: "시간" },
  { seconds: 60, label: "분" },
  { seconds: 1, label: "초" },
] as const;

const formatElapsedTime = (performedAt: string): string | undefined => {
  const elapsedMilliseconds = Date.now() - new Date(performedAt).getTime();
  if (!Number.isFinite(elapsedMilliseconds) || elapsedMilliseconds < 0) return undefined;

  const elapsedSeconds = Math.floor(elapsedMilliseconds / 1000);
  const unit = ELAPSED_TIME_UNITS.find(unit => elapsedSeconds >= unit.seconds);
  if (!unit) return "0초 전";
  return `${Math.floor(elapsedSeconds / unit.seconds)}${unit.label} 전`;
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
    daysAgo: formatElapsedTime(item.performed_at),
  };
};
