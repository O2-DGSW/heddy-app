import { font, lightTheme } from "@heddy/design-tokens";

interface CutsRecordListStatusProps {
  isError: boolean;
  errorMessage?: string;
  onRetry: () => void;
}

/** 시술기록 목록의 로딩·에러 상태 표시 (목록이 비었을 때는 CutsEmptyState가 담당한다) */
export const CutsRecordListStatus = ({
  isError,
  errorMessage,
  onRetry,
}: CutsRecordListStatusProps) => {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 px-4">
      <p
        className={`text-center ${font.label.regular}`}
        style={{ color: lightTheme.label.assistive }}
      >
        {isError ? (errorMessage ?? "시술기록을 불러오지 못했습니다.") : "시술기록을 불러오는 중"}
      </p>

      {isError && (
        <button
          type="button"
          onClick={onRetry}
          className={`rounded-full px-4 py-2 ${font.label.semiBold}`}
          style={{ backgroundColor: lightTheme.fill.neutral, color: lightTheme.label.neutral }}
        >
          다시 시도
        </button>
      )}
    </div>
  );
};
