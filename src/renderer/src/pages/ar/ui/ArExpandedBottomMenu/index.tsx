import { font, lightTheme } from "@heddy/design-tokens";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { setDirection } from "@capgo/capacitor-transitions/react";

import { EXPANDED_AR_MENU_ITEMS } from "../../model/constants";
import { cn } from "@/shared";

const ROUTE_TRANSITION_DURATION = 220;

const ArExpandedBottomMenu = () => {
  const navigate = useNavigate();
  const [isNavigating, setIsNavigating] = useState(false);
  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  const navigateTimerRef = useRef<number | null>(null);

  const handleNavigate = (to: string) => {
    if (isNavigating) {
      return;
    }

    setSelectedPath(to);
    setIsNavigating(true);

    navigateTimerRef.current = window.setTimeout(() => {
      navigateTimerRef.current = null;
      setDirection("forward");
      navigate(to);
    }, ROUTE_TRANSITION_DURATION);
  };

  // 메뉴가 사라진 뒤에 늦게 이동하지 않도록 남은 타이머를 정리한다
  useEffect(
    () => () => {
      if (navigateTimerRef.current !== null) {
        window.clearTimeout(navigateTimerRef.current);
      }
    },
    []
  );

  return (
    <nav
      aria-label="확대 AR 하단 메뉴"
      className={cn(
        "mt-3 flex items-center gap-[33px] transition-[opacity,transform] duration-[220ms] ease-out motion-reduce:transition-none",
        isNavigating && "opacity-0 delay-[80ms]"
      )}
      style={{ color: lightTheme.label.assistive }}
    >
      {EXPANDED_AR_MENU_ITEMS.map(({ label, to }) => (
        <button
          aria-label={`${label}으로 이동`}
          className={cn(
            "ar-motion-press min-w-[35px] text-center transition-[color,transform] duration-[180ms] ease-out motion-reduce:transition-none",
            selectedPath === to && "scale-110"
          )}
          disabled={isNavigating}
          key={to}
          onClick={() => handleNavigate(to)}
          style={{
            color: selectedPath === to ? lightTheme.label.buttonText : lightTheme.label.assistive,
          }}
          type="button"
        >
          <span className={font.label.medium}>{label}</span>
        </button>
      ))}
    </nav>
  );
};

export default ArExpandedBottomMenu;
