import type { ServiceType } from "./treatmentRecord.types";

/** 시술 종류의 한글 이름 */
export const SERVICE_TYPE_LABEL: Record<ServiceType, string> = {
  CUT: "커트",
  PERM: "펌",
  COLOR: "염색",
  BLEACH: "탈색",
  CLINIC: "클리닉",
  STYLING: "스타일링",
  OTHER: "기타",
};

const isServiceType = (value: string): value is ServiceType => value in SERVICE_TYPE_LABEL;

/** 서버가 모르는 값을 줄 수 있는 곳(공개 공유 등)에서 쓴다. 모르는 값은 "기타"로 보여준다 */
export const getServiceTypeLabel = (value: string) =>
  isServiceType(value) ? SERVICE_TYPE_LABEL[value] : SERVICE_TYPE_LABEL.OTHER;

/** ["CUT", "COLOR"] → "커트 · 염색" */
export const formatServiceTypes = (values: readonly string[]) =>
  values.map(getServiceTypeLabel).join(" · ");
