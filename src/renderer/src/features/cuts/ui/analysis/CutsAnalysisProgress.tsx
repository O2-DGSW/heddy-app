import { font, lightTheme } from "@heddy/design-tokens";

import { cn } from "@/shared";

interface CutsAnalysisProgressProps {
  photoUrl: string;
  /** 0~100. 서버가 진행률을 주지 않으면 null이라 막대 대신 움직이는 표시만 보여 준다 */
  progress: number | null;
  isTakingLong: boolean;
  onRefresh: () => void;
}

/** 분석 작업이 끝나기를 기다리는 동안 분석 중인 사진과 진행률을 보여 준다 */
export const CutsAnalysisProgress = ({
  photoUrl,
  progress,
  isTakingLong,
  onRefresh,
}: CutsAnalysisProgressProps) => (
  <section
    aria-live="polite"
    className="flex flex-col items-center gap-4 px-4 pb-6 pt-6"
    role="status"
  >
    <div
      className="relative mx-auto aspect-square w-4/5 overflow-hidden rounded-4xl"
      style={{ backgroundColor: lightTheme.fill.normal }}
    >
      {photoUrl && (
        <img
          alt="분석 중인 시술 사진"
          className="h-full w-full object-cover opacity-70"
          decoding="async"
          src={photoUrl}
        />
      )}
      {/* 사진 위를 훑는 띠로 "지금 보고 있다"는 느낌을 준다 */}
      <span
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-1/4 animate-pulse bg-gradient-to-b from-white/50 to-transparent motion-reduce:hidden"
      />
    </div>

    <p className={font.headline2.semiBold} style={{ color: lightTheme.label.neutral }}>
      AI가 머리 상태를 분석하고 있어요
    </p>

    <div
      aria-label="분석 진행률"
      aria-valuemax={100}
      aria-valuemin={0}
      aria-valuenow={progress ?? undefined}
      className="h-[6px] w-4/5 overflow-hidden rounded-full"
      role="progressbar"
      style={{ backgroundColor: lightTheme.fill.normal }}
    >
      <div
        className={cn(
          "h-full rounded-full transition-[width] duration-500 ease-out",
          progress === null && "w-1/3 animate-pulse motion-reduce:animate-none"
        )}
        style={{
          backgroundColor: lightTheme.primary.normal,
          ...(progress !== null && { width: `${Math.max(progress, 4)}%` }),
        }}
      />
    </div>

    <p
      className={cn("text-center", font.caption.regular)}
      style={{ color: lightTheme.label.assistive }}
    >
      {progress !== null ? `${progress}% · ` : ""}화면을 나가도 분석은 계속돼요
    </p>

    {isTakingLong && (
      <button
        className={cn("h-[40px] rounded-[10px] border px-[16px]", font.label.semiBold)}
        onClick={onRefresh}
        style={{ borderColor: lightTheme.line.neutral, color: lightTheme.label.neutral }}
        type="button"
      >
        생각보다 오래 걸려요 · 다시 확인
      </button>
    )}
  </section>
);
