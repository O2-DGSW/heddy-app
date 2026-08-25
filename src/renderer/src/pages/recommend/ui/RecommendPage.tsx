import { lightTheme } from "@heddy/design-tokens";

import { RecommendHeader } from "@/features/recommend/ui/RecommendHeader";
import { RecommendResultSection } from "@/features/recommend/ui/RecommendResultSection";
import { RecommendBasisSection } from "@/features/recommend/ui/RecommendBasisSection";
import { dummyRecommendations } from "@/features/recommend/constants/dummyRecommendations";
import { dummyRecommendationBasisRows } from "@/features/recommend/constants/dummyRecommendationBasis";

export const RecommendPage = () => {
  return (
    <section
      aria-labelledby="recommend-title"
      className="flex min-h-full flex-col"
      style={{ backgroundColor: lightTheme.fill.normal }}
    >
      <RecommendHeader />
      <RecommendResultSection recommendations={dummyRecommendations} />
      <RecommendBasisSection rows={dummyRecommendationBasisRows} />
    </section>
  );
};
