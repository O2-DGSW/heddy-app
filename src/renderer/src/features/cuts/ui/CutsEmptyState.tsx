import { font, lightTheme } from "@heddy/design-tokens";

import { cn, sadMascot } from "@/shared";

interface CutsEmptyStateProps {
  /** 카테고리로 걸러서 비었는지. 기록이 아예 없을 때와 안내를 다르게 한다 */
  isFiltered?: boolean;
  onAddRecord?: () => void;
}

export const CutsEmptyState = ({ isFiltered = false, onAddRecord }: CutsEmptyStateProps) => {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-8 text-center">
      <img
        src={sadMascot}
        alt=""
        width={88}
        height={88}
        className="mb-4 size-22 shrink-0 object-contain"
      />
      <div className="flex w-full max-w-72 flex-col items-center gap-2">
        <h2
          className={cn("text-balance", font.body.semiBold)}
          style={{ color: lightTheme.label.neutral }}
        >
          {isFiltered ? "이 카테고리는 아직 비어 있어요" : "나만의 헤어 기록을 시작해요"}
        </h2>
        <p
          className={cn("text-pretty", font.caption.regular)}
          style={{ color: lightTheme.label.assistive }}
        >
          {isFiltered ? "새로 받은 시술이 있다면" : "사진 한 장으로 시작하는 스타일 히스토리,"}
          <br />
          {isFiltered ? "사진과 함께 기록을 남겨보세요." : "좋았던 변화를 차곡차곡 모아보세요."}
        </p>
      </div>
      {onAddRecord && (
        <button
          className={cn(
            "mt-5 min-h-11 max-w-full rounded-xl px-5 transition-opacity hover:opacity-90 active:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-4",
            font.label.semiBold
          )}
          onClick={onAddRecord}
          style={{
            backgroundColor: lightTheme.primary.normal,
            color: lightTheme.label.buttonText,
          }}
          type="button"
        >
          {isFiltered ? "시술 기록 남기기" : "첫 기록 남기기"}
        </button>
      )}
    </div>
  );
};
