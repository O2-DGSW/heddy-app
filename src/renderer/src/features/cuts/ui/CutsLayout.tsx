import { lightTheme } from "@heddy/design-tokens";

import { PageTitle } from "@/shared";
import type { CutsLayoutProps } from "@/features/cuts/model/types/CutsLayout.types";

export const CutsLayout = ({ children, header, floatingAction }: CutsLayoutProps) => {
  return (
    <div
      className="relative flex h-full flex-col overflow-hidden"
      style={{ backgroundColor: lightTheme.fill.normal }}
    >
      <div className="shrink-0" style={{ backgroundColor: lightTheme.background.normal }}>
        <PageTitle>시술기록</PageTitle>
        {header}
      </div>
      <div className="relative flex flex-1 flex-col overflow-y-auto overscroll-none pb-[15px] no-scrollbar [-webkit-overflow-scrolling:touch]">
        {children}
      </div>
      {floatingAction}
    </div>
  );
};
