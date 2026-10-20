import { font, lightTheme } from "@heddy/design-tokens";
import { ArrowIcon, cn } from "@/shared";
import colorDot from "../assets/color-dot.svg";
import edit from "../assets/edit.svg";
import HomeImage from "./HomeImage";
import SectionFeedback from "./SectionFeedback";
import HomeSectionSkeleton from "./HomeSectionSkeleton";
import RatingStars from "./RatingStars";

import type { RecentRecordType } from "../model/home.types";

interface RecentRecordCardProps {
  onAddClick: () => void;
  record?: RecentRecordType | null;
  isLoading?: boolean;
  isError?: boolean;
  onClick: () => void;
}

const RecentRecordCard = ({
  record,
  onClick,
  onAddClick,
  isLoading = false,
  isError = false,
}: RecentRecordCardProps) => (
  <section aria-labelledby="home-recent-title" className="min-w-0">
    <div className="mb-3 flex min-h-9 items-center justify-between gap-3">
      <h2 id="home-recent-title" className={font.headline2.bold}>
        나의 헤어 기록
      </h2>
      <button
        type="button"
        onClick={onClick}
        className={cn(
          "flex min-h-11 items-center gap-1 text-[var(--home-secondary)]",
          font.caption.medium
        )}
        aria-label="시술 기록 전체보기"
      >
        전체보기
        <ArrowIcon className="size-2.5 rotate-180" color={lightTheme.label.alternative} />
      </button>
    </div>
    {record ? (
      <div className="overflow-hidden rounded-3xl border border-[var(--home-line)] bg-[var(--home-surface)] p-4">
        <div className="flex items-center gap-[14px]">
          <div className="relative size-24 shrink-0 overflow-hidden rounded-2xl">
            <HomeImage
              src={record.thumbnailUrl}
              loading="eager"
              alt={`${record.procedureName} 시술 사진`}
              className="absolute inset-0 size-full object-cover"
            />
          </div>
          <div className="flex min-w-0 flex-1 flex-col gap-1.5 text-[var(--home-secondary)]">
            <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1">
              <time className={font.caption.medium} dateTime={record.date}>
                {record.date}
              </time>
              {record.daysAgo && (
                <span
                  className={cn(font.caption.medium, "ml-auto shrink-0 text-[var(--home-muted)]")}
                >
                  {record.daysAgo}
                </span>
              )}
            </div>
            <div className="flex flex-col items-start gap-1.5">
              <p className={cn(font.body.semiBold, "text-[var(--home-text)]")}>
                {record.procedureName}
              </p>
              {record.colorName && (
                <span
                  className={cn(
                    font.caption.medium,
                    "inline-flex items-center gap-1 rounded-full bg-[var(--home-background)] px-2 py-0.5"
                  )}
                >
                  <img src={colorDot} alt="" width={10} height={10} />
                  {record.colorName}
                </span>
              )}
            </div>
            <p className={font.caption.medium}>
              {record.salonName} · {record.designerName}
            </p>
            <RatingStars rating={record.rating} />
          </div>
        </div>
        {record.memo?.trim() && (
          <p
            className={cn(
              font.caption.medium,
              "mt-4 border-t border-[var(--home-line)] pt-3 text-[var(--home-secondary)]"
            )}
          >
            {record.memo}
          </p>
        )}
      </div>
    ) : isLoading || isError ? (
      <div className="rounded-3xl border border-[var(--home-line)] bg-[var(--home-surface)]">
        {isLoading ? (
          <HomeSectionSkeleton variant="record" />
        ) : (
          <SectionFeedback
            isError={isError}
            emptyMessage="현재 시술 기록이 없습니다."
            actionLabel={isError ? "다시 시도" : "첫 기록 추가하기"}
            onAction={isError ? onClick : onAddClick}
          />
        )}
      </div>
    ) : (
      <button
        type="button"
        onClick={onAddClick}
        className="flex w-full items-center gap-3 rounded-3xl border border-[var(--home-line)] bg-[var(--home-surface)] px-4 py-3 text-left transition-colors active:bg-[var(--home-soft)]"
      >
        <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-[var(--home-soft)]">
          <img src={edit} alt="" width={22} height={22} />
        </span>
        <span className="flex min-w-0 flex-1 flex-col gap-1">
          <span className={font.body.semiBold}>오늘의 스타일을 남겨보세요</span>
          <span
            className={cn(
              font.caption.semiBold,
              "inline-flex items-center gap-1 text-[var(--home-primary)]"
            )}
          >
            첫 기록 남기기
            <img src={edit} alt="" width={14} height={14} />
          </span>
        </span>
      </button>
    )}
  </section>
);
export default RecentRecordCard;
