import { font, lightTheme } from "@design-tokens";

import type { CutsLayoutProps } from "@/features/cuts/model/types/CutsLayout.types";

export const CutsLayout = ({ children }: CutsLayoutProps) => {
  return (
      <div className="fixed inset-0 grid grid-rows-[auto_1fr] overflow-hidden pt-safe">
        <h1
            className={`py-2 pt-3 text-center ${font.headline1.bold}`}
            style={{ color: lightTheme.label.neutral }}
        >
          시술기록
        </h1>
        <div className="relative overflow-hidden">
          {children}
        </div>
      </div>
  );
};