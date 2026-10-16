import { font, lightTheme } from "@heddy/design-tokens";
import { useEffect, useRef, useState } from "react";

import type { ArConnectionFeedbackType } from "@/features/ar-session";
import { cn } from "@/shared";

interface ArConnectionLoaderProps {
  feedback: ArConnectionFeedbackType;
  onRetry: () => void;
}

type ConnectionIconType = "loading" | "wifi" | "camera" | "service";
interface ConnectionContent {
  title: string;
  description: string;
  icon: ConnectionIconType;
  action?: string;
  animated?: boolean;
}

const CONTENT: Record<ArConnectionFeedbackType, ConnectionContent> = {
  camera: {
    title: "카메라를 준비하고 있어요",
    description: "곧 새로운 스타일을 만나볼 수 있어요",
    icon: "camera",
    animated: true,
  },
  connecting: {
    title: "AR을 생성하고 있어요",
    description: "나에게 맞는 스타일을 준비하고 있어요",
    icon: "loading",
    animated: true,
  },
  retrying: {
    title: "AR 연결을 준비하고 있어요",
    description: "서버 응답을 기다리며 다시 시도하고 있어요",
    icon: "loading",
    animated: true,
  },
  reconnecting: {
    title: "AR을 다시 연결하고 있어요",
    description: "잠깐 끊겼어요. 선택한 스타일은 그대로예요",
    icon: "loading",
    animated: true,
  },
  offline: {
    title: "인터넷 연결이 끊겼어요",
    description: "Wi-Fi나 데이터를 켜면 자동으로 연결돼요",
    icon: "wifi",
  },
  permission: {
    title: "카메라 권한이 필요해요",
    description: "설정에서 카메라를 허용한 뒤 눌러 주세요",
    icon: "camera",
    action: "허용했어요 · 다시 시도",
  },
  "camera-missing": {
    title: "카메라를 찾지 못했어요",
    description: "사용 가능한 카메라를 확인해 주세요",
    icon: "camera",
    action: "카메라 다시 연결",
  },
  "camera-busy": {
    title: "카메라를 열 수 없어요",
    description: "카메라를 쓰는 다른 앱을 닫아 주세요",
    icon: "camera",
    action: "다시 시도",
  },
  "camera-error": {
    title: "카메라 준비에 실패했어요",
    description: "카메라 상태를 확인하고 다시 시도해 주세요",
    icon: "camera",
    action: "다시 시도",
  },
  unsupported: {
    title: "카메라를 사용할 수 없어요",
    description: "Heddy 앱이나 보안 연결된 브라우저로 열어 주세요",
    icon: "camera",
  },
  unavailable: {
    title: "지금은 AR을 사용할 수 없어요",
    description: "잠시 후 다시 시도해 주세요",
    icon: "service",
    action: "다시 시도",
  },
};

const ArLoadingDots = () => {
  const dotsRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const dots = dotsRef.current;
    if (!dots) return;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let animations: Animation[] = [];
    const updateMotion = () => {
      animations.forEach(animation => animation.cancel());
      animations = [];
      if (reducedMotion.matches) return;

      animations = Array.from(dots.children, (dot, index) => {
        const start = (index + 1) / 4;
        return dot.animate(
          [
            { opacity: 0, transform: "translateY(0)", offset: 0 },
            { opacity: 0, transform: "translateY(2px)", offset: start - 0.02 },
            { opacity: 1, transform: "translateY(-3px)", offset: start + 0.025 },
            { opacity: 1, transform: "translateY(0)", offset: start + 0.1 },
            { opacity: 1, transform: "translateY(0)", offset: 0.98 },
            { opacity: 0, transform: "translateY(0)", offset: 1 },
          ],
          { duration: 2400, iterations: Infinity, easing: "ease-in-out" }
        );
      });
    };

    updateMotion();
    reducedMotion.addEventListener("change", updateMotion);
    return () => {
      animations.forEach(animation => animation.cancel());
      reducedMotion.removeEventListener("change", updateMotion);
    };
  }, []);

  return (
    <span aria-hidden="true" className="inline-flex w-[1em]" ref={dotsRef}>
      {[0, 1, 2].map(dot => (
        <span className="inline-block w-1/3 opacity-0 motion-reduce:opacity-100" key={dot}>
          .
        </span>
      ))}
    </span>
  );
};

