import type { ArHairstyleOption } from "./types";

export const ORIGINAL_HAIRSTYLE_OPTION: ArHairstyleOption = {
  name: "",
  label: "원본 스타일",
};

export const HAIRSTYLE_GAP = 14;
export const HAIRSTYLE_CENTER_POSITION = 202;
// 중앙과 좌우 2개를 표시하고, 양끝 한 칸은 스크롤 중 등장할 항목으로 둔다.
export const HAIRSTYLE_VISIBLE_RANGE = 3;
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

  if (distance === 2) {
    return 46;
  }

  return 0;
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
