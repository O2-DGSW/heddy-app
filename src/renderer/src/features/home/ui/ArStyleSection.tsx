import type { ReactNode } from "react";
import { font } from "@heddy/design-tokens";
import { cn } from "@/shared";
import arrow from "../assets/arrow-green.svg";

interface ArStyleSectionProps {
  children: ReactNode;
  onMoreClick: () => void;
}

const ArStyleSection = ({ children, onMoreClick }: ArStyleSectionProps) => (
  <section
    aria-labelledby="home-ar-title"
    className="min-w-0 overflow-hidden rounded-[10px] bg-[var(--home-surface)] pt-3 pb-3 shadow-[0_0_4px_rgb(0_0_0/0.08)]"
  >
    <div className="mb-3 flex items-center justify-between gap-1 px-3">
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
    {children}
  </section>
);

export default ArStyleSection;
