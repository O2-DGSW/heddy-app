import { font, lightTheme } from "@heddy/design-tokens";

import type { CutsLayoutProps } from "@/features/cuts/model/types/CutsLayout.types";

/**
 * 시술기록 목록 레이아웃
 * - 카드가 흰색이라 배경도 흰색이면 경계가 보이지 않는다. 목록 배경을 회색으로 깔아 카드를 구분한다.
 */
export const CutsLayout = ({ children, header }: CutsLayoutProps) => {
  return (
    // cap-page로 감싸는 전환 애니메이션은 페이지가 자기 높이(h-full) 안에서
    // 직접 스크롤하는 걸 전제로 한다. <main>에 얹혀 스크롤하던 이전 방식과 달리
    // 여기서 직접 overflow-y-auto를 갖는다 (PAGE_SCROLL_PATHS에 "/cuts" 등록됨).
    <div
      className="flex h-full flex-col overflow-hidden"
      style={{ backgroundColor: lightTheme.fill.normal }}
    >
      {/* 헤더는 스크롤 컨테이너(아래 flex-1 div) 밖의 별도 flex 아이템이라 sticky 없이도 고정된다. */}
      <div className="shrink-0" style={{ backgroundColor: lightTheme.background.normal }}>
        <h1
          className={`py-2 pt-3 text-center ${font.headline1.bold}`}
          style={{ color: lightTheme.label.neutral, backgroundColor: lightTheme.background.normal }}
        >
          시술기록
        </h1>
        {header}
      </div>
      {/* NavBar 여백은 <main>의 pb-[var(--nav-bar-height)]가 이미 확보한다 — 여기서 또 더하면 간격이 겹으로 벌어진다. */}
      <div className="relative flex flex-1 flex-col overflow-y-auto overscroll-none pb-[15px] no-scrollbar [-webkit-overflow-scrolling:touch]">
        {children}
      </div>
    </div>
  );
};
