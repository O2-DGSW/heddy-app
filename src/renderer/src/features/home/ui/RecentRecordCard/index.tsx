import { font } from "@heddy/design-tokens";
import { cn } from "@/shared";
import type { RecentRecordCardProps } from "../../model/types";
import arrow from "../../assets/arrow-white.svg";
import colorDot from "../../assets/color-dot.svg";
import edit from "../../assets/edit.svg";
import RatingStars from "../RatingStars";

const RecentRecordCard = ({ record, onClick }: RecentRecordCardProps) => (
  <section
    aria-labelledby="home-recent-title"
    className="overflow-hidden rounded-[15px] bg-[var(--home-surface)] shadow-[0_0_4px_rgb(0_0_0/0.08)]"
  >
    <div className="flex min-h-[35px] items-center justify-between bg-[var(--home-primary)] px-5 text-[var(--home-surface)]">
      <h2 id="home-recent-title" className={font.body.semiBold}>
        최근 시술 기록
      </h2>
      <button
        type="button"
        onClick={onClick}
        className={cn("flex min-h-[35px] items-center gap-1", font.caption.medium)}
        aria-label="시술 기록 전체보기"
      >
        전체보기
        <img src={arrow} alt="" className="rotate-180" />
      </button>
    </div>
    {record && (
      <div className="flex flex-col gap-[15px] p-[15px]">
        <div className="flex items-center gap-[14px]">
          <div className="relative h-24 w-[100px] shrink-0 overflow-hidden rounded-[10px]">
            <img
              src={record.thumbnailUrl}
              alt={`${record.procedureName} 시술 사진`}
              className="absolute left-1/2 top-1/2 size-28 max-w-none -translate-x-1/2 -translate-y-1/2 object-cover"
            />
            <span className="absolute bottom-1 right-1 rounded px-2 py-0.5 text-[10px] text-[var(--home-note)] bg-[color-mix(in_srgb,var(--home-text)_70%,transparent)]">
              {record.daysAgo}
            </span>
          </div>
          <div className="flex min-w-0 flex-col gap-[3px] text-[var(--home-secondary)]">
            <time className={font.caption.medium} dateTime={record.date}>
              {record.date}
            </time>
            <div className="flex flex-wrap items-center gap-1">
              <p className={cn(font.body.semiBold, "text-[var(--home-text)]")}>
                {record.procedureName}
              </p>
              <span className="inline-flex items-center gap-1 rounded-full border border-[var(--home-line)] px-2 py-px text-[10px]">
                <img src={colorDot} alt="" />
                {record.colorName}
              </span>
            </div>
            <p className={font.caption.medium}>
              {record.salonName} · {record.designerName}
            </p>
            <RatingStars rating={record.rating} />
          </div>
        </div>
        <div className="flex min-h-8 items-center gap-3 rounded-[5px] bg-[var(--home-note)] px-2 py-1.5">
          <span
            className={cn(
              "flex shrink-0 items-center gap-1 text-[var(--home-primary)]",
              font.label.medium
            )}
          >
            <img src={edit} alt="" />
            메모
          </span>
          <p className="text-[11px] leading-[1.3] tracking-[-0.02em] text-[var(--home-secondary)]">
            {record.memo}
          </p>
        </div>
      </div>
    )}
  </section>
);
export default RecentRecordCard;
