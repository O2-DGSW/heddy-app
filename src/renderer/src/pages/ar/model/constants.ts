import type { ArHairstyleOption } from "@/entities/ar-groom";

export const ORIGINAL_HAIRSTYLE_OPTION: ArHairstyleOption = {
  name: "",
  label: "원본 스타일",
};

export const HAIR_COLOR_OPTIONS = [
  { id: "ash-brown", label: "애쉬 브라운", color: "#8A8178" },
  { id: "black", label: "블랙", color: "#3B3632" },
  { id: "dark-brown", label: "다크 브라운", color: "#4A342C" },
  { id: "choco-brown", label: "초코 브라운", color: "#6A4534" },
  { id: "milk-brown", label: "밀크 브라운", color: "#B28B6C" },
] as const;

export const DEFAULT_AR_HAIR_COLOR = HAIR_COLOR_OPTIONS[0].color;

export const EXPANDED_AR_MENU_ITEMS = [
  { label: "홈", to: "/home" },
  { label: "기록", to: "/cuts" },
  { label: "추천", to: "/recommend" },
  { label: "프로필", to: "/profile" },
] as const;

export const HAIRSTYLE_GAP = 25;
export const HAIRSTYLE_CENTER_POSITION = 202;
export const HAIRSTYLE_VISIBLE_RANGE = 4;
export const HAIRSTYLE_VISIBLE_OFFSETS = Array.from(
  { length: HAIRSTYLE_VISIBLE_RANGE * 2 + 1 },
  (_, index) => index - HAIRSTYLE_VISIBLE_RANGE
);

export const getCircularHairstyleOption = (
  position: number,
  hairstyleOptions: ArHairstyleOption[]
) => {
  const optionIndex =
    ((position % hairstyleOptions.length) + hairstyleOptions.length) % hairstyleOptions.length;

  return hairstyleOptions[optionIndex];
};

export const getHairstyleSize = (offset: number) => {
  const distance = Math.abs(offset);

  if (distance === 0) {
    return 80;
  }

  if (distance === 1) {
    return 62;
  }

  return 50;
};

export const getHairstyleItemLeft = (offset: number) => {
  if (offset === 0) {
    return HAIRSTYLE_CENTER_POSITION - getHairstyleSize(0) / 2;
  }

  const direction = Math.sign(offset);
  let center = HAIRSTYLE_CENTER_POSITION;

  for (let step = 1; step <= Math.abs(offset); step += 1) {
    const previousSize = getHairstyleSize(step - 1);
    const currentSize = getHairstyleSize(step);

    center += direction * (previousSize / 2 + HAIRSTYLE_GAP + currentSize / 2);
  }

  return center - getHairstyleSize(offset) / 2;
};
