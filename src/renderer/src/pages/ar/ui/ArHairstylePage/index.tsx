import { font, lightTheme } from "@heddy/design-tokens";
import { setupPage } from "@capgo/capacitor-transitions/react";
import { useEffect, useRef, useState } from "react";

import { useGetArGrooms } from "@/entities/ar-groom";
import type { ArHairstyleOption, HairstyleOptionId } from "@/entities/ar-groom";
import { useDeleteSavedStyle, useGetSavedStyles, usePostSavedStyle } from "@/entities/saved-style";
import { useArServerConnection, useFaceYaw } from "@/features/ar-session";
import { useArHairstyle } from "../../model/useArHairstyle";
import { getCircularHairstyleOption, ORIGINAL_HAIRSTYLE_OPTION } from "../../model/constants";
import { cn, showErrorToast, showInfoToast, showSuccessToast } from "@/shared";
import ArColorPicker from "../ArColorPicker";
import ArControlBar from "../ArControlBar";
import ArHairstyleBrowser from "../ArHairstyleBrowser";
import ArHairstyleCarousel from "../ArHairstyleCarousel";
import ArRecognitionBadge from "../ArRecognitionBadge";
import ArStatusNotice from "../ArStatusNotice";

const LONG_CONNECTION_WAIT_MS = 10_000;

const prioritizeHippiePerm = (options: ArHairstyleOption[]) => {
  const firstOption = options.find(option => option.name === "hippie-perm");

  if (!firstOption) return options;

  return [firstOption, ...options.filter(option => option.name !== firstOption.name)];
};

interface ArConnectionLoaderProps {
  reconnectMessage: string | null;
}

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

