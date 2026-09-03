import { font, lightTheme } from "@heddy/design-tokens";

import arrowIcon from "@/pages/home/assets/arrow.svg";
import type { RecommendationSectionProps } from "@/pages/home/model/types.ts";

import RecommendationCard from "./RecommendationCard.tsx";

const RecommendationSection = ({
  recommendations,
  isLoading = false,
  isError = false,
  onMoreClick,
  onRecommendationClick,
}: RecommendationSectionProps) => {
  const hasRecommendations = recommendations.length > 0;

  return (
    <section
      aria-labelledby="home-recommendation-title"
      className="mt-[clamp(18px,3.7svh,36px)] flex min-h-0 flex-1 flex-col pt-[clamp(12px,1.7svh,15px)]"
      style={{ backgroundColor: lightTheme.fill.normal }}
    >
      <div className="mx-auto flex w-[calc(100%_-_42px)] max-w-[360px] items-center justify-between">
        <h2
          id="home-recommendation-title"
          className={font.headline2.semiBold}
          style={{ color: lightTheme.label.alternative }}
        >
          스타일 추천
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

      <div className="mx-auto mt-[clamp(10px,1.6svh,14px)] grid min-h-0 w-[calc(100%_-_42px)] max-w-[360px] flex-1 auto-rows-[minmax(0,1fr)] grid-cols-2 gap-[clamp(8px,2.8vw,12px)] pb-[clamp(10px,1.8svh,16px)]">
        {hasRecommendations ? (
          recommendations.map(card => (
            <RecommendationCard key={card.id} card={card} onClick={onRecommendationClick} />
          ))
        ) : (
          <div
            className={`col-span-2 flex h-full min-h-0 items-center justify-center rounded-[12px] text-center ${font.label.medium}`}
            style={{
              backgroundColor: lightTheme.background.normal,
              color: lightTheme.label.assistive,
            }}
          >
            {isLoading
              ? "추천을 불러오는 중입니다"
              : isError
                ? "추천을 불러오지 못했습니다"
                : "아직 추천 결과가 없습니다"}
          </div>
        )}
      </div>
    </section>
  );
};

export default RecommendationSection;
