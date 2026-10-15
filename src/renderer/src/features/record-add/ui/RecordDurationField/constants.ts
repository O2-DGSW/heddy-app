/** 휠 한 칸 높이(px). 손가락으로 굴릴 때 걸리는 감이 나도록 터치 최소 크기(44px)에 맞춘다 */
export const WHEEL_ITEM_HEIGHT = 44;

/** 한 번에 보이는 칸 수. 가운데 선택줄 위아래로 두 칸씩 보이도록 홀수로 둔다 */
export const WHEEL_VISIBLE_ITEM_COUNT = 5;

/** 선택줄 위에 놓이는 칸까지의 거리(칸 수) */
export const WHEEL_EDGE_ITEM_COUNT = (WHEEL_VISIBLE_ITEM_COUNT - 1) / 2;

/**
 * 한 휠에 깔아 둘 대략의 칸 수.
 * 세게 튕겼을 때 관성이 끝에 닿지 않을 만큼은 깔려 있어야 한다 —
 * 400칸이면 가운데에서 양쪽으로 8,000px 넘게 남아 한 번의 플릭으로는 끝에 닿지 않는다.
 */
const WHEEL_TARGET_ITEM_COUNT = 400;

/**
 * 같은 후보 목록을 몇 벌 이어 붙일지.
 * 후보가 적을수록(예: 10분 단위라 6개) 더 많이 깔아야 굴릴 거리가 확보된다.
 * 가운데 벌이 생기도록 홀수로 맞춘다.
 */
export const getWheelRepeatCount = (optionCount: number) => {
  const repeatCount = Math.max(3, Math.ceil(WHEEL_TARGET_ITEM_COUNT / optionCount));

  return repeatCount % 2 === 0 ? repeatCount + 1 : repeatCount;
};
