import { CUTS_TABS, type CutsStatusFilter } from "@/features/cuts/constrants/tabs";

export const useTabIndicator = (selected: CutsStatusFilter) => {
  const selectedIndex = CUTS_TABS.findIndex(({ label }) => label === selected);
  const tabWidthPercent = 100 / CUTS_TABS.length;
  const indicatorLeftPercent = tabWidthPercent * selectedIndex + tabWidthPercent / 2;

  return { indicatorLeftPercent };
};
