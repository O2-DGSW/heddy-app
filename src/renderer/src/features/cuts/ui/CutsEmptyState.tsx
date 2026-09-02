import { font, lightTheme } from "@heddy/design-tokens";

import agerSad from "@/shared/assets/agerSad.svg";

export const CutsEmptyState = () => {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 px-4">
      <img src={agerSad} alt="시술기록 없음" className="h-28 w-28" />
      <p
        className={`text-center ${font.body.regular}`}
        style={{ color: lightTheme.label.assistive }}
      >
        시술기록이
        <br />
        존재하지 않아요
      </p>
    </div>
  );
};
