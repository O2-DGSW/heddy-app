import { useEffect, useRef } from "react";

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

export default ArLoadingDots;
