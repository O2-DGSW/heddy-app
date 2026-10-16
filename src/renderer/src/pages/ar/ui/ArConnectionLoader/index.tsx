import { font, lightTheme } from "@heddy/design-tokens";

import type { ArConnectionFeedbackType } from "@/features/ar-session";
import { cn } from "@/shared";
import { useArConnectionContent } from "../../model/useArConnectionContent";
import ArConnectionIcon from "./ArConnectionIcon";
import ArLoadingDots from "./ArLoadingDots";

interface ArConnectionLoaderProps {
  feedback: ArConnectionFeedbackType;
  onRetry: () => void;
}

const ArConnectionLoader = ({ feedback, onRetry }: ArConnectionLoaderProps) => {
  const content = useArConnectionContent(feedback);

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
        <ArConnectionIcon icon={content.icon} animated={content.animated} />
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
