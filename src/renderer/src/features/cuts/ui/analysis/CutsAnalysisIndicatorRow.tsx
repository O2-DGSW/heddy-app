import { font, lightTheme } from "@heddy/design-tokens";

import type { CutsAnalysisConfidenceLevel } from "@/features/cuts/model/types/CutsAnalysis.types";

interface CutsAnalysisIndicatorRowProps {
  label: string;
  score: number;
  confidence: CutsAnalysisConfidenceLevel;
}

const CONFIDENCE_COLOR: Record<CutsAnalysisConfidenceLevel, string> = {
  상: lightTheme.status.success,
  중: lightTheme.status.warning,
  하: lightTheme.status.error,
};

export const CutsAnalysisIndicatorRow = ({ label, score, confidence }: CutsAnalysisIndicatorRowProps) => {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className={font.body.medium} style={{ color: lightTheme.label.neutral }}>
          {label}
        </span>
        <span className={font.caption.regular} style={{ color: lightTheme.label.assistive }}>
          {score}점 · 신뢰도{" "}
          <span className={font.caption.semiBold} style={{ color: CONFIDENCE_COLOR[confidence] }}>
            {confidence}
          </span>
        </span>
      </div>

      <div className="h-1.5 w-full rounded-full" style={{ backgroundColor: lightTheme.fill.neutral }}>
        <div
          className="h-full rounded-full"
          style={{ width: `${score}%`, backgroundColor: lightTheme.primary.normal }}
        />
      </div>
    </div>
  );
};
