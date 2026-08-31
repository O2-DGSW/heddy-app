import { font, lightTheme } from "@heddy/design-tokens";

import { cn } from "@/shared";
import type { ArConnectionStatusType } from "../../model/useArServerConnection";

interface ArRecognitionBadgeProps {
  connectionStatus: ArConnectionStatusType;
  errorMessage: string | null;
  isExpanded: boolean;
}

const ArRecognitionBadge = ({
  connectionStatus,
  errorMessage,
  isExpanded,
}: ArRecognitionBadgeProps) => {
  const label =
    connectionStatus === "connected"
      ? "얼굴 인식 중"
      : connectionStatus === "connecting"
        ? "AR 연결 중"
        : "AR 연결 실패";

  return (
    <span
      aria-label={errorMessage ?? label}
      className={cn(
        "absolute right-[16px] rounded-[5px] px-[8px] py-[4px]",
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
