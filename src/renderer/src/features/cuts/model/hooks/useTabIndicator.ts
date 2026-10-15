/**
 * 탭 표시줄 위치. 탭 한 칸 너비의 상자를 transform으로 옮겨 left 애니메이션의 레이아웃 계산을 피한다.
 */
export const useTabIndicator = (tabCount: number, selectedIndex: number) => {
  const tabWidthPercent = 100 / tabCount;
  const indicatorTranslatePercent = selectedIndex * 100;

  return { tabWidthPercent, indicatorTranslatePercent };
};
