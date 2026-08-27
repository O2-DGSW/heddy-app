import { font, lightTheme } from "@heddy/design-tokens";

import { RecommendCard } from "@/features/recommend/ui/RecommendCard";
import type { RecommendationItem } from "@/features/recommend/model/types/Recommend.types";

interface RecommendResultSectionProps {
  recommendations: RecommendationItem[];
}

export const RecommendResultSection = ({ recommendations }: RecommendResultSectionProps) => {
  return (
    <section aria-labelledby="recommend-result-title" className="flex flex-col gap-3 px-4 pt-5">
      <h2
        className={font.headline1.bold}
        id="recommend-result-title"
        style={{ color: lightTheme.label.normal }}
      >
        추천 결과 Top 3
      </h2>
      <ul className="flex flex-col gap-3">
        {recommendations.map((recommendation, index) => (
          <li key={recommendation.id}>
            <RecommendCard rank={index + 1} recommendation={recommendation} />
          </li>
        ))}
      </ul>
    </section>
  );
};
