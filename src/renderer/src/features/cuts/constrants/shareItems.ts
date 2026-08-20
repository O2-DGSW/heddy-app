export type CutsShareItem = {
  id: string;
  label: string;
  defaultEnabled: boolean;
};

export const CUTS_SHARE_ITEMS: CutsShareItem[] = [
  { id: "photo", label: "사진", defaultEnabled: false },
  { id: "procedure", label: "시술 내용", defaultEnabled: true },
  { id: "satisfaction", label: "만족도", defaultEnabled: true },
  { id: "ar-candidate", label: "AR 후보 스타일 함께 공유", defaultEnabled: true },
];
