import { useEffect, useRef } from "react";
import { lightTheme } from "@heddy/design-tokens";

import loadingCloud from "./assets/images/loading-cloud.png";
import loadingCharacter from "./assets/images/loading-character.png";
import "./loading.css";

interface LoadingScreenProps {
  onComplete: () => void;
}

const LOADING_DURATION_MS = 1800;
const CLOUD_CLASS_NAMES = [
  "heddy-loading-cloud-one",
  "heddy-loading-cloud-two",
  "heddy-loading-cloud-three",
  "heddy-loading-cloud-four",
  "heddy-loading-cloud-five",
  "heddy-loading-cloud-six",
  "heddy-loading-cloud-seven",
  "heddy-loading-cloud-eight",
  "heddy-loading-cloud-nine",
];

const LoadingScreen = ({ onComplete }: LoadingScreenProps) => {
  const savedOnComplete = useRef(onComplete);

  useEffect(() => {
    savedOnComplete.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      savedOnComplete.current();
    }, LOADING_DURATION_MS);

    return () => window.clearTimeout(timer);
  }, []);

  return (
    <section className="relative flex min-h-[calc(100vh-72px)] w-full items-center justify-center overflow-hidden bg-white px-5">
      <div className="heddy-loading-clouds" aria-hidden="true">
        {CLOUD_CLASS_NAMES.map(className => (
          <img
            key={className}
            src={loadingCloud}
            alt=""
            className={`heddy-loading-cloud ${className}`}
          />
        ))}
      </div>

      <div className="relative z-10 flex w-[196px] -translate-y-8 flex-col items-center gap-8">
        <div className="relative flex h-[180px] w-[180px] items-start justify-center">
          <img
            src={loadingCharacter}
            alt=""
            className="heddy-loading-character relative z-10 size-[172px] rounded-[26px] object-cover"
            aria-hidden="true"
          />
        </div>

        <p
          className="heddy-loading-text w-full text-center font-['Pretendard'] text-2xl font-medium leading-[130%] tracking-[-0.48px]"
          style={{ color: lightTheme.label.alternative }}
          role="status"
          aria-live="polite"
        >
          로딩중...
        </p>
      </div>
    </section>
  );
};

export { LoadingScreen };
