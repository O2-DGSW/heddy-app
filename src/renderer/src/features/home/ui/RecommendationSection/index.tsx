import { font } from "@heddy/design-tokens";
import type { RecommendationSectionProps } from "../../model/types";
import arrow from "../../assets/arrow-green.svg";
import SectionFeedback from "../SectionFeedback";
import RecommendationCard from "../RecommendationCard";

const RecommendationSection = ({
  recommendations,
  isLoading = false,
  isError = false,
  onMoreClick,
  onRecommendationClick,
}: RecommendationSectionProps) => (
  <section
    aria-labelledby="home-recommendation-title"
    className="min-w-0 rounded-[10px] bg-[var(--home-surface)] px-3 pt-3 pb-3 shadow-[0_0_4px_rgb(0_0_0/0.08)]"
  >
    <div className="flex items-center justify-between gap-1">
      <h2 id="home-recommendation-title" className={font.label.semiBold}>
        스타일 추천
      </h2>
      <button
        type="button"
        onClick={onMoreClick}
        aria-label="스타일 추천 더보기"
        className="-my-2 flex min-h-9 items-center gap-0.5 whitespace-nowrap text-[10px] text-[var(--home-primary)]"
      >
        더보기
        <img src={arrow} alt="" className="rotate-180" />
      </button>
    </div>
    {recommendations.length > 0 && !isLoading && !isError ? (
      <>
        <div className="mt-[6px]">
          {recommendations.slice(0, 3).map(card => (
            <RecommendationCard key={card.id} card={card} onClick={onRecommendationClick} />
          ))}
        </div>
        <p className="mt-2 text-[8px] leading-[1.3] text-[var(--home-muted)]">
          ※ 자세한 내용은 ‘추천’에서 확인해 보세요.
        </p>
      </>
    ) : (
      <SectionFeedback
        isLoading={isLoading}
        isError={isError}
        emptyMessage="현재 추천 정보가 없습니다."
        actionLabel="스타일 추천받기"
        onAction={onMoreClick}
      />
    )}
  </section>
);
export default RecommendationSection;
