import { font, lightTheme } from "@heddy/design-tokens";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { cn } from "@/shared";
import { useLocalCamera } from "../model/useLocalCamera";
import { ORIGINAL_HAIRSTYLE_OPTION } from "../model/constants";
import ArCameraViewport from "./ArCameraViewport";
import ArControlBar from "./ArControlBar";
import ArHairstyleCarousel from "./ArHairstyleCarousel";

interface ArCameraTrialProps {
  onExpand: () => void;
}

const ORIGINAL_OPTIONS = [ORIGINAL_HAIRSTYLE_OPTION];

const ArCameraTrial = ({ onExpand }: ArCameraTrialProps) => {
  const { pathname } = useLocation();
  const { videoRef, containerRef, status, errorMessage, startCamera, stopCamera } =
    useLocalCamera();
  const isActive = status === "active";
  const isStarting = status === "starting";
  const statusLabel = isActive ? "카메라 켜짐" : isStarting ? "카메라 연결 중" : "카메라 미리보기";

  const handleStart = () => void startCamera();
  const handleRestart = () => {
    stopCamera();
    void startCamera();
  };
  const handleExpand = () => {
    stopCamera();
    onExpand();
  };

  useEffect(() => stopCamera, [pathname, stopCamera]);

  return (
    <div ref={containerRef} className="px-2">
      <ArCameraViewport videoRef={videoRef} mirrored className="h-[260px] rounded-lg">
        <div
          role="status"
          className={cn(
            "absolute inset-x-2 top-2 w-fit max-w-[calc(100%-16px)] rounded px-2 py-1",
            font.caption.medium
          )}
          style={{ backgroundColor: lightTheme.primary.normal, color: lightTheme.label.buttonText }}
        >
          {statusLabel}
        </div>
        {!isActive && (
          <div
            className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-3 pt-7 pb-16 text-center"
            style={{ color: lightTheme.label.buttonText }}
          >
            <p role={errorMessage ? "alert" : undefined} className={font.caption.medium}>
              {errorMessage ??
                (isStarting
                  ? "카메라 권한을 허용해 주세요."
                  : "내 모습을 보며\n스타일 체험을 준비해 보세요.")}
            </p>
            <button
              type="button"
              disabled={isStarting}
              onClick={handleStart}
              className={cn("min-h-9 rounded-full px-3 disabled:opacity-50", font.caption.semiBold)}
              style={{
                backgroundColor: lightTheme.primary.normal,
                color: lightTheme.label.buttonText,
              }}
            >
              {isStarting ? "연결 중…" : status === "error" ? "다시 시도" : "카메라 켜기"}
            </button>
            {isStarting && (
              <button
                type="button"
                onClick={stopCamera}
                className={cn("min-h-8 underline", font.caption.medium)}
              >
                취소
              </button>
            )}
          </div>
        )}
        <div className="absolute inset-x-0 bottom-3 flex flex-col items-center gap-2">
          {isActive && (
            <ArControlBar
              compact
              isExpanded={false}
              selectedHairstyleLabel="원본 스타일"
              handleExpandedToggle={handleExpand}
              handleStyleReset={handleRestart}
              resetLabel="카메라 다시 시작"
            />
          )}
          <ArHairstyleCarousel
            compact
            activeHairstylePosition={0}
            hairstyleOptions={ORIGINAL_OPTIONS}
            loadingMessage={null}
            disabled={!isActive}
            onSelect={() => undefined}
          />
        </div>
      </ArCameraViewport>
      {isActive && (
        <button
          type="button"
          onClick={stopCamera}
          className={cn("mt-1 min-h-8 w-full underline", font.caption.medium)}
          style={{ color: lightTheme.label.alternative }}
        >
          카메라 끄기
        </button>
      )}
      <p
        className={cn("mt-2 text-center", font.caption.regular)}
        style={{ color: lightTheme.label.alternative }}
      >
        헤어 합성 준비 중
      </p>
    </div>
  );
};

export default ArCameraTrial;
