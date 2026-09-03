import type { ShareFieldType } from "@/entities/share";

export type CutsShareItem = {
  id: ShareFieldType;
  label: string;
  defaultEnabled: boolean;
};

/**
 * 공유 화면에 노출하는 항목.
 * 서버가 받는 6종 중 화면에 있는 4종만 쓴다(주의사항 CAUTIONS·메모 MEMO는 아직 화면에 없다).
 */
export const CUTS_SHARE_ITEMS: CutsShareItem[] = [
  { id: "PHOTOS", label: "사진", defaultEnabled: false },
  { id: "TREATMENT_DETAILS", label: "시술 내용", defaultEnabled: true },
  { id: "SATISFACTION", label: "만족도", defaultEnabled: true },
  { id: "SAVED_STYLES", label: "AR 후보 스타일 함께 공유", defaultEnabled: true },
];

export const DEFAULT_CUTS_SHARE_FIELDS = CUTS_SHARE_ITEMS.filter(item => item.defaultEnabled).map(
  item => item.id
);
