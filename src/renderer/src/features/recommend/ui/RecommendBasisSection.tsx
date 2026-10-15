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
      {/* 결과 카드와 같은 카드 위에 올려서 두 섹션이 한 화면에서 따로 놀지 않게 한다 */}
      <div
        className="flex flex-col rounded-2xl px-4 py-1 shadow-[0_1px_6px_rgba(0,0,0,0.06)]"
        style={{ backgroundColor: lightTheme.background.normal }}
      >
        {rows.map(row => (
          <RecommendBasisRow key={row.label} label={row.label} value={row.value} />
        ))}
      </div>
    </section>
  );
};
