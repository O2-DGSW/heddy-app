import { font, lightTheme } from "@heddy/design-tokens";

import type { ArGroomState } from "@/entities/ar-groom";
import { cn } from "@/shared";
import type { ArConnectionStatusType } from "@/features/ar-session";

interface ArStatusNoticeProps {
  connectionStatus: ArConnectionStatusType;
  connectionErrorMessage: string | null;
  groomState: ArGroomState;
  foreheadState: ArGroomState;
  onReconnect: () => void;
  onGroomRetry: () => void;
  onForeheadRefresh: () => void;
}

interface NoticeContent {
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

const getNoticeContent = ({
  connectionStatus,
  connectionErrorMessage,
  groomState,
  foreheadState,
  onReconnect,
  onGroomRetry,
  onForeheadRefresh,
}: ArStatusNoticeProps): NoticeContent | null => {
  // 연결이 끊기면 스타일·이마 상태는 의미가 없으므로 연결 오류를 먼저 보여 준다.
  if (connectionStatus === "error") {
    return {
      message: connectionErrorMessage ?? "AR 연결이 끊어졌습니다. 다시 연결해 주세요.",
      actionLabel: "다시 연결",
      onAction: onReconnect,
    };
  }

  if (groomState.status === "error") {
    return {
      message: groomState.message ?? "스타일을 적용하지 못했습니다. 다시 시도해 주세요.",
      actionLabel: "다시 시도",
      onAction: onGroomRetry,
    };
  }

  if (foreheadState.status === "error") {
    return {
      message: foreheadState.message ?? "이마를 만들지 못했습니다. 정면을 보고 다시 시도해 주세요.",
      actionLabel: "이마 다시 만들기",
      onAction: onForeheadRefresh,
    };
  }

  if (foreheadState.status === "loading") {
    return { message: "이마를 만드는 중입니다. 정면을 보고 잠시만 기다려 주세요." };
  }

  return null;
};

/** AR 연결·스타일 적용·이마 생성이 실패했을 때 이유와 다시 시도할 방법을 알려 준다 */
const ArStatusNotice = (props: ArStatusNoticeProps) => {
  const content = getNoticeContent(props);

  if (!content) {
    return null;
  }

  return (
    <div
      aria-live="polite"
      className="mx-[16px] flex max-w-[370px] items-center gap-[12px] rounded-[14px] px-[16px] py-[12px]"
      role="status"
      style={{ backgroundColor: lightTheme.background.normal }}
    >
      <p className={font.caption.medium} style={{ color: lightTheme.label.neutral }}>
        {content.message}
      </p>
      {content.actionLabel && content.onAction && (
        <button
          className={cn("shrink-0 rounded-[10px] px-[12px] py-[8px]", font.caption.bold)}
          onClick={content.onAction}
          style={{
            backgroundColor: lightTheme.primary.normal,
            color: lightTheme.label.buttonText,
          }}
          type="button"
        >
          {content.actionLabel}
        </button>
      )}
    </div>
  );
};

export default ArStatusNotice;
