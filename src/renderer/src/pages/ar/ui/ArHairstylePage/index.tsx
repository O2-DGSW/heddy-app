import { font, lightTheme } from "@heddy/design-tokens";
import { setupPage } from "@capgo/capacitor-transitions/react";
import { useEffect, useRef, useState } from "react";

import { useGetArGrooms } from "@/entities/ar-groom";
import type { ArHairstyleOption, HairstyleOptionId } from "@/entities/ar-groom";
import { useArServerConnection, useFaceYaw } from "@/features/ar-session";
import { useArHairstyle } from "../../model/useArHairstyle";
import { getCircularHairstyleOption, ORIGINAL_HAIRSTYLE_OPTION } from "../../model/constants";
import { cn, showInfoToast, useBottomBarVisibility } from "@/shared";
import ArCandidateSaveModal from "../ArCandidateSaveModal";
import ArColorPicker from "../ArColorPicker";
import ArControlBar from "../ArControlBar";
import ArExpandedBottomMenu from "../ArExpandedBottomMenu";
import ArHairstyleBrowser from "../ArHairstyleBrowser";
import ArHairstyleCarousel from "../ArHairstyleCarousel";
import ArRecognitionBadge from "../ArRecognitionBadge";
import ArStatusNotice from "../ArStatusNotice";

const prioritizeHippiePerm = (options: ArHairstyleOption[]) => {
  const firstOption = options.find(option => option.name === "hippie-perm");

  if (!firstOption) return options;

  return [firstOption, ...options.filter(option => option.name !== firstOption.name)];
};

