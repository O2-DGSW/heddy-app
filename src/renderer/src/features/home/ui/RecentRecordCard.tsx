import { font, lightTheme } from "@heddy/design-tokens";

import { RECENT_RECORD } from "@/pages/home/model/constants.ts";
import type { RecentRecordCardProps } from "@/pages/home/model/types.ts";

import CroppedHairImage from "./CroppedHairImage.tsx";
import RatingStars from "./RatingStars.tsx";

const RecentRecordCard = ({ onClick }: RecentRecordCardProps) => {
  return (
    <button
      type="button"
      className="h-[228px] overflow-hidden rounded-[10px] p-[14px] text-left shadow-[0_0_4px_rgba(0,0,0,0.13)] active:scale-[0.99]"
      style={{ backgroundColor: lightTheme.background.normal }}
      onClick={onClick}
    >
      <span className="flex h-full flex-col gap-[10px]">
        <span className={font.label.medium} style={{ color: lightTheme.primary.normal }}>
          최근 시술 기록
        </span>

        <span className="block h-[95px] overflow-hidden rounded-[12px]">
          <CroppedHairImage alt="최근 시술 사진" />
        </span>

        <span className="flex min-w-0 flex-col gap-px">
          <span className={font.caption.medium} style={{ color: lightTheme.label.alternative }}>
            {RECENT_RECORD.date}
          </span>
          <span className={font.headline2.semiBold} style={{ color: lightTheme.label.neutral }}>
            {RECENT_RECORD.procedureName}
          </span>
          <span
            className={`${font.caption.medium} block truncate`}
            style={{ color: lightTheme.label.alternative }}
          >
            {RECENT_RECORD.salonName} · {RECENT_RECORD.designerName}
          </span>
          <RatingStars rating={RECENT_RECORD.rating} />
        </span>
      </span>
    </button>
  );
};

export default RecentRecordCard;
