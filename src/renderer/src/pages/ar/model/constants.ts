import type { ArHairstyleOption } from "@/entities/ar-groom";

export const ORIGINAL_HAIRSTYLE_OPTION: ArHairstyleOption = {
  name: "",
  label: "원본 스타일",
};

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

export const DEFAULT_AR_HAIR_COLOR = HAIR_COLOR_OPTIONS[0].color;

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
