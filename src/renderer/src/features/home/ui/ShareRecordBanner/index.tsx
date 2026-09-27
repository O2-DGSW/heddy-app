import { font } from "@heddy/design-tokens";
import { cn } from "@/shared";
import mascot from "../../assets/share-mascot.png";
interface ShareRecordBannerProps {
  onClick: () => void;
}
const ShareRecordBanner = ({ onClick }: ShareRecordBannerProps) => (
  <section
    aria-label="기록 공유"
    className="flex min-h-[67px] items-center gap-4 rounded-[10px] bg-[var(--home-banner)] px-[15px] py-3"
  >
    <img src={mascot} alt="" className="h-[37px] w-[39px] shrink-0 object-cover" />
    <div className="flex min-w-0 flex-1 flex-col gap-1">
      <h2 className={cn(font.label.semiBold, "text-[var(--home-secondary)]")}>
        기록을 선택하고 공유해보세요
      </h2>
      <p className="text-[11px] font-medium text-[var(--home-muted)]">미용실 상담이 더 쉬워져요!</p>
    </div>
    <button
      type="button"
      onClick={onClick}
      className="h-6 shrink-0 rounded bg-[var(--home-share)] px-4 text-[10px] font-semibold text-[var(--home-share-text)]"
    >
      기록 공유하기
    </button>
  </section>
);
export default ShareRecordBanner;
