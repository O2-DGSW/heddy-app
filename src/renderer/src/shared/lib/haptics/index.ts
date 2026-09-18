import { Haptics, ImpactStyle } from "@capacitor/haptics";

/**
 * 휠·리스트에서 선택 값이 한 칸 넘어갈 때마다 주는 네이티브 햅틱.
 *
 * selectionChanged 대신 impact를 쓴다 — selectionChanged는 selectionStart가 브리지를 왕복해
 * 제너레이터를 만들어 둔 뒤에만 울리고, 아직이면 에러 없이 조용히 무시된다.
 * impact는 부를 때 제너레이터를 바로 만들어 울리므로 순서에 의존하지 않는다.
 *
 * 웹에서는 navigator.vibrate가 없으면 플러그인이 unavailable을 던지는데(iOS 사파리가 그렇다),
 * 햅틱은 없어도 그만인 보조 효과라 삼키고 넘어간다.
 */
export const triggerSelectionHaptic = () => {
  void Haptics.impact({ style: ImpactStyle.Light }).catch(() => {});
};
