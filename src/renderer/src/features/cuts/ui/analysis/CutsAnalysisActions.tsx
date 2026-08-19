import { font, lightTheme } from "@heddy/design-tokens";

export const CutsAnalysisActions = () => {
  return (
    <div
      className="fixed inset-x-0 z-20 flex gap-2 px-4"
      style={{ bottom: "calc(100px + var(--safe-area-inset-bottom, env(safe-area-inset-bottom, 0px)))" }}
    >
      <button
        type="button"
        className={`flex-1 rounded-xl py-3 text-center shadow-[0_4px_12px_rgba(0,0,0,0.1)] ${font.label.semiBold}`}
        style={{
          backgroundColor: lightTheme.background.normal,
          border: `1px solid ${lightTheme.line.neutral}`,
          color: lightTheme.label.neutral,
        }}
      >
        수정
      </button>
      <button
        type="button"
        className={`flex-1 rounded-xl py-3 text-center shadow-[0_4px_12px_rgba(0,0,0,0.1)] ${font.label.semiBold}`}
        style={{
          backgroundColor: lightTheme.background.normal,
          border: `1px solid ${lightTheme.line.neutral}`,
          color: lightTheme.label.neutral,
        }}
      >
        공유
      </button>
      <button
        type="button"
        className={`flex-1 rounded-xl py-3 text-center shadow-[0_4px_12px_rgba(0,0,0,0.15)] ${font.label.semiBold}`}
        style={{ backgroundColor: lightTheme.status.error, color: lightTheme.background.normal }}
      >
        삭제
      </button>
    </div>
  );
};