const ConnectionIcon = ({ icon, animated }: Pick<ConnectionContent, "icon" | "animated">) => (
  <div
    aria-hidden="true"
    className="relative flex size-20 items-center justify-center rounded-full"
    style={{ backgroundColor: lightTheme.fill.normal, color: lightTheme.primary.normal }}
  >
    {icon === "loading" ? (
      <>
        <span className="absolute inset-0 rounded-full border-2 border-current opacity-15" />
        <span className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-current motion-reduce:animate-none" />
        <svg
          className="size-8"
          fill="none"
          viewBox="0 0 32 32"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M10 5H7a2 2 0 0 0-2 2v3m17-5h3a2 2 0 0 1 2 2v3M5 22v3a2 2 0 0 0 2 2h3m17-5v3a2 2 0 0 1-2 2h-3" />
          <path d="m16 9 2 5 5 2-5 2-2 5-2-5-5-2 5-2Z" />
        </svg>
      </>
    ) : (
      <svg
        className={cn("size-10", animated && "animate-pulse motion-reduce:animate-none")}
        fill="none"
        viewBox="0 0 48 48"
        stroke="currentColor"
        strokeWidth="2.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {icon === "wifi" ? (
          <>
            <path d="M5 15a29 29 0 0 1 13-7m12 0a29 29 0 0 1 13 7M10 24a21 21 0 0 1 8-5m12 0a21 21 0 0 1 8 5M16 32l2-1m12 0 2 1M24 7v24" />
            <circle cx="24" cy="40" r="2" fill="currentColor" stroke="none" />
          </>
        ) : icon === "camera" ? (
          <>
            <path d="M15 12l3-5h12l3 5h6a4 4 0 0 1 4 4v21a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4V16a4 4 0 0 1 4-4Z" />
            <circle cx="24" cy="26" r="8" />
          </>
        ) : (
          <>
            <rect x="7" y="9" width="34" height="30" rx="7" />
            <path d="M24 17v9" />
            <circle cx="24" cy="32" r="1.5" fill="currentColor" stroke="none" />
          </>
        )}
      </svg>
    )}
  </div>
);

const ArConnectionLoader = ({ feedback, onRetry }: ArConnectionLoaderProps) => {
  const [delay, setDelay] = useState<{ feedback: ArConnectionFeedbackType; level: number } | null>(
    null
  );
  const level = delay?.feedback === feedback ? delay.level : 0;
  const isConnecting =
    feedback === "connecting" || feedback === "retrying" || feedback === "reconnecting";
  const content = { ...CONTENT[feedback] };

  if (feedback === "camera" && level > 0)
    content.description = "카메라 권한 요청이 보이면 허용해 주세요";
  if (isConnecting && level > 0) {
    content.title = "연결이 조금 늦어지고 있어요";
    content.description = "연결을 계속 확인하고 있어요";
    if (level > 1) {
      content.icon = "wifi";
      content.title = "연결 상태를 확인해 주세요";
      content.description = "인터넷이나 AR 서버 응답이 늦어지고 있어요";
    }
  }

  useEffect(() => {
    if (feedback !== "camera" && !isConnecting) return;
    const slow = window.setTimeout(() => setDelay({ feedback, level: 1 }), 12_000);
    const delayed = window.setTimeout(() => setDelay({ feedback, level: 2 }), 30_000);
    return () => {
      window.clearTimeout(slow);
      window.clearTimeout(delayed);
    };
  }, [feedback, isConnecting]);

  return (
    <div
      className="absolute inset-0 z-[60] flex items-center justify-center px-4"
      style={{ backgroundColor: lightTheme.background.normal }}
    >
      <div
        className="relative flex w-full max-w-sm flex-col items-center text-center"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        <ConnectionIcon icon={content.icon} animated={content.animated} />
        <p
          className={cn(font.body.semiBold, "mt-6 whitespace-nowrap")}
          style={{ color: lightTheme.label.neutral }}
        >
          {content.title}
          {content.animated && <ArLoadingDots />}
        </p>
        <div className="absolute inset-x-0 top-full mt-5 flex flex-col items-center">
          <p
            className={cn(font.caption.medium, "whitespace-nowrap")}
            style={{ color: lightTheme.label.assistive }}
          >
            {content.description}
          </p>
          {content.action && (
            <button
              type="button"
              onClick={onRetry}
              className={cn(
                font.label.semiBold,
                "mt-7 min-h-11 rounded-full px-6 py-3 transition-opacity active:opacity-70 focus-visible:outline-2 focus-visible:outline-offset-4"
              )}
              style={{
                backgroundColor: lightTheme.primary.normal,
                color: lightTheme.label.buttonText,
              }}
            >
              {content.action}
            </button>
          )}
          {feedback === "offline" && (
            <span
              className={cn(font.caption.medium, "mt-7")}
              style={{ color: lightTheme.label.inactive }}
            >
              연결이 돌아오길 기다리고 있어요
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ArConnectionLoader;
