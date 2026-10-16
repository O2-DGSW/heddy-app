import { getHairstyleItemLeft, getHairstyleSize } from "./constants";

// 가운데(가장 큰) 칸 크기. 모든 칸을 이 크기로 두고 scale로 줄여 레이아웃 없이 애니메이션한다.
export const HAIRSTYLE_BASE_SIZE = getHairstyleSize(0);
const HAIRSTYLE_CENTER = getHairstyleItemLeft(0) + HAIRSTYLE_BASE_SIZE / 2;
export const HAIRSTYLE_STEP_DISTANCE =
  getHairstyleItemLeft(1) + getHairstyleSize(1) / 2 - HAIRSTYLE_CENTER;

export const getHairstyleVisualLayout = (offset: number) => {
  const direction = offset < 0 ? -1 : 1;
  const distance = Math.abs(offset);
  const lowerDistance = Math.floor(distance);
  const progress = distance - lowerDistance;
  const lowerOffset = direction * lowerDistance;
  const upperOffset = direction * (lowerDistance + 1);
  const lowerSize = getHairstyleSize(lowerOffset);
  const upperSize = getHairstyleSize(upperOffset);
  const lowerCenter = getHairstyleItemLeft(lowerOffset) + lowerSize / 2;
  const upperCenter = getHairstyleItemLeft(upperOffset) + upperSize / 2;

  return {
    center: lowerCenter + (upperCenter - lowerCenter) * progress,
    size: lowerSize + (upperSize - lowerSize) * progress,
  };
};
