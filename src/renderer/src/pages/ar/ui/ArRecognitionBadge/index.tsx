import { font, lightTheme } from "@heddy/design-tokens";

import { cn } from "@/shared";
import type { ArConnectionStatusType } from "../../model/useArServerConnection";

interface ArRecognitionBadgeProps {
  connectionStatus: ArConnectionStatusType;
  errorMessage: string | null;
  isFaceTracked: boolean;
  isExpanded: boolean;
}

const ArRecognitionBadge = ({
  connectionStatus,
  errorMessage,
  isFaceTracked,
  isExpanded,
}: ArRecognitionBadgeProps) => {
  const label =
    errorMessage ??
    (connectionStatus === "error"
      ? "AR 연결 실패"
      : connectionStatus === "connecting"
        ? "AR 연결 중"
        : isFaceTracked
          ? "얼굴 인식 완료"
          : connectionStatus === "connected"
            ? "얼굴 위치 확인 중"
            : "AR 연결 준비 중");

  return (
    <span
      aria-label={errorMessage ?? label}
      aria-live="polite"
      role="status"
      className={cn(
        "absolute right-[16px] max-w-[calc(100%-32px)] rounded-[5px] px-[8px] py-[4px]",
        isExpanded ? "top-[24px]" : "top-[15px]",
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
