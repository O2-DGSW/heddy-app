import { font, lightTheme } from "@heddy/design-tokens";

import arrowIcon from "@/pages/home/assets/arrow.svg";
import { RECOMMENDATION_CARDS } from "@/pages/home/model/constants.ts";
import type { RecommendationSectionProps } from "@/pages/home/model/types.ts";

import RecommendationCard from "./RecommendationCard.tsx";

const RecommendationSection = ({
  onMoreClick,
  onRecommendationClick,
}: RecommendationSectionProps) => {
  return (
    <section
      aria-labelledby="home-recommendation-title"
      className="mt-9 min-h-[328px] w-full pt-[15px]"
      style={{ backgroundColor: lightTheme.fill.normal }}
    >
      <div className="mx-auto flex w-[calc(100%_-_42px)] max-w-[360px] items-center justify-between">
        <h2
          id="home-recommendation-title"
          className={font.headline2.semiBold}
          style={{ color: lightTheme.label.alternative }}
        >
          AI 스타일 추천
        </h2>
        <button
          type="button"
          className="flex items-center gap-1 border-0 bg-transparent p-0"
          style={{ color: lightTheme.label.assistive }}
          onClick={onMoreClick}
        >
          <span className={font.label.medium}>더보기</span>
          <img src={arrowIcon} alt="" className="size-[14px] rotate-180" />
        </button>
      </div>

      <div className="mx-auto mt-[14px] grid w-[calc(100%_-_42px)] max-w-[360px] grid-cols-2 gap-3">
        {RECOMMENDATION_CARDS.map(card => (
          <RecommendationCard key={card.id} card={card} onClick={onRecommendationClick} />
        ))}
      </div>
    </section>
  );
};

export default RecommendationSection;
