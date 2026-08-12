import { font, lightTheme } from "@heddy/design-tokens";

import type { CutsLayoutProps } from "@/features/cuts/model/types/CutsLayout.types";

export const CutsLayout = ({ children, header }: CutsLayoutProps) => {
  return (
      <div className="fixed inset-0 grid grid-rows-[auto_auto_1fr] overflow-hidden pt-safe">
        <h1
            className={`py-2 pt-3 text-center ${font.headline1.bold}`}
            style={{ color: lightTheme.label.neutral, backgroundColor: lightTheme.background.normal }}
        >
          시술기록
        </h1>
        <div style={{ backgroundColor: lightTheme.background.normal }}>{header}</div>
        <div className="relative flex flex-col overflow-y-auto scrollbar-hidden pb-[calc(100px+var(--safe-area-inset-bottom,env(safe-area-inset-bottom,0px)))]">
          {children}
        </div>
      </div>
  );
};