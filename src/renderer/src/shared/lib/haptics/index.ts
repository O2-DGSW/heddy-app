import { Haptics } from "@capacitor/haptics";

/**
 * 휠·리스트에서 선택 값이 한 칸 넘어갈 때마다 주는 네이티브 햅틱.
 * 웹이나 진동이 없는 기기에서는 플러그인이 조용히 넘어가므로 실패를 삼켜 호출부를 단순하게 둔다.
 */
export const triggerSelectionHaptic = () => {
  void Haptics.selectionChanged().catch(() => {});
};

/** 휠을 잡기 시작할 때 한 번 불러 햅틱 엔진을 깨운다 */
export const startSelectionHaptic = () => {
  void Haptics.selectionStart().catch(() => {});
};

/** 휠에서 손을 뗐을 때 한 번 불러 햅틱 엔진을 놓아준다 */
export const endSelectionHaptic = () => {
  void Haptics.selectionEnd().catch(() => {});
};
