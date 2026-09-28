import { font } from "@heddy/design-tokens";
import { cn } from "@/shared";
import mascot from "../assets/share-mascot.png";
interface ShareRecordBannerProps {
  hasRecord?: boolean;
  onClick: () => void;
}
const ShareRecordBanner = ({ onClick, hasRecord = true }: ShareRecordBannerProps) => (
  <section
    aria-label="기록 공유"
    className="flex min-h-[67px] flex-wrap items-center gap-x-4 gap-y-2 rounded-[10px] bg-[var(--home-banner)] px-[15px] py-3"
  >
    <img src={mascot} alt="" className="h-[37px] w-[39px] shrink-0 object-cover" />
    <div className="flex min-w-[140px] flex-1 flex-col gap-1">
      <h2 className={cn(font.label.semiBold, "text-[var(--home-secondary)]")}>
        {hasRecord ? "기록을 선택하고 공유해보세요" : "공유할 시술 기록이 없습니다"}
      </h2>
      <p className="text-[11px] font-medium text-[var(--home-muted)]">
        {hasRecord ? "미용실 상담이 더 쉬워져요!" : "첫 시술 기록을 추가해보세요."}
      </p>
    </div>
    <button
      type="button"
      onClick={onClick}
      className="min-h-8 shrink-0 max-[374px]:ml-auto rounded bg-[var(--home-share)] px-4 text-[10px] font-semibold text-[var(--home-share-text)]"
    >
      {hasRecord ? "기록 공유하기" : "기록 추가하기"}
    </button>
  </section>
);
export default ShareRecordBanner;
