import { useState } from "react";
import { font } from "@heddy/design-tokens";
import { cn } from "@/shared";
import { useHorizontalSwipe } from "@/shared/lib";
import type { ArStyleType } from "../../model/types";
import HomeImage from "../HomeImage";
import SectionFeedback from "../SectionFeedback";
import arrow from "../../assets/arrow-green.svg";
import dots from "../../assets/carousel-dots.svg";

interface ArStyleSectionProps {
  isLoading?: boolean;
  isError?: boolean;
  styles: ArStyleType[];
  onMoreClick: () => void;
  onTryClick: (style: ArStyleType) => void;
}
const ArStyleSection = ({
  styles,
  onMoreClick,
  onTryClick,
  isLoading = false,
  isError = false,
}: ArStyleSectionProps) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const swipe = useHorizontalSwipe({
    onSwipeLeft: () => setSelectedIndex(index => (index + 1) % Math.max(styles.length, 1)),
    onSwipeRight: () =>
      setSelectedIndex(index => (index + styles.length - 1) % Math.max(styles.length, 1)),
    minDistance: 30,
  });
  const activeIndex = styles.length ? selectedIndex % styles.length : 0;
  const activeStyle = styles[activeIndex];
  const handlePrevious = () =>
    setSelectedIndex(index => (index + styles.length - 1) % Math.max(styles.length, 1));
  const handleNext = () => setSelectedIndex(index => (index + 1) % Math.max(styles.length, 1));
  return (
    <section
      aria-labelledby="home-ar-title"
      className="min-w-0 overflow-hidden rounded-[10px] bg-[var(--home-surface)] pt-3 pb-3 shadow-[0_0_4px_rgb(0_0_0/0.08)]"
    >
      <div className="flex items-center justify-between gap-1 px-3">
        <h2 id="home-ar-title" className={cn(font.label.semiBold, "whitespace-nowrap")}>
          AR 스타일 체험
        </h2>
        <button
          type="button"
          onClick={onMoreClick}
          aria-label="AR 스타일 전체보기"
          className="-my-2 flex min-h-9 items-center gap-0.5 whitespace-nowrap text-[10px] text-[var(--home-primary)]"
        >
          전체보기
          <img src={arrow} alt="" className="rotate-180" />
        </button>
      </div>
      {activeStyle && !isLoading && !isError ? (
        <>
          <div
            {...swipe}
            aria-roledescription="캐러셀"
            aria-label="AR 스타일 선택"
            className="relative mt-5 flex h-[113px] items-center justify-center"
          >
            {styles.length > 1 && (
              <button
                type="button"
                onClick={handlePrevious}
                aria-label="이전 AR 스타일"
                className="absolute right-[calc(50%+60px)] h-[92px] w-[71px] overflow-hidden rounded-[13px] blur-[1.25px]"
              >
                <HomeImage
                  src={styles[(activeIndex + styles.length - 1) % styles.length]?.imageUrl}
                  alt=""
                  className="absolute left-1/2 top-[-13px] h-[137px] w-[102px] max-w-none -translate-x-1/2 object-cover brightness-60"
                />
              </button>
            )}
            <button
              type="button"
              onClick={() => onTryClick(activeStyle)}
              aria-label={`${activeStyle.name} AR 체험하기`}
              className="relative h-[113px] w-[98px] shrink-0 overflow-hidden rounded-[13px] shadow-[0_2.5px_3.3px_rgb(0_0_0/0.25)]"
            >
              <HomeImage
                src={activeStyle.imageUrl}
                alt={`${activeStyle.name} 미리보기`}
                className="absolute left-1/2 top-[-24px] h-[159px] w-[119px] max-w-none -translate-x-1/2 -rotate-2 object-cover"
              />
              <span
                aria-live="polite"
                className="absolute right-1 bottom-1 rounded bg-[color-mix(in_srgb,var(--home-surface)_70%,transparent)] px-2 py-0.5 text-[8px]"
              >
                {activeStyle.name}
              </span>
            </button>
            {styles.length > 1 && (
              <button
                type="button"
                onClick={handleNext}
                aria-label="다음 AR 스타일"
                className="absolute left-[calc(50%+60px)] h-[92px] w-[71px] overflow-hidden rounded-[13px] blur-[1.25px]"
              >
                <HomeImage
                  src={styles[(activeIndex + 1) % styles.length]?.imageUrl}
                  alt=""
                  className="absolute left-1/2 top-[-13px] h-[137px] w-[102px] max-w-none -translate-x-1/2 object-cover brightness-60"
                />
              </button>
            )}
          </div>
          <div
            className="relative mx-auto mt-2 flex h-5 w-fit items-center justify-center"
            aria-label="AR 스타일 페이지"
          >
            {activeIndex === 0 && styles.length === 3 && (
              <img src={dots} alt="" className="pointer-events-none absolute" />
            )}
            {styles.map((style, index) => (
              <button
                key={style.id}
                type="button"
                onClick={() => setSelectedIndex(index)}
                aria-label={`AR 스타일 ${index + 1} 선택`}
                aria-pressed={activeIndex === index}
                className="flex h-5 w-[14px] items-center justify-center"
              >
                <span
                  className={cn(
                    "size-[6px] rounded-full bg-[var(--home-line)]",
                    activeIndex === index && "bg-[var(--home-primary)]",
                    activeIndex === 0 && styles.length === 3 && "opacity-0"
                  )}
                />
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => onTryClick(activeStyle)}
            className="mx-auto mt-1 block min-h-8 w-[min(130px,calc(100%-24px))] rounded bg-[var(--home-soft)] text-[10px] font-semibold text-[var(--home-primary)]"
          >
            AR 체험하기
          </button>
        </>
      ) : (
        <SectionFeedback
          isLoading={isLoading}
          isError={isError}
          emptyMessage="현재 체험할 스타일이 없습니다."
          actionLabel="AR 스타일 찾아보기"
          onAction={onMoreClick}
        />
      )}
    </section>
  );
};
export default ArStyleSection;
