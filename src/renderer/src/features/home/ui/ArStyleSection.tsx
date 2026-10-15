import { useState } from "react";
import { font, lightTheme } from "@heddy/design-tokens";
import type { ArStyleType } from "../model/home.types";
import { ArrowIcon, cn } from "@/shared";
import { useHorizontalSwipe } from "@/shared/lib";
import HomeImage from "./HomeImage";
import SectionFeedback from "./SectionFeedback";

interface ArStyleSectionProps {
  styles: ArStyleType[];
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  onMoreClick: () => void;
}

const ArStyleSection = ({
  styles,
  isLoading,
  isError,
  onRetry,
  onMoreClick,
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
    <section
      aria-labelledby="home-ar-title"
      className="flex min-h-0 min-w-0 flex-col overflow-hidden rounded-[10px] bg-[var(--home-surface)] pt-3 pb-3 shadow-[0_0_4px_rgb(0_0_0/0.08)]"
    >
      <div className="mb-3 flex shrink-0 items-center justify-between gap-1 px-3">
        <h2 id="home-ar-title" className={cn(font.label.semiBold, "whitespace-nowrap")}>
          AR 저장 스타일
        </h2>
        <button
          type="button"
          onClick={onMoreClick}
          aria-label="저장한 AR 스타일 전체보기"
          className="-my-2 flex min-h-9 items-center gap-0.5 whitespace-nowrap text-[10px] text-[var(--home-primary)]"
        >
          전체보기
          <ArrowIcon className="h-2 w-2 rotate-180" color={lightTheme.primary.normal} />
        </button>
      </div>
      {activeStyle && !isLoading && !isError ? (
        <div className="relative h-[190px] min-[375px]:h-auto min-[375px]:min-h-0 min-[375px]:flex-1">
          <figure {...swipe} className="absolute inset-0 flex min-h-0 flex-col gap-2 px-2">
            <div className="relative min-h-0 flex-1 overflow-hidden rounded-lg">
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
                    className="absolute left-1 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-full bg-[var(--home-surface)]/90"
                  >
                    <ArrowIcon className="size-3" color={lightTheme.primary.normal} />
                  </button>
                  <button
                    type="button"
                    aria-label="다음 저장 스타일"
                    onClick={handleNext}
                    className="absolute right-1 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-full bg-[var(--home-surface)]/90"
                  >
                    <ArrowIcon className="size-3 rotate-180" color={lightTheme.primary.normal} />
                  </button>
                </>
              )}
            </div>
            <figcaption
              aria-live="polite"
              title={styleName}
              className={cn("shrink-0 truncate text-center", font.caption.semiBold)}
            >
              {styleName}
            </figcaption>
          </figure>
        </div>
      ) : (
        <SectionFeedback
          isLoading={isLoading}
          isError={isError}
          emptyMessage="현재 저장한 AR 스타일이 없습니다."
          actionLabel={isError ? "다시 시도" : "저장한 스타일 보기"}
          onAction={isError ? onRetry : onMoreClick}
        />
      )}
    </section>
  );
};

export default ArStyleSection;
