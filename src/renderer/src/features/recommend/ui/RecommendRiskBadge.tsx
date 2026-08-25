import { font, lightTheme } from "@heddy/design-tokens";

import type { RecommendRiskLevel } from "@/features/recommend/model/types/Recommend.types";

interface RecommendRiskBadgeProps {
  riskLevel: RecommendRiskLevel;
}

export const RecommendRiskBadge = ({ riskLevel }: RecommendRiskBadgeProps) => {
  return (
    <span
      aria-label={`관리 난이도 ${riskLevel}`}
      className={`inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${font.caption.bold}`}
      style={{ backgroundColor: lightTheme.status.info, color: lightTheme.background.normal }}
    >
      {riskLevel}
    </span>
  );
};
