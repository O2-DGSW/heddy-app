import { TabBar } from "@/private/shared/ui/tab-bar";

import { CUTS_TABS } from "@/features/cuts/constrants/tabs";

/**
 * 시술기록 페이지 탭바
 * - 공통 TabBar 컴포넌트에 cuts 전용 탭 목록을 전달
 */
export const CutsTabBar = () => {
  return <TabBar tabs={CUTS_TABS} />;
};
