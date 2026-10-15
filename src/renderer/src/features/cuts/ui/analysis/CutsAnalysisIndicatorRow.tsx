import { font, lightTheme } from "@heddy/design-tokens";

import type { CutsAnalysisConfidenceLevel } from "@/features/cuts/model/types/CutsAnalysis.types";

interface CutsAnalysisIndicatorRowProps {
  label: string;
  score: number;
  confidence: CutsAnalysisConfidenceLevel;
  /** 거칠기처럼 낮을수록 좋은 지표는 점수를 그대로 좋고 나쁨으로 읽으면 안 된다 */
  higherIsBetter: boolean;
}

const CONFIDENCE_COLOR: Record<CutsAnalysisConfidenceLevel, string> = {
  상: lightTheme.status.success,
  중: lightTheme.status.warning,
  하: lightTheme.status.error,
};

export const CutsAnalysisIndicatorRow = ({
  label,
  score,
  confidence,
  higherIsBetter,
}: CutsAnalysisIndicatorRowProps) => {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <div className="flex items-baseline gap-1.5">
          <span className={font.body.medium} style={{ color: lightTheme.label.neutral }}>
            {label}
          </span>
          {!higherIsBetter && (
            <span className={font.caption.regular} style={{ color: lightTheme.label.assistive }}>
              낮을수록 좋아요
            </span>
          )}
        </div>

        <span className={font.caption.regular} style={{ color: lightTheme.label.assistive }}>
          {score}점 · 신뢰도{" "}
          <span className={font.caption.semiBold} style={{ color: CONFIDENCE_COLOR[confidence] }}>
            {confidence}
          </span>
        </span>
      </div>

      <div
        className="h-1.5 w-full rounded-full"
        style={{ backgroundColor: lightTheme.fill.neutral }}
      >
        <div
          className="h-full rounded-full"
          style={{ width: `${score}%`, backgroundColor: lightTheme.primary.normal }}
        />
      </div>
    </div>
  );
};
