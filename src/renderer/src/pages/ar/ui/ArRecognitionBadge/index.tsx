import { font, lightTheme } from "@heddy/design-tokens";

import { cn } from "@/shared";
import type { ArConnectionStatusType } from "@/features/ar-session";

interface ArRecognitionBadgeProps {
  connectionStatus: ArConnectionStatusType;
  isFaceTracked: boolean;
}

const ArRecognitionBadge = ({ connectionStatus, isFaceTracked }: ArRecognitionBadgeProps) => {
  if (connectionStatus === "connected" && isFaceTracked) return null;

  // 자세한 이유와 다시 연결 버튼은 하단 안내(ArStatusNotice)가 맡고, 배지는 짧은 상태만 보여 준다.
  const label =
    connectionStatus === "error"
      ? "AR 연결 실패"
      : connectionStatus === "connecting"
        ? "AR 연결 중"
        : connectionStatus === "connected"
          ? "얼굴 위치 확인 중"
          : "AR 연결 준비 중";

  return (
    <span
      aria-live="polite"
      role="status"
      className={cn(
        "absolute right-[16px] top-[15px] max-w-[calc(100%-32px)] rounded-[5px] px-[8px] py-[4px]",
        font.label.medium
      )}
      style={{
        backgroundColor: lightTheme.primary.normal,
        color: lightTheme.label.buttonText,
      }}
    >
      {label}
    </span>
  );
};

export default ArRecognitionBadge;
