/** 휠 한 칸 높이(px). 손가락으로 굴릴 때 걸리는 감이 나도록 터치 최소 크기(44px)에 맞춘다 */
export const WHEEL_ITEM_HEIGHT = 44;

/** 한 번에 보이는 칸 수. 가운데 선택줄 위아래로 두 칸씩 보이도록 홀수로 둔다 */
export const WHEEL_VISIBLE_ITEM_COUNT = 5;

/**
 * 같은 후보 목록을 몇 번 이어 붙일지. 아이폰 알람처럼 끝에서 처음으로 이어지게 하려고
 * 목록을 여러 벌 쌓아 두고, 가운데 벌에서 시작해 끝에 가까워지면 한 벌만큼 스크롤을 옮긴다.
 * 내용이 똑같아서 옮기는 순간이 눈에 보이지 않는다. 홀수여야 가운데 벌이 생긴다.
 */
export const WHEEL_REPEAT_COUNT = 7;

/** 처음 자리잡을 벌의 번호(0부터). 위아래로 같은 길이의 여유를 두려고 한가운데를 쓴다 */
export const WHEEL_MIDDLE_BLOCK_INDEX = (WHEEL_REPEAT_COUNT - 1) / 2;

/** 선택줄 위에 놓이는 칸까지의 거리(칸 수) */
export const WHEEL_EDGE_ITEM_COUNT = (WHEEL_VISIBLE_ITEM_COUNT - 1) / 2;
