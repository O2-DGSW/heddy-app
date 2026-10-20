import { font, lightTheme } from "@heddy/design-tokens";
import { ArrowIcon, cn } from "@/shared";
import SectionFeedback from "./SectionFeedback";
import RecommendationCard from "./RecommendationCard";

import type { RecommendationCardType } from "../model/home.types";

interface RecommendationSectionProps {
  recommendations: RecommendationCardType[];
  isLoading?: boolean;
  isError?: boolean;
  onMoreClick: () => void;
  onRecommendationClick: () => void;
}

const RecommendationSection = ({
  recommendations,
  isLoading = false,
  isError = false,
  onMoreClick,
  onRecommendationClick,
}: RecommendationSectionProps) => (
  <section aria-labelledby="home-recommendation-title" className="min-w-0">
    <div className="mb-3 flex min-h-9 items-center justify-between gap-3">
      <h2 id="home-recommendation-title" className={font.headline2.bold}>
        나에게 어울리는 스타일
      </h2>
      <button
        type="button"
        onClick={onMoreClick}
        aria-label="스타일 추천 더보기"
        className={cn(
          font.caption.medium,
          "flex min-h-11 shrink-0 items-center gap-1 text-[var(--home-secondary)]"
        )}
      >
        전체보기
        <ArrowIcon className="size-2.5 rotate-180" color={lightTheme.label.alternative} />
      </button>
    </div>
    <div className="overflow-hidden rounded-3xl border border-[var(--home-line)] bg-[var(--home-surface)]">
      {recommendations.length > 0 && !isLoading && !isError ? (
        <div className="px-4 py-1">
          {recommendations.slice(0, 3).map(card => (
            <RecommendationCard key={card.id} card={card} onClick={onRecommendationClick} />
          ))}
        </div>
      ) : isLoading || isError ? (
        <SectionFeedback
          isLoading={isLoading}
          isError={isError}
          emptyMessage="현재 추천 정보가 없습니다."
          actionLabel={isError ? "다시 시도" : "스타일 추천받기"}
          onAction={onMoreClick}
        />
      ) : (
        <div className="p-5">
          <span
            className={cn(
              font.caption.semiBold,
              "inline-flex rounded-full bg-[var(--home-soft)] px-2.5 py-1 text-[var(--home-share-text)]"
            )}
          >
            AI 스타일 추천
          </span>
          <h3 className={cn(font.body.semiBold, "mt-3 break-keep")}>어떤 머리가 잘 어울릴까요?</h3>
          <p className={cn(font.label.regular, "mt-2 break-keep text-[var(--home-secondary)]")}>
            내 취향과 시술 기록을 바탕으로
            <br />
            다음 스타일의 힌트를 찾아보세요.
          </p>
          <button
            type="button"
            onClick={onMoreClick}
            className={cn(
              font.label.semiBold,
              "mt-4 flex min-h-11 w-full items-center justify-center rounded-xl bg-[var(--home-soft)] px-4 text-[var(--home-share-text)] transition-opacity active:opacity-80"
            )}
          >
            나만의 추천 받기
          </button>
        </div>
      )}
    </div>
  </section>
);
export default RecommendationSection;
