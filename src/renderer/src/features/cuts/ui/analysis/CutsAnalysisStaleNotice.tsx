import { font, lightTheme } from "@heddy/design-tokens";

import { cn } from "@/shared";

interface CutsAnalysisStaleNoticeProps {
  /** 주면 지금 사진으로 다시 분석하는 버튼을 함께 보여 준다 */
  onReanalyze?: () => void;
}

/**
 * 분석 뒤에 사진이 바뀌어 결과가 지금 사진을 반영하지 않는 상태(STALE)를 알린다.
 * 결과 자체는 그대로 내려오므로 화면을 막지 않고 안내만 얹는다.
 */
export const CutsAnalysisStaleNotice = ({ onReanalyze }: CutsAnalysisStaleNoticeProps) => {
  return (
    <div
      className="mx-4 mt-4 flex items-center gap-3 rounded-xl px-3 py-2"
      style={{ backgroundColor: lightTheme.fill.normal }}
    >
      <p
        className={cn("flex-1", font.caption.regular)}
        style={{ color: lightTheme.label.alternative }}
      >
        분석한 뒤에 사진이 바뀌었어요. 아래 결과는 바뀌기 전 사진 기준이에요
      </p>
      {onReanalyze && (
        <button
          className={cn("shrink-0 rounded-[8px] px-[10px] py-[6px]", font.caption.semiBold)}
          onClick={onReanalyze}
          style={{ backgroundColor: lightTheme.primary.normal, color: lightTheme.label.buttonText }}
          type="button"
        >
          다시 분석
        </button>
      )}
    </div>
  );
};
