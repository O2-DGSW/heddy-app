import { font } from "@heddy/design-tokens";
import { cn } from "@/shared";
import HomeImage from "./HomeImage";
import colorDot from "../assets/recommend-color-dot.svg";

import type { RecommendationCardType } from "../model/home.types";

interface RecommendationCardProps {
  card: RecommendationCardType;
  onClick: () => void;
}

const getRecommendationLabel = (matchRate: number | undefined): string | undefined => {
  if (typeof matchRate !== "number" || !Number.isFinite(matchRate)) return undefined;
  if (matchRate >= 80) return "매우 추천";
  if (matchRate >= 50) return "추천";
  return "도전해볼 스타일";
};

const RecommendationCard = ({ card, onClick }: RecommendationCardProps) => {
  const recommendationLabel = getRecommendationLabel(card.matchRate);

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`${card.rank}위 ${card.title}, ${recommendationLabel ?? "추천 정도 정보 없음"}, 추천 보기`}
      className="flex min-h-24 w-full items-center gap-3 border-b border-[var(--home-line)] py-3 text-left last:border-0"
    >
      <span className="relative block size-16 shrink-0 overflow-hidden rounded-2xl">
        <HomeImage
          src={card.imageUrl}
          alt={`${card.title} 추천 사진`}
          className="absolute inset-0 size-full object-cover"
        />
      </span>
      <span className="flex min-w-0 flex-1 flex-col items-start gap-1.5">
        <span className={cn(font.caption.semiBold, "text-[var(--home-primary)]")}>
          추천 {card.rank}
        </span>
        <span className={cn(font.body.semiBold, "line-clamp-2 min-w-0")}>{card.title}</span>
        {card.colorName && (
          <span
            className={cn(
              font.caption.medium,
              "inline-flex items-center gap-1 text-[var(--home-secondary)]"
            )}
          >
            <img src={colorDot} alt="" width={10} height={10} />
            {card.colorName}
          </span>
        )}
      </span>
      {recommendationLabel && (
        <span
          className={cn(
            font.caption.semiBold,
            "shrink-0 whitespace-nowrap rounded-full bg-[var(--home-soft)] px-2.5 py-1.5 text-[var(--home-share-text)]"
          )}
        >
          {recommendationLabel}
        </span>
      )}
    </button>
  );
};
export default RecommendationCard;
