import { font, lightTheme } from "@heddy/design-tokens";

import agerSad from "@/shared/assets/agerSad.svg";

interface RecommendStatusProps {
  message: string;
  /** 추천이 없을 때처럼 비어 있는 상태에만 캐릭터를 함께 보여준다 */
  hasIllustration?: boolean;
  actionLabel?: string;
  isActionPending?: boolean;
  onAction?: () => void;
}

/** 추천 목록 자리에 보여주는 로딩·에러·빈 상태 (남는 공간 한가운데에 놓인다) */
export const RecommendStatus = ({
  message,
  hasIllustration,
  actionLabel,
  isActionPending,
  onAction,
}: RecommendStatusProps) => {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 px-4">
      {hasIllustration && <img src={agerSad} alt="" className="h-28 w-28" />}

      <p
        className={`whitespace-pre-line text-center ${font.body.regular}`}
        style={{ color: lightTheme.label.assistive }}
      >
        {message}
      </p>

      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          disabled={isActionPending}
          className={`rounded-full px-5 py-2.5 disabled:opacity-60 ${font.label.semiBold}`}
          style={{ backgroundColor: lightTheme.primary.normal, color: lightTheme.label.buttonText }}
        >
          {isActionPending ? "추천 만드는 중" : actionLabel}
        </button>
      )}
    </div>
  );
};
