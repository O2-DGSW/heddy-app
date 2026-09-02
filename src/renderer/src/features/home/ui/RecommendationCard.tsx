import { font, lightTheme } from "@heddy/design-tokens";

import bookmarkIcon from "@/pages/home/assets/bookmark.svg";
import colorDotIcon from "@/pages/home/assets/color-dot.svg";
import type { RecommendationCardProps } from "@/pages/home/model/types.ts";

import CroppedHairImage from "./CroppedHairImage.tsx";

const RecommendationCard = ({ card, onClick }: RecommendationCardProps) => {
  return (
    <button
      type="button"
      className="h-[231px] overflow-hidden rounded-[12px] p-[8px] text-left shadow-[0_0_6px_rgba(0,0,0,0.02)] active:scale-[0.99]"
      style={{ backgroundColor: lightTheme.background.normal }}
      onClick={onClick}
    >
      <span className="flex h-full flex-col gap-4">
        <span className="relative block h-[95px] overflow-hidden rounded-[12px]">
          <CroppedHairImage alt={`${card.title} 추천 사진`} src={card.imageUrl || undefined} />
          <span
            aria-hidden="true"
            className="absolute bottom-[5px] right-[5px] flex size-[23px] items-center justify-center rounded-full"
            style={{ backgroundColor: "rgba(60,62,63,0.7)" }}
          >
            <img src={bookmarkIcon} alt="" className="size-[15px]" />
          </span>
        </span>

        <span className="flex flex-col gap-3">
          <span className="flex items-center gap-2">
            <span
              className={`${font.caption.semiBold} flex size-[18px] items-center justify-center rounded-full`}
              style={{
                backgroundColor: lightTheme.primary.normal,
                color: lightTheme.label.buttonText,
              }}
            >
              {card.rank}
            </span>
            <span
              className={`${font.body.bold} truncate`}
              style={{ color: lightTheme.label.neutral }}
            >
              {card.title}
            </span>
          </span>

          <span
            className="inline-flex h-5 w-fit items-center gap-[6px] rounded-[15px] border px-2"
            style={{
              backgroundColor: lightTheme.background.normal,
              borderColor: lightTheme.fill.neutral,
              color: lightTheme.label.alternative,
            }}
          >
            <img src={colorDotIcon} alt="" className="h-3 w-[11px]" />
            <span className={font.caption.regular}>{card.colorName}</span>
          </span>

          <span className="flex flex-wrap gap-[5px]">
            {card.tags.map(tag => (
              <span
                key={tag}
                className={`${font.caption.medium} rounded-[5px] px-[6px] py-[2px]`}
                style={{
                  backgroundColor: lightTheme.fill.neutral,
                  color: lightTheme.label.alternative,
                }}
              >
                # {tag}
              </span>
            ))}
          </span>
        </span>
      </span>
    </button>
  );
};

export default RecommendationCard;
