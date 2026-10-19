import { font, lightTheme } from "@heddy/design-tokens";
import { useId, useState } from "react";

import { cn } from "@/shared";

interface ArCaptureGuideProps {
  visible: boolean;
}

const ArCaptureGuide = ({ visible }: ArCaptureGuideProps) => {
  const [isOpen, setIsOpen] = useState(true);
  const guideId = useId();

  const handleToggle = () => setIsOpen(open => !open);

  if (!visible) return null;

  return (
    <div className="pointer-events-none absolute inset-x-3 bottom-[164px] top-3 z-10 flex flex-col items-center gap-3">
      <div className="flex w-full shrink-0 justify-end">
        <button
          aria-controls={guideId}
          aria-expanded={isOpen}
          aria-label={isOpen ? "촬영 가이드 숨기기" : "촬영 가이드 열기"}
          className={cn(
            "ar-motion-press pointer-events-auto min-h-11 rounded-full px-4 shadow-sm",
            font.caption.semiBold
          )}
          onClick={handleToggle}
          style={{
            backgroundColor: lightTheme.background.normal,
            color: lightTheme.label.neutral,
          }}
          type="button"
        >
          {isOpen ? "가이드 숨기기" : "촬영 가이드"}
        </button>
      </div>
      <div
        aria-label="촬영 안내"
        className={cn(
          "flex min-h-0 w-full flex-1 flex-col items-center gap-4",
          !isOpen && "hidden"
        )}
        id={guideId}
        role="region"
      >
        <div
          className="w-full shrink-0 rounded-2xl px-4 py-3 text-center shadow-sm"
          style={{
            backgroundColor: lightTheme.background.normal,
            color: lightTheme.label.neutral,
          }}
        >
          <p className={font.label.semiBold}>얼굴을 가운데에 맞춰주세요</p>
          <p className={cn("mt-2", font.caption.medium)}>
            얼굴 앞쪽에서 빛이 오도록 해주세요.
            <br />
            뒤쪽의 강한 전등이나 창문은 피해주세요.
          </p>
        </div>
        <div aria-hidden="true" className="flex min-h-0 w-full flex-1 justify-center">
          <div
            className="aspect-[3/4] h-full max-w-[65%] rounded-[50%] border-2 border-dashed drop-shadow-md"
            style={{ borderColor: lightTheme.background.normal }}
          />
        </div>
      </div>
    </div>
  );
};

export default ArCaptureGuide;
