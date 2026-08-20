import { useNavigate } from "react-router-dom";
import { font, lightTheme } from "@heddy/design-tokens";

export const CutsAnalysisActions = () => {
  const navigate = useNavigate();

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
        onClick={() => navigate("../share")}
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
