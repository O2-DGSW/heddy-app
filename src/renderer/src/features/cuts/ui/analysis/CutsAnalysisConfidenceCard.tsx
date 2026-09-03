import { font, lightTheme } from "@heddy/design-tokens";

import { CutsConfidenceRing } from "@/features/cuts/ui/analysis/CutsConfidenceRing";

interface CutsAnalysisConfidenceCardProps {
  percent: number;
  description: string;
}

export const CutsAnalysisConfidenceCard = ({
  percent,
  description,
}: CutsAnalysisConfidenceCardProps) => {
  return (
    <div
      className="mx-4 mt-4 flex items-center justify-between gap-3 rounded-2xl p-4"
      style={{
        backgroundColor: lightTheme.background.normal,
        boxShadow: "0 0 6px rgba(0,0,0,0.07)",
      }}
    >
      <div className="flex flex-col gap-1">
        <span className={font.headline1.bold} style={{ color: lightTheme.label.neutral }}>
          결과 신뢰도 {percent}%
        </span>
        <span className={font.caption.regular} style={{ color: lightTheme.label.assistive }}>
          {description}
        </span>
      </div>

      <CutsConfidenceRing percent={percent} />
    </div>
  );
};
