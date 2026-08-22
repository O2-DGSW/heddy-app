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
      {/* NavBar는 세이프에어리어만큼 커지지 않는 고정 106px라, 여기서도 safe-area를 더하면 안 된다. */}
      <div className="relative flex flex-1 flex-col pb-[116px]">
        {children}
      </div>
    </div>
  );
};
