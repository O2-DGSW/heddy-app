import { font } from "@heddy/design-tokens";
import { cn } from "@/shared";
import mascot from "../assets/share-mascot.webp";
interface ShareRecordBannerProps {
  hasRecord?: boolean;
  onClick: () => void;
}
const ShareRecordBanner = ({ onClick, hasRecord = true }: ShareRecordBannerProps) => (
  <section
    aria-label="기록 공유"
    className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-x-3 gap-y-3 rounded-3xl bg-[var(--home-soft)]/60 p-4"
  >
    <img
      src={mascot}
      alt=""
      width={44}
      height={43}
      loading="lazy"
      decoding="async"
      className="w-11 shrink-0 object-contain"
    />
    <div className="flex min-w-0 flex-col gap-1.5">
      <h2
        className={cn(font.label.semiBold, "truncate text-[var(--home-secondary)]")}
        title="다음 미용실 방문이 더 쉬워지도록"
      >
        다음 미용실 방문이 더 쉬워지도록
      </h2>
      <p className={cn(font.caption.medium, "truncate text-[var(--home-secondary)]")}>
        {hasRecord
          ? "내 헤어 기록을 디자이너에게 공유해요."
          : "좋았던 스타일을 기록으로 남겨두세요."}
      </p>
    </div>
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "col-span-2 min-h-11 rounded-xl bg-[var(--home-surface)] px-4 text-[var(--home-share-text)]",
        font.caption.semiBold
      )}
    >
      {hasRecord ? "기록 공유하기" : "기록 시작하기"}
    </button>
  </section>
);
export default ShareRecordBanner;
