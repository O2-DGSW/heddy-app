import { useEffect, useRef } from "react";

import { cn } from "@/shared";
import silverHair from "../../assets/loading-silver.webp";
import copperHair from "../../assets/loading-copper.webp";
import brownHair from "../../assets/loading-brown.webp";
import blondeHair from "../../assets/loading-blonde.webp";

const HAIRSTYLES = [silverHair, copperHair, brownHair, blondeHair];

const ArLoadingHairstyles = () => {
  const slidesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const slides = slidesRef.current;
    if (!slides) return;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let animations: Animation[] = [];
    const updateMotion = () => {
      animations.forEach(animation => animation.cancel());
      animations = [];
      if (reducedMotion.matches) return;

      // 같은 타임라인에서 네 장을 엇갈리게 이동해 마지막 장 뒤에도 끊김 없이 이어진다.
      animations = Array.from(slides.children, (slide, index) =>
        slide.animate(
          [
            {
              transform: "translateX(72px) scale(0.7)",
              opacity: 0,
              offset: 0,
              easing: "ease-in-out",
            },
            { transform: "translateX(0) scale(1)", opacity: 1, offset: 0.07 },
            {
              transform: "translateX(0) scale(1)",
              opacity: 1,
              offset: 0.21,
              easing: "ease-in-out",
            },
            { transform: "translateX(-72px) scale(0.7)", opacity: 0, offset: 0.28 },
            { transform: "translateX(-72px) scale(0.7)", opacity: 0, offset: 1 },
          ],
          {
            duration: 7200,
            delay: index * 1800 - 500,
            iterations: Infinity,
            easing: "linear",
            fill: "both",
          }
        )
      );
    };

    updateMotion();
    reducedMotion.addEventListener("change", updateMotion);
    return () => {
      animations.forEach(animation => animation.cancel());
      reducedMotion.removeEventListener("change", updateMotion);
    };
  }, []);

  return (
    <div aria-hidden="true" className="absolute inset-0 overflow-hidden rounded-full">
      <div className="absolute inset-2" ref={slidesRef}>
        {HAIRSTYLES.map((hairstyle, index) => (
          <div
            key={index}
            className={cn("absolute inset-0 overflow-hidden", index !== 0 && "opacity-0")}
          >
            <img alt="" src={hairstyle} className="size-full object-contain" draggable={false} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ArLoadingHairstyles;
