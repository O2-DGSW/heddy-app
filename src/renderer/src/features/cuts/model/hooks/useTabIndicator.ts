export const useTabIndicator = (tabCount: number, selectedIndex: number) => {
  const tabWidthPercent = 100 / tabCount;
  const indicatorLeftPercent = tabWidthPercent * selectedIndex + tabWidthPercent / 2;

  return { indicatorLeftPercent };
};
