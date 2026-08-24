import { useNavigate } from "react-router-dom";
import { setDirection } from "@capgo/capacitor-transitions/react";
import { font, lightTheme } from "@heddy/design-tokens";

import { CutsDetailTabBar } from "@/features/cuts/ui/CutsDetailTabBar";
import { arrowIcon } from "@/entities/record";
import type { CutsDetailLayoutProps } from "@/features/cuts/model/types/CutsDetailLayout.types";

export const CutsDetailLayout = ({ title, children }: CutsDetailLayoutProps) => {
  const navigate = useNavigate();

  const handleBack = () => {
    setDirection("back");
    navigate(-1);
  };

  return (
    // cap-page로 감싸는 전환 애니메이션은 페이지가 자기 높이(h-full) 안에서 직접
    // 스크롤하는 걸 전제로 한다 (PAGE_SCROLL_PATHS에 "/cuts" 등록됨, <main>이 아님).
    <div className="flex h-full flex-col overflow-hidden">
      {/* 헤더는 스크롤 컨테이너(아래 flex-1 div) 밖의 별도 flex 아이템이라 sticky 없이도 고정된다. */}
      <div className="shrink-0" style={{ backgroundColor: lightTheme.background.normal }}>
        <div className="relative flex h-[58px] items-center justify-center">
          <button
            type="button"
            onClick={handleBack}
            aria-label="뒤로 가기"
            className="absolute left-[14px] flex h-[44px] w-[44px] items-center justify-start border-0 bg-transparent p-0"
          >
            <img alt="" className="h-[20px] w-[20px]" src={arrowIcon} />
          </button>
          <h1 className={font.headline1.bold} style={{ color: lightTheme.label.neutral }}>
            {title}
          </h1>
        </div>
        <CutsDetailTabBar />
      </div>
      {/* NavBar 여백은 <main>의 pb-[116px]가 이미 확보한다 — 여기서 또 더하면 간격이 겹으로 벌어진다. */}
      <div className="relative flex flex-1 flex-col overflow-y-auto overscroll-none pb-[15px] [-webkit-overflow-scrolling:touch]">
        {children}
      </div>
    </div>
  );
};
