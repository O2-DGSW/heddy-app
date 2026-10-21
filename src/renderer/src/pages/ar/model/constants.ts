export { getCircularHairstyleOption, ORIGINAL_HAIRSTYLE_OPTION } from "@/features/ar-preview";

export const HAIR_COLOR_OPTIONS = [
  { id: "ash-brown", label: "애쉬 브라운", color: "#8A8178" },
  { id: "dark-brown", label: "다크 브라운", color: "#4A342C" },
  { id: "choco-brown", label: "초코 브라운", color: "#6A4534" },
  { id: "milk-brown", label: "밀크 브라운", color: "#B28B6C" },
  { id: "silver", label: "실버", color: "#C9CCD1" },
  { id: "platinum", label: "플래티넘 블론드", color: "#E8DDC5" },
  { id: "honey", label: "허니 블론드", color: "#CFA463" },
  { id: "copper", label: "코퍼 오렌지", color: "#B86A40" },
  { id: "burgundy", label: "버건디", color: "#873E52" },
  { id: "rose", label: "로즈 핑크", color: "#C58D9B" },
  { id: "lavender", label: "라벤더", color: "#B09ACB" },
  { id: "ash-blue", label: "애쉬 블루", color: "#708DAE" },
  { id: "mint", label: "애쉬 민트", color: "#89ADA0" },
  { id: "olive", label: "올리브 브라운", color: "#91916B" },
] as const;

// 빈 값은 서버의 사용자 머리색 자동 맞춤을 유지한다.
export const DEFAULT_AR_HAIR_COLOR = "";
