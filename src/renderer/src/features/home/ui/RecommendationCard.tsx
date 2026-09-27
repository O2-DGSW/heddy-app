import type { RecommendationCardProps } from "../model/types";
import HomeImage from "./HomeImage";
import arrow from "../assets/arrow.svg";
import colorDot from "../assets/recommend-color-dot.svg";

const RecommendationCard = ({ card, onClick }: RecommendationCardProps) => (
  <button
    type="button"
    onClick={onClick}
    aria-label={`${card.rank}위 ${card.title}, ${typeof card.matchRate === "number" && Number.isFinite(card.matchRate) ? `일치도 ${card.matchRate}%` : "일치도 정보 없음"}, 추천 보기`}
    className="flex min-h-[58px] w-full items-center gap-[7px] border-b border-[var(--home-line)] py-[5px] text-left last:border-0 [&_span]:leading-[1.3]"
  >
    <span className="relative block size-11 shrink-0 overflow-hidden rounded-md">
      <HomeImage
        src={card.imageUrl}
        alt={`${card.title} 추천 사진`}
        className="absolute left-[-2px] top-[-8px] h-[83px] w-12 max-w-none"
      />
    </span>
    <span className="flex min-w-0 flex-1 flex-col items-start gap-1">
      <span className="flex items-center gap-1">
        <span className="flex size-[10px] shrink-0 items-center justify-center rounded-full bg-[var(--home-primary)] text-[8px] font-semibold text-[var(--home-note)]">
          {card.rank}
        </span>
        <span className="text-[10px] font-semibold">{card.title}</span>
      </span>
      <span className="inline-flex items-center gap-0.5 rounded-full border-[0.5px] border-[var(--home-banner)] bg-[var(--home-background)] px-0.5 py-px text-[7px] text-[var(--home-secondary)]">
        {card.colorName && <img src={colorDot} alt="" />}
        {card.colorName || "컬러 정보 없음"}
      </span>
      <span className="rounded-full bg-[var(--home-soft)] px-[3px] py-px text-[7px] font-medium text-[var(--home-primary)]">
        {typeof card.matchRate === "number" && Number.isFinite(card.matchRate)
          ? `일치도 ${card.matchRate}%`
          : "일치도 정보 없음"}
      </span>
    </span>
    <img src={arrow} alt="" className="shrink-0 rotate-180" />
  </button>
);
export default RecommendationCard;
