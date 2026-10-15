import { font, lightTheme } from "@heddy/design-tokens";

import { cn, sadMascot } from "@/shared";

interface CutsEmptyStateProps {
  /** 카테고리로 걸러서 비었는지. 기록이 아예 없을 때와 안내를 다르게 한다 */
  isFiltered?: boolean;
  onAddRecord?: () => void;
}

export const CutsEmptyState = ({ isFiltered = false, onAddRecord }: CutsEmptyStateProps) => {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 px-4">
      <img src={sadMascot} alt="" className="h-28 w-28" />
      <p
        className={cn("text-center", font.body.regular)}
        style={{ color: lightTheme.label.assistive }}
      >
        {isFiltered ? (
          <>
            이 카테고리의
            <br />
            시술기록이 없어요
          </>
        ) : (
          <>
            아직 시술기록이 없어요
            <br />첫 시술을 기록해 보세요
          </>
        )}
      </p>
      {!isFiltered && onAddRecord && (
        <button
          className={cn("mt-1 h-[42px] rounded-[10px] px-[20px]", font.label.semiBold)}
          onClick={onAddRecord}
          style={{
            backgroundColor: lightTheme.primary.normal,
            color: lightTheme.label.buttonText,
          }}
          type="button"
        >
          첫 기록 추가
        </button>
      )}
    </div>
  );
};