const ArConnectionLoader = ({ reconnectMessage }: ArConnectionLoaderProps) => {
  const [isLongConnectionWait, setIsLongConnectionWait] = useState(false);

  useEffect(() => {
    const timeoutId = window.setTimeout(
      () => setIsLongConnectionWait(true),
      LONG_CONNECTION_WAIT_MS
    );

    return () => window.clearTimeout(timeoutId);
  }, []);

  return (
    <div
      aria-live="polite"
      className="absolute inset-0 z-[60] flex items-center justify-center"
      role="status"
      style={{ backgroundColor: lightTheme.background.normal }}
    >
      <div className="relative flex flex-col items-center gap-4">
        {isLongConnectionWait ? (
          <svg
            aria-hidden="true"
            className="size-10"
            fill="none"
            style={{ color: lightTheme.primary.normal }}
            viewBox="0 0 64 64"
          >
            <g className="origin-center animate-pulse motion-reduce:animate-none">
              <path
                d="M6 19c7.4-7.2 16-11 25-12M33 7c9 1 17.6 4.8 25 12M12.5 29c5-4.7 11-7.5 18.5-8.5M33 20.5c7.5 1 13.5 3.8 18.5 8.5M20 39c3-2.5 6.6-4 11-4.5M33 34.5c4.4.5 8 2 11 4.5"
                stroke="currentColor"
                strokeLinecap="round"
                strokeWidth="4"
              />
            </g>
            <path d="M32 8v35" stroke="currentColor" strokeLinecap="round" strokeWidth="5.5" />
            <circle cx="32" cy="53" fill="currentColor" r="3.5" />
          </svg>
        ) : (
          <span
            aria-hidden="true"
            className="size-10 animate-spin rounded-full border-[3px] border-current border-t-transparent motion-reduce:animate-none"
            style={{ color: lightTheme.primary.normal }}
          />
        )}
        <p className={font.label.semiBold} style={{ color: lightTheme.label.neutral }}>
          AR 연결 중...
        </p>
        <div className="pointer-events-none absolute left-1/2 top-full mt-8 w-[280px] max-w-[calc(100vw-48px)] -translate-x-1/2 text-center">
          <p
            className={cn(font.caption.medium, "whitespace-nowrap")}
            style={{ color: lightTheme.label.assistive }}
          >
            {isLongConnectionWait ? (
              "인터넷 연결이 불안정해요. 확인해 주세요."
            ) : (
              <>
                {reconnectMessage?.replace(/\.$/, "") ?? "AR을 생성하고 있어요"}
                <ArLoadingDots />
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
};

const ArHairstylePage = () => {
  const pageRef = useRef<HTMLElement>(null);
  const cameraPreviewRef = useRef<HTMLVideoElement>(null);
  const faceTrackingVideoRef = useRef<HTMLVideoElement>(null);
  const handlePageEnterRef = useRef<() => void>(() => undefined);
  const handlePageLeaveRef = useRef<() => void>(() => undefined);
  const [isHairstyleBrowserOpen, setIsHairstyleBrowserOpen] = useState(false);
  const saveStyleMutation = usePostSavedStyle();
  const deleteSavedStyleMutation = useDeleteSavedStyle();
  const {
    data: savedStylesData,
    isFetching: isSavedStylesFetching,
    isPending: isSavedStylesPending,
  } = useGetSavedStyles();
  const {
    data: serverHairstyleOptions = [],
    error: groomsError,
    isPending: isGroomsPending,
    refetch: refetchGrooms,
  } = useGetArGrooms();
  const hairstyleOptions = [
    ORIGINAL_HAIRSTYLE_OPTION,
    ...prioritizeHippiePerm(serverHairstyleOptions),
  ];
  const {
    activeHairstylePosition,
    handleGroomColorReset,
    handleHairstyleSelect: selectHairstyle,
    handleHairstylePositionSelect: selectHairstylePosition,
    fitSettings,
    handleFitSettingsChange,
  } = useArHairstyle(hairstyleOptions);
  const selectedHairstyle = getCircularHairstyleOption(activeHairstylePosition, hairstyleOptions);
  const selectedGroom = selectedHairstyle.name;
  const savedStyleId = selectedHairstyle.hairstyleId
    ? (savedStylesData?.items.find(style => style.hairstyle_id === selectedHairstyle.hairstyleId)
        ?.saved_style_id ?? null)
    : null;
  const {
    connectionStatus,
    reconnectMessage,
    controlReady,
    groomState,
    foreheadState,
    hasServerYaw,
    handleGroomRetry,
    handleForeheadRefresh,
    handlePageEnter,
    handlePageLeave,
    handleReconnect,
    handleCameraSwitch,
  } = useArServerConnection(cameraPreviewRef, faceTrackingVideoRef, selectedGroom, fitSettings);
  // 서버가 yaw를 주는 동안에는 기기 감지가 필요 없어 멈춘다.
  const { isFaceTracked: isClientFaceTracked } = useFaceYaw(faceTrackingVideoRef, !hasServerYaw);
  const isFaceTracked = hasServerYaw || isClientFaceTracked;
  const isForeheadLoading = foreheadState.status === "loading";
  const canSelectHairstyle = controlReady;
  const isConnectionPending = connectionStatus === "idle" || connectionStatus === "connecting";
  const isStyleLoading =
    selectedGroom !== "" && groomState.groom === selectedGroom && groomState.status === "loading";
  const canAdjust =
    controlReady && selectedGroom !== "" && groomState.status === "ok" && !isForeheadLoading;
  const listMessage = isGroomsPending
    ? "헤어스타일을 불러오는 중"
    : (groomsError?.message ??
      (serverHairstyleOptions.length === 0 ? "서버에 등록된 헤어스타일이 없습니다." : null));

  const handleHairstyleSelect = (name: HairstyleOptionId) => {
    if (canSelectHairstyle) selectHairstyle(name);
  };

  const handleHairstylePositionSelect = (position: number) => {
    if (canSelectHairstyle) selectHairstylePosition(position);
  };

  const handleDisabledHairstyleSelect = () => {
    showInfoToast("AR에 연결하는 중이에요. 연결되면 스타일을 고를 수 있어요.");
  };

  const handleColorSelect = (color: string) => handleFitSettingsChange({ groom_color: color });

  const handleCandidateSave = async () => {
    const hairstyleId = selectedHairstyle.hairstyleId;

    if (!selectedHairstyle.name) {
      showInfoToast("원본 스타일은 저장할 수 없어요. 헤어스타일을 선택해 주세요.");
      return;
    }

    if (!hairstyleId) {
      showInfoToast("이 스타일은 아직 저장할 수 없어요. 스타일 목록 정보 연결이 필요해요.");
      return;
    }

    try {
      if (savedStyleId) {
        await deleteSavedStyleMutation.mutateAsync(savedStyleId);
        showSuccessToast("후보 스타일 저장을 취소했어요.");
      } else {
        await saveStyleMutation.mutateAsync({ hairstyle_id: hairstyleId });
        showSuccessToast("후보 스타일을 저장했어요.");
      }
    } catch (error) {
      showErrorToast(error instanceof Error ? error.message : "후보 스타일을 변경하지 못했습니다.");
    }
  };

  const handleHairstyleBrowserOpen = () => setIsHairstyleBrowserOpen(true);
  const handleHairstyleBrowserClose = () => setIsHairstyleBrowserOpen(false);

  useEffect(() => {
    handlePageEnterRef.current = handlePageEnter;
    handlePageLeaveRef.current = handlePageLeave;
  }, [handlePageEnter, handlePageLeave]);

  useEffect(() => {
    const pageElement = pageRef.current;
    if (!pageElement) return;

    return setupPage(pageElement, {
      onWillEnter: () => {
        handleGroomColorReset();
        handlePageEnterRef.current();
      },
      onDidLeave: () => handlePageLeaveRef.current(),
    });
  }, [handleGroomColorReset]);

  return (
    <cap-page ref={pageRef}>
      <section
        aria-labelledby="ar-hairstyle-title"
        aria-busy={isConnectionPending}
        className="ar-motion-page-enter relative flex h-full min-h-0 flex-col overflow-hidden"
        style={{ backgroundColor: lightTheme.background.normal }}
      >
        <header className="flex h-[58px] shrink-0 items-center justify-center px-[20px]">
          <h1
            className={font.headline1.bold}
            id="ar-hairstyle-title"
            style={{ color: lightTheme.label.neutral }}
          >
            AR 헤어스타일
          </h1>
        </header>

        <main
          aria-label="AR 미리보기"
          aria-busy={isConnectionPending || isStyleLoading}
          className="relative min-h-0 flex-1 overflow-hidden"
          style={{
            backgroundColor: isConnectionPending
              ? lightTheme.background.normal
              : lightTheme.label.normal,
          }}
        >
          <div
            aria-hidden={isConnectionPending}
            className="absolute inset-0"
            inert={isConnectionPending}
          >
            <video
              aria-hidden="true"
              autoPlay
              className="absolute inset-0 h-full w-full bg-black object-cover"
              muted
              playsInline
              ref={cameraPreviewRef}
            />
            <video
              aria-hidden="true"
              autoPlay
              className="pointer-events-none absolute h-px w-px opacity-0"
              muted
              playsInline
              ref={faceTrackingVideoRef}
            />
            {isStyleLoading && (
              <div
                aria-live="polite"
                className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center"
                role="status"
              >
                <span className="sr-only">헤어스타일을 적용하고 있어요</span>
                <svg
                  aria-hidden="true"
                  className="w-[min(18rem,64vw)] animate-spin text-white drop-shadow-[0_1px_5px_rgba(0,0,0,0.5)] motion-reduce:animate-none"
                  fill="currentColor"
                  viewBox="0 0 360 360"
                >
                  <circle cx="34.5" cy="96" opacity="0.28" r="3" />
                  <circle cx="61.2" cy="61.2" opacity="0.36" r="4" />
                  <circle cx="96" cy="34.5" opacity="0.46" r="5.5" />
                  <circle cx="136.5" cy="17" opacity="0.58" r="7" />
                  <circle cx="180" cy="12" opacity="0.7" r="8.5" />
                  <circle cx="223.5" cy="17" opacity="0.8" r="10" />
                  <circle cx="264" cy="34.5" opacity="0.88" r="11.5" />
                  <circle cx="298.8" cy="61.2" opacity="0.95" r="13" />
                  <circle cx="325.5" cy="96" r="14" />
                </svg>
              </div>
            )}
            <ArRecognitionBadge connectionStatus={connectionStatus} isFaceTracked={isFaceTracked} />
            <ArColorPicker
              disabled={!canAdjust}
              selectedColor={fitSettings.groom_color}
              onSelect={handleColorSelect}
            />
            <div className="absolute inset-x-0 bottom-0 flex flex-col items-center gap-4 pb-3">
              <ArStatusNotice
                connectionErrorMessage={reconnectMessage}
                connectionStatus={connectionStatus}
                foreheadState={foreheadState}
                groomState={groomState}
                onForeheadRefresh={handleForeheadRefresh}
                onGroomRetry={handleGroomRetry}
                onReconnect={handleReconnect}
                showForeheadStatus={false}
              />
              <ArControlBar
                handleCandidateSave={() => void handleCandidateSave()}
                handleCameraSwitch={handleCameraSwitch}
                handleHairstyleBrowserOpen={handleHairstyleBrowserOpen}
                isCandidateSaved={Boolean(savedStyleId)}
                isHairstyleBrowserOpen={isHairstyleBrowserOpen}
                isSavePending={
                  saveStyleMutation.isPending ||
                  deleteSavedStyleMutation.isPending ||
                  isSavedStylesPending ||
                  isSavedStylesFetching
                }
                selectedHairstyleLabel={selectedHairstyle.label}
              />
              <ArHairstyleCarousel
                activeHairstylePosition={activeHairstylePosition}
                hairstyleOptions={hairstyleOptions}
                loadingMessage={listMessage}
                disabled={!canSelectHairstyle}
                onDisabledSelect={handleDisabledHairstyleSelect}
                onSelect={handleHairstylePositionSelect}
              />
              {groomsError && (
                <button
                  className={font.caption.medium}
                  onClick={() => void refetchGrooms()}
                  style={{ color: lightTheme.label.buttonText }}
                  type="button"
                >
                  스타일 목록 다시 불러오기
                </button>
              )}
            </div>
          </div>
          {isConnectionPending && (
            <ArConnectionLoader key={connectionStatus} reconnectMessage={reconnectMessage} />
          )}
        </main>

        {!isConnectionPending && isHairstyleBrowserOpen && (
          <ArHairstyleBrowser
            activeHairstyleName={selectedHairstyle.name}
            disabled={!controlReady}
            hairstyleOptions={hairstyleOptions}
            onClose={handleHairstyleBrowserClose}
            onDisabledSelect={handleDisabledHairstyleSelect}
            onSelect={handleHairstyleSelect}
          />
        )}
      </section>
    </cap-page>
  );
};

export default ArHairstylePage;
