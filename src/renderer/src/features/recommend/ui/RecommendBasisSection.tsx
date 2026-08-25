import { font, lightTheme } from "@heddy/design-tokens";

import { RecommendBasisRow } from "@/features/recommend/ui/RecommendBasisRow";
import type { RecommendationBasisRow } from "@/features/recommend/model/types/Recommend.types";

interface RecommendBasisSectionProps {
  rows: RecommendationBasisRow[];
}

export const RecommendBasisSection = ({ rows }: RecommendBasisSectionProps) => {
  return (
    <section aria-labelledby="recommend-basis-title" className="flex flex-col gap-3 px-4 pb-6 pt-6">
      <h2
        className={font.headline1.bold}
        id="recommend-basis-title"
        style={{ color: lightTheme.label.normal }}
      >
        추천 근거 데이터
      </h2>
      <div className="flex flex-col px-1">
        {rows.map(row => (
          <RecommendBasisRow key={row.label} label={row.label} value={row.value} />
        ))}
      </div>
    </section>
  );
};
