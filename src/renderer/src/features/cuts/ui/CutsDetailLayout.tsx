import { useNavigate } from "react-router-dom";
import { font, lightTheme } from "@heddy/design-tokens";

import { CutsDetailTabBar } from "@/features/cuts/ui/CutsDetailTabBar";
import { arrowIcon } from "@/entities/record";
import type { CutsDetailLayoutProps } from "@/features/cuts/model/types/CutsDetailLayout.types";

export const CutsDetailLayout = ({ title, children }: CutsDetailLayoutProps) => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-full flex-col">
      <div className="sticky top-0 z-10" style={{ backgroundColor: lightTheme.background.normal }}>
        <div className="relative flex h-[58px] items-center justify-center">
          <button
            type="button"
            onClick={() => navigate(-1)}
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
      <div className="relative flex flex-1 flex-col pb-[calc(116px+var(--safe-area-inset-bottom,env(safe-area-inset-bottom,0px)))]">
        {children}
      </div>
    </div>
  );
};
