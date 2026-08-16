import { useNavigate } from "react-router-dom";
import { font, lightTheme } from "@heddy/design-tokens";

import { CutsDetailTabBar } from "@/features/cuts/ui/CutsDetailTabBar";
import { CutsChevronLeftIcon } from "@/features/cuts/ui/icons/CutsChevronLeftIcon";
import type { CutsDetailLayoutProps } from "@/features/cuts/model/types/CutsDetailLayout.types";

export const CutsDetailLayout = ({ title, children }: CutsDetailLayoutProps) => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-full flex-col">
      <div className="sticky top-0 z-10" style={{ backgroundColor: lightTheme.background.normal }}>
        <div className="relative flex items-center justify-center py-2 pt-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            aria-label="뒤로가기"
            className="absolute left-0 flex h-8 w-8 items-center justify-center"
          >
            <CutsChevronLeftIcon />
          </button>
          <h1 className={`text-center ${font.headline1.bold}`} style={{ color: lightTheme.label.neutral }}>
            {title}
          </h1>
        </div>
        <CutsDetailTabBar />
      </div>
      <div className="relative flex flex-1 flex-col pb-[calc(100px+var(--safe-area-inset-bottom,env(safe-area-inset-bottom,0px)))]">
        {children}
      </div>
    </div>
  );
};
