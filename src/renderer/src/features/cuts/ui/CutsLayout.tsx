import { font, lightTheme } from "@heddy/design-tokens";

import type { CutsLayoutProps } from "@/features/cuts/model/types/CutsLayout.types";

export const CutsLayout = ({ children, header }: CutsLayoutProps) => {
  return (
    <div className="flex min-h-full flex-col">
      <div className="sticky top-0 z-10" style={{ backgroundColor: lightTheme.background.normal }}>
        <h1
          className={`py-2 pt-3 text-center ${font.headline1.bold}`}
          style={{ color: lightTheme.label.neutral }}
        >
          시술기록
        </h1>
        {header}
      </div>
      <div className="relative flex flex-1 flex-col pb-[calc(100px+var(--safe-area-inset-bottom,env(safe-area-inset-bottom,0px)))]">
        {children}
      </div>
    </div>
  );
};
