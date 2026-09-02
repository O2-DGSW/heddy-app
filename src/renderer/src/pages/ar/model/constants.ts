import { lightTheme } from "@heddy/design-tokens";

export const HAIRSTYLE_OPTIONS = [
  { id: "down-perm-1" },
  { id: "none" },
  { id: "down-perm-2" },
  { id: "down-perm-3" },
  { id: "down-perm-4" },
] as const;

export const HAIR_COLOR_OPTIONS = [
  { id: "natural-black", color: lightTheme.label.strong },
  { id: "dark-brown", color: "#100604" },
  { id: "brown", color: "#3B150E" },
  { id: "auburn", color: "#4A251F" },
  { id: "ash-brown", color: "#342D2D" },
] as const;

export const HAIRSTYLE_GAP = 25;
export const HAIRSTYLE_CENTER_POSITION = 202;
export const HAIRSTYLE_VISIBLE_RANGE = 4;
export const HAIRSTYLE_VISIBLE_OFFSETS = Array.from(
  { length: HAIRSTYLE_VISIBLE_RANGE * 2 + 1 },
  (_, index) => index - HAIRSTYLE_VISIBLE_RANGE
);

export const getCircularHairstyleOption = (position: number) => {
  const optionIndex =
    ((position % HAIRSTYLE_OPTIONS.length) + HAIRSTYLE_OPTIONS.length) % HAIRSTYLE_OPTIONS.length;

  return HAIRSTYLE_OPTIONS[optionIndex];
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
