import { font, lightTheme } from "@heddy/design-tokens";

import { CutsAnalysisIndicatorRow } from "@/features/cuts/ui/analysis/CutsAnalysisIndicatorRow";
import type { CutsAnalysisIndicator } from "@/features/cuts/model/types/CutsAnalysis.types";

interface CutsAnalysisIndicatorListProps {
  indicators: CutsAnalysisIndicator[];
}

export const CutsAnalysisIndicatorList = ({ indicators }: CutsAnalysisIndicatorListProps) => {
  return (
    <section className="flex flex-col gap-4 px-4 pt-6">
      <h2 className={font.headline2.bold} style={{ color: lightTheme.label.neutral }}>
        상태 지표
      </h2>

      <div className="flex flex-col gap-5">
        {indicators.map(indicator => (
          <CutsAnalysisIndicatorRow
            key={indicator.id}
            label={indicator.label}
            score={indicator.score}
            confidence={indicator.confidence}
            higherIsBetter={indicator.higherIsBetter}
          />
        ))}
      </div>
    </section>
  );
};
