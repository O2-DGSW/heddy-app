import { setDirection } from "@capgo/capacitor-transitions/react";
import { lightTheme } from "@heddy/design-tokens";
import { useLocation, useNavigate } from "react-router-dom";

import { cn } from "@/shared/lib";

interface BackButtonProps {
  className?: string;
  fallbackPath?: string;
  label?: string;
}

const buttonStyle = {
  backgroundColor: lightTheme.fill.normal,
  color: lightTheme.label.neutral,
};

const BackButton = ({
  className,
  fallbackPath = "/welcome",
  label = "뒤로 가기",
}: BackButtonProps) => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleBack = () => {
    setDirection("back");

    if (location.key !== "default") {
      navigate(-1);
      return;
    }

    navigate(fallbackPath, { replace: true });
  };

  return (
    <button
      aria-label={label}
      className={cn(
        "flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-0 p-0 active:scale-[0.98]",
        className
      )}
      onClick={handleBack}
      style={buttonStyle}
      type="button"
    >
      <svg aria-hidden="true" className="h-5 w-5" fill="none" focusable="false" viewBox="0 0 20 20">
        <path
          d="M12.5 5 7.5 10l5 5"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
        />
      </svg>
    </button>
  );
};

export default BackButton;
