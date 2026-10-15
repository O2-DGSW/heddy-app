import { lightTheme } from "@heddy/design-tokens";

export { getCircularHairstyleOption, ORIGINAL_HAIRSTYLE_OPTION } from "@/features/ar-preview";

export const HAIR_COLOR_OPTIONS = [
  { id: "auto", label: "원래 머리색 자동 맞춤", color: "" },
  { id: "natural-black", label: "블랙", color: lightTheme.label.strong },
  { id: "dark-brown", label: "다크 브라운", color: "#100604" },
  { id: "brown", label: "브라운", color: "#3B150E" },
  { id: "auburn", label: "오번", color: "#4A251F" },
  { id: "ash-brown", label: "애쉬 브라운", color: "#342D2D" },
] as const;

export const EXPANDED_AR_MENU_ITEMS = [
  { label: "홈", to: "/home" },
  { label: "기록", to: "/cuts" },
  { label: "추천", to: "/recommend" },
  { label: "프로필", to: "/profile" },
] as const;
