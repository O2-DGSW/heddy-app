import { useEffect, useRef } from "react";
import { lightTheme } from "@heddy/design-tokens";

import cn from "../../lib/cn";

interface SkeletonProps {
  className?: string;
  backgroundColor?: string;
}

/** 불투명도 점멸 대신 빛이 옆으로 지나가는 로딩 블록. 동작 줄이기에서는 정지한다. */
const Skeleton = ({ className, backgroundColor = lightTheme.fill.neutral }: SkeletonProps) => {
  const shineRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const node = shineRef.current;
    if (!node || typeof node.animate !== "function") return;
    const media = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    let animation: Animation | undefined;
    const update = () => {
      animation?.cancel();
      if (media?.matches) return;
      animation = node.animate(
        [{ transform: "translateX(-100%)" }, { transform: "translateX(100%)" }],
        { duration: 1400, iterations: Infinity, easing: "ease-in-out" }
      );
    };
    update();
    media?.addEventListener("change", update);
    return () => {
      animation?.cancel();
      media?.removeEventListener("change", update);
    };
  }, []);

  return (
    <span
      aria-hidden="true"
      className={cn("relative block isolate overflow-hidden", className)}
      style={{ backgroundColor }}
    >
      <span
        ref={shineRef}
        className="absolute inset-0 -translate-x-full motion-reduce:hidden"
        style={{
          backgroundImage: `linear-gradient(90deg, transparent, ${lightTheme.background.normal}, transparent)`,
        }}
      />
    </span>
  );
};

export default Skeleton;
