import { lightTheme } from "@heddy/design-tokens";

import type { ArHairstyleOption } from "./types";

export const ORIGINAL_HAIRSTYLE_OPTION: ArHairstyleOption = {
  id: "none",
  label: "원본 스타일",
};

export const HAIR_COLOR_OPTIONS = [
  { id: "natural-black", color: lightTheme.label.strong },
  { id: "dark-brown", color: "#100604" },
  { id: "brown", color: "#3B150E" },
  { id: "auburn", color: "#4A251F" },
  { id: "ash-brown", color: "#342D2D" },
] as const;

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
