import { useState } from "react";
import { font, lightTheme } from "@heddy/design-tokens";
import type { ArStyleType } from "../model/home.types";
import { ArrowIcon, cn } from "@/shared";
import { useHorizontalSwipe } from "@/shared/lib";
import HomeImage from "./HomeImage";
import SectionFeedback from "./SectionFeedback";
import HomeSectionSkeleton from "./HomeSectionSkeleton";

interface ArStyleSectionProps {
  styles: ArStyleType[];
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  /** 저장한 스타일이 없을 때 AR 화면으로 보내 스타일을 저장하게 한다 */
  onArClick: () => void;
}

const ArStyleSection = ({
  styles,
  isLoading,
  isError,
  onRetry,
  onArClick,
}: ArStyleSectionProps) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const swipe = useHorizontalSwipe({
    onSwipeLeft: () => setSelectedIndex(index => (index + 1) % Math.max(styles.length, 1)),
    onSwipeRight: () =>
      setSelectedIndex(index => (index + styles.length - 1) % Math.max(styles.length, 1)),
    minDistance: 30,
  });
  const activeStyle = styles[selectedIndex % Math.max(styles.length, 1)];
  const styleName = activeStyle?.name?.trim() || "저장한 스타일";

  const handlePrevious = () =>
    setSelectedIndex(index => (index + styles.length - 1) % Math.max(styles.length, 1));
  const handleNext = () => setSelectedIndex(index => (index + 1) % Math.max(styles.length, 1));

  return (
    <section aria-labelledby="home-ar-title" className="min-w-0">
      <div className="mb-3 flex min-h-11 items-center justify-between gap-3">
        <h2 id="home-ar-title" className={font.headline2.bold}>
          눈여겨본 AR 스타일
        </h2>
        <button
          type="button"
          onClick={onArClick}
          className={cn(
            font.caption.medium,
            "flex min-h-11 shrink-0 items-center gap-1 text-[var(--home-secondary)]"
          )}
        >
          AR 체험
          <ArrowIcon className="size-2.5 rotate-180" color={lightTheme.label.alternative} />
        </button>
      </div>
      {activeStyle ? (
        <div className="overflow-hidden rounded-3xl border border-[var(--home-line)] bg-[var(--home-surface)] p-3">
          <figure {...swipe} className="flex min-w-0 flex-col gap-3">
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
              <HomeImage
                src={activeStyle.imageUrl ?? undefined}
                alt={styleName}
                className="absolute inset-0 size-full object-cover"
              />
              {styles.length > 1 && (
                <>
                  <button
                    type="button"
                    aria-label="이전 저장 스타일"
                    onClick={handlePrevious}
                    className="absolute left-2 top-1/2 flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-[var(--home-surface)]/90"
                  >
                    <ArrowIcon className="size-3" color={lightTheme.primary.normal} />
                  </button>
                  <button
                    type="button"
                    aria-label="다음 저장 스타일"
                    onClick={handleNext}
                    className="absolute right-2 top-1/2 flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-[var(--home-surface)]/90"
                  >
                    <ArrowIcon className="size-3 rotate-180" color={lightTheme.primary.normal} />
                  </button>
                </>
              )}
            </div>
            <figcaption
              aria-live="polite"
              title={styleName}
              className={cn("truncate px-1 pb-1 text-center", font.label.semiBold)}
            >
              {styleName}
            </figcaption>
          </figure>
        </div>
      ) : isLoading ? (
        <div className="overflow-hidden rounded-3xl border border-[var(--home-line)] bg-[var(--home-surface)]">
          <HomeSectionSkeleton variant="saved-style" />
        </div>
      ) : (
        <SectionFeedback
          isError={isError}
          emptyMessage="현재 저장한 AR 스타일이 없습니다."
          actionLabel={isError ? "다시 시도" : "AR로 미리보기"}
          onAction={isError ? onRetry : onArClick}
        />
      )}
    </section>
  );
};

export default ArStyleSection;