const ArHairstylePage = () => {
  const pageRef = useRef<HTMLElement>(null);
  const cameraPreviewRef = useRef<HTMLVideoElement>(null);
  const faceTrackingVideoRef = useRef<HTMLVideoElement>(null);
  const [isHairstyleBrowserOpen, setIsHairstyleBrowserOpen] = useState(false);
  const { setIsBottomBarHidden } = useBottomBarVisibility();
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
    activeModal,
    candidateMemo,
    handleExpandedToggle,
    handleGroomColorReset,
    handleHairstyleSelect: selectHairstyle,
    handleModalClose,
    handleModalOpen,
    handleStyleReset,
    isExpanded,
    fitSettings,
    handleFitSettingsChange,
    setCandidateMemo,
  } = useArHairstyle(hairstyleOptions);
  const selectedHairstyle = getCircularHairstyleOption(activeHairstylePosition, hairstyleOptions);
  const selectedGroom = selectedHairstyle.name;
  const {
    connectionStatus,
    errorMessage,
    controlReady,
    groomState,
    foreheadState,
    hasServerYaw,
    handleGroomRetry,
    handleForeheadRefresh,
    handleReconnect,
  } = useArServerConnection(cameraPreviewRef, faceTrackingVideoRef, selectedGroom, fitSettings);
  // 서버가 yaw를 주는 동안에는 기기 감지가 필요 없어 멈춘다.
  const { isFaceTracked: isClientFaceTracked } = useFaceYaw(faceTrackingVideoRef, !hasServerYaw);
  const isFaceTracked = hasServerYaw || isClientFaceTracked;
  const isForeheadLoading = foreheadState.status === "loading";
  const isConnectionPending = connectionStatus === "idle" || connectionStatus === "connecting";
  const canAdjust =
    controlReady && selectedGroom !== "" && groomState.status === "ok" && !isForeheadLoading;
  const listMessage = isGroomsPending
    ? "헤어스타일을 불러오는 중"
    : (groomsError?.message ??
      (serverHairstyleOptions.length === 0 ? "서버에 등록된 헤어스타일이 없습니다." : null));

  const handleHairstyleSelect = (name: HairstyleOptionId) => {
    if (controlReady && !isForeheadLoading) selectHairstyle(name);
  };

  const handleDisabledHairstyleSelect = () => {
    if (connectionStatus === "error") {
      showInfoToast("AR 연결이 끊어졌습니다. 다시 연결한 뒤 스타일을 골라 주세요.");
    } else if (isForeheadLoading) {
      showInfoToast("이마를 만드는 중입니다. 끝나면 스타일을 바꿀 수 있습니다.");
    } else {
      showInfoToast("AR에 연결하는 중입니다. 연결되면 스타일을 고를 수 있습니다.");
    }
  };

  const handleColorSelect = (color: string) => handleFitSettingsChange({ groom_color: color });

  const handleReset = () => {
    if (!isForeheadLoading) handleStyleReset();
  };

  const handleHairstyleBrowserOpen = () => setIsHairstyleBrowserOpen(true);
  const handleHairstyleBrowserClose = () => setIsHairstyleBrowserOpen(false);

  useEffect(() => {
    const pageElement = pageRef.current;
    if (!pageElement) return;

    return setupPage(pageElement, {
      onWillEnter: () => handleGroomColorReset(),
    });
  }, [handleGroomColorReset]);

  useEffect(() => {
    setIsBottomBarHidden(isExpanded);

    return () => {
      setIsBottomBarHidden(false);
    };
  }, [isExpanded, setIsBottomBarHidden]);

  return (
    <cap-page ref={pageRef}>
      <section
        aria-labelledby="ar-hairstyle-title"
        aria-busy={isConnectionPending}
        className="ar-motion-page-enter relative flex h-full min-h-0 flex-col overflow-hidden"
        style={{ backgroundColor: lightTheme.background.normal }}
      >
        {!isExpanded && (
          <header className="flex h-[58px] shrink-0 items-center justify-center px-[20px]">
            <h1
              className={font.headline1.bold}
              id="ar-hairstyle-title"
              style={{ color: lightTheme.label.neutral }}
            >
              AR 헤어스타일
            </h1>
          </header>
        )}

        <main
          aria-label="AR 미리보기"
          aria-busy={isConnectionPending}
          className={cn(
            "min-h-0 flex-1 overflow-hidden",
            isExpanded ? "fixed inset-x-0 z-[25]" : "relative"
          )}
          style={{
            backgroundColor: lightTheme.label.normal,
            ...(isExpanded && { bottom: "0px", top: "0px" }),
          }}
        >
          {isExpanded && (
            <h1 className="sr-only" id="ar-hairstyle-title">
              AR 헤어스타일
            </h1>
          )}
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
            <ArRecognitionBadge
              connectionStatus={connectionStatus}
              isFaceTracked={isFaceTracked}
              isExpanded={isExpanded}
            />
            <ArColorPicker
              isExpanded={isExpanded}
              disabled={!canAdjust}
              selectedColor={fitSettings.groom_color}
              onSelect={handleColorSelect}
            />
            <div
              className={cn(
                "absolute inset-x-0 bottom-0 flex flex-col items-center gap-4",
                isExpanded ? "pb-[max(24px,calc(env(safe-area-inset-bottom)+16px))]" : "pb-3"
              )}
            >
              <ArStatusNotice
                connectionErrorMessage={errorMessage}
                connectionStatus={connectionStatus}
                foreheadState={foreheadState}
                groomState={groomState}
                onForeheadRefresh={handleForeheadRefresh}
                onGroomRetry={handleGroomRetry}
                onReconnect={handleReconnect}
                showForeheadStatus={false}
              />
              <ArControlBar
                handleExpandedToggle={handleExpandedToggle}
                handleHairstyleBrowserOpen={handleHairstyleBrowserOpen}
                handleModalOpen={() => handleModalOpen("candidate-save")}
                handleStyleReset={handleReset}
                isHairstyleBrowserOpen={isHairstyleBrowserOpen}
                isExpanded={isExpanded}
                selectedHairstyleLabel={selectedHairstyle.label}
              />
              <ArHairstyleCarousel
                activeHairstylePosition={activeHairstylePosition}
                hairstyleOptions={hairstyleOptions}
                loadingMessage={listMessage}
                disabled={!controlReady || isForeheadLoading}
                onDisabledSelect={handleDisabledHairstyleSelect}
                onSelect={handleHairstyleSelect}
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
              {isExpanded && <ArExpandedBottomMenu />}
            </div>
          </div>
          {isConnectionPending && (
            <div
              aria-live="polite"
              className="absolute inset-0 z-[60] flex items-center justify-center"
              role="status"
              style={{ backgroundColor: lightTheme.background.normal }}
            >
              <div className="relative flex flex-col items-center gap-4">
                <span
                  aria-hidden="true"
                  className="size-10 animate-spin rounded-full border-[3px] border-current border-t-transparent motion-reduce:animate-none"
                  style={{ color: lightTheme.primary.normal }}
                />
                <p className={font.label.semiBold} style={{ color: lightTheme.label.neutral }}>
                  AR 연결 중...
                </p>
                <div className="pointer-events-none absolute left-1/2 top-full mt-8 w-[280px] max-w-[calc(100vw-48px)] -translate-x-1/2 text-center">
                  <p
                    className={cn(font.caption.medium, "whitespace-nowrap")}
                    style={{ color: lightTheme.label.assistive }}
                  >
                    AR 화면을 준비하고 있어요
                  </p>
                </div>
              </div>
            </div>
          )}
        </main>

        {!isConnectionPending && isHairstyleBrowserOpen && (
          <ArHairstyleBrowser
            activeHairstyleName={selectedHairstyle.name}
            disabled={!controlReady || isForeheadLoading}
            hairstyleOptions={hairstyleOptions}
            onClose={handleHairstyleBrowserClose}
            onDisabledSelect={handleDisabledHairstyleSelect}
            onSelect={handleHairstyleSelect}
          />
        )}

        {!isConnectionPending && activeModal === "candidate-save" && (
          <ArCandidateSaveModal
            memo={candidateMemo}
            onClose={handleModalClose}
            setMemo={setCandidateMemo}
          />
        )}
      </section>
    </cap-page>
  );
};

export default ArHairstylePage;
