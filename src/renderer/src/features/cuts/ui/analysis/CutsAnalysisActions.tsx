import { useNavigate } from "react-router-dom";
import { setDirection } from "@capgo/capacitor-transitions/react";
import { font, lightTheme } from "@heddy/design-tokens";

export const CutsAnalysisActions = () => {
  const navigate = useNavigate();

  const handleShareClick = () => {
    setDirection("forward");
    navigate("../share");
  };

  return (
    <div className="flex gap-2 px-4 pt-6">
      <button
        type="button"
        className={`flex-1 rounded-xl py-3 text-center ${font.label.semiBold}`}
        style={{ border: `1px solid ${lightTheme.line.neutral}`, color: lightTheme.label.neutral }}
      >
        수정
      </button>
      <button
        type="button"
        onClick={handleShareClick}
        className={`flex-1 rounded-xl py-3 text-center ${font.label.semiBold}`}
        style={{ border: `1px solid ${lightTheme.line.neutral}`, color: lightTheme.label.neutral }}
      >
        공유
      </button>
      <button
        type="button"
        className={`flex-1 rounded-xl py-3 text-center ${font.label.semiBold}`}
        style={{ backgroundColor: lightTheme.status.error, color: lightTheme.background.normal }}
      >
        삭제
      </button>
    </div>
  );
};
