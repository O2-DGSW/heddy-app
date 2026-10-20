import { font } from "@heddy/design-tokens";
import { cn } from "@/shared";
import hairstylePhoto from "../assets/home-hairstyle.png";
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
      src={hairstylePhoto}
      alt=""
      width={44}
      height={44}
      loading="lazy"
      decoding="async"
      className="size-11 shrink-0 rounded-xl object-cover object-top"
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
