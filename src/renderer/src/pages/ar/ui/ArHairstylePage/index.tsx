import { font, lightTheme } from "@heddy/design-tokens";
import { useEffect, useRef } from "react";

import { useArServerConnection } from "../../model/useArServerConnection";
import { useGetArGrooms } from "../../model/useGetArGrooms.query";
import type { HairstyleOptionId } from "../../model/types";
import { useArHairstyle } from "../../model/useArHairstyle";
import { useFaceYaw } from "../../model/useFaceYaw";
import { getCircularHairstyleOption, ORIGINAL_HAIRSTYLE_OPTION } from "../../model/constants";
import { cn, useBottomBarVisibility } from "@/shared";
import ArCandidateSaveModal from "../ArCandidateSaveModal";
import ArColorPicker from "../ArColorPicker";
import ArControlBar from "../ArControlBar";
import ArExpandedBottomMenu from "../ArExpandedBottomMenu";
import ArHairstyleCarousel from "../ArHairstyleCarousel";
import ArRecognitionBadge from "../ArRecognitionBadge";

const ArHairstylePage = () => {
  const cameraPreviewRef = useRef<HTMLVideoElement>(null);
  const faceTrackingVideoRef = useRef<HTMLVideoElement>(null);
  const { setIsBottomBarHidden } = useBottomBarVisibility();
  const {
    data: serverHairstyleOptions = [],
    error: groomsError,
    isPending: isGroomsPending,
    refetch: refetchGrooms,
  } = useGetArGrooms();
  const hairstyleOptions = [ORIGINAL_HAIRSTYLE_OPTION, ...serverHairstyleOptions];
  const {
    activeHairstylePosition,
    activeModal,
    candidateMemo,
    handleExpandedToggle,
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
  const selectedGroom =
    selectedHairstyle.id === ORIGINAL_HAIRSTYLE_OPTION.id ? "" : selectedHairstyle.id;
  const { yaw: clientFaceYaw } = useFaceYaw(faceTrackingVideoRef);
  const { connectionStatus, errorMessage, controlReady, groomState, foreheadState, stats } =
    useArServerConnection(cameraPreviewRef, faceTrackingVideoRef, selectedGroom, fitSettings);
  const faceYaw = stats?.yaw_ema ?? stats?.yaw ?? clientFaceYaw;
  const isFaceTracked = typeof faceYaw === "number";
  const isForeheadLoading = foreheadState.status === "loading";
  const canAdjust =
    controlReady && selectedGroom !== "" && groomState.status === "ok" && !isForeheadLoading;
  const listMessage = isGroomsPending
    ? "헤어스타일을 불러오는 중"
    : (groomsError?.message ??
      (serverHairstyleOptions.length === 0 ? "서버에 등록된 헤어스타일이 없습니다." : null));

  const handleHairstyleSelect = (id: HairstyleOptionId) => {
    if (controlReady && !isForeheadLoading) selectHairstyle(id);
  };

  const handleColorSelect = (color: string) => handleFitSettingsChange({ groom_color: color });

  const handleReset = () => {
    if (!isForeheadLoading) handleStyleReset();
  };

  useEffect(() => {
    setIsBottomBarHidden(isExpanded);

    return () => {
      setIsBottomBarHidden(false);
    };
  }, [isExpanded, setIsBottomBarHidden]);

  return (
    <cap-page>
      <section
        aria-labelledby="ar-hairstyle-title"
        className="ar-motion-page-enter flex h-full min-h-0 flex-col overflow-hidden"
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
            errorMessage={errorMessage}
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
            <ArControlBar
              handleExpandedToggle={handleExpandedToggle}
              handleModalOpen={() => handleModalOpen("candidate-save")}
              handleStyleReset={handleReset}
              isExpanded={isExpanded}
              selectedHairstyleLabel={selectedHairstyle.label}
            />
            <ArHairstyleCarousel
              activeHairstylePosition={activeHairstylePosition}
              hairstyleOptions={hairstyleOptions}
              loadingMessage={listMessage}
              disabled={!controlReady || isForeheadLoading}
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
        </main>

        {activeModal === "candidate-save" && (
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
