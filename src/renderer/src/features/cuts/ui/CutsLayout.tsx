import { font, lightTheme } from "@heddy/design-tokens";

import type { CutsLayoutProps } from "@/features/cuts/model/types/CutsLayout.types";

/**
 * 시술기록 목록 레이아웃
 * - 카드가 흰색이라 배경도 흰색이면 경계가 보이지 않는다. 목록 배경을 회색으로 깔아 카드를 구분한다.
 */
export const CutsLayout = ({ children, header }: CutsLayoutProps) => {
  return (
    <div className="flex min-h-full flex-col" style={{ backgroundColor: lightTheme.fill.normal }}>
      <div className="sticky top-0 z-10" style={{ backgroundColor: lightTheme.background.normal }}>
        <h1
          className={`py-2 pt-3 text-center ${font.headline1.bold}`}
          style={{ color: lightTheme.label.neutral, backgroundColor: lightTheme.background.normal }}
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
