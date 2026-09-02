import { font, lightTheme } from "@heddy/design-tokens";
import { useEffect, useRef } from "react";

import { useArServerConnection } from "../../model/useArServerConnection";
import { useArHairstyle } from "../../model/useArHairstyle";
import { getCircularHairstyleOption } from "../../model/constants";
import { cn, useBottomBarVisibility } from "@/shared";
import ArCandidateSaveModal from "../ArCandidateSaveModal";
import ArCaptureModal from "../ArCaptureModal";
import ArColorPicker from "../ArColorPicker";
import ArControlBar from "../ArControlBar";
import ArExpandedBottomMenu from "../ArExpandedBottomMenu";
import ArHairstyleCarousel from "../ArHairstyleCarousel";
import ArRecognitionBadge from "../ArRecognitionBadge";

const ArHairstylePage = () => {
  const cameraPreviewRef = useRef<HTMLVideoElement>(null);
  const { setIsBottomBarHidden } = useBottomBarVisibility();
  const {
    activeHairstylePosition,
    activeModal,
    candidateMemo,
    handleExpandedToggle,
    handleHairstyleSelect,
    handleModalClose,
    handleModalOpen,
    handleStyleReset,
    isExpanded,
    selectedColorId,
    setCandidateMemo,
    setSelectedColorId,
  } = useArHairstyle();
  const selectedHairstyle = getCircularHairstyleOption(activeHairstylePosition);
  const { connectionStatus, errorMessage } = useArServerConnection(
    cameraPreviewRef,
    selectedHairstyle.id
  );

  useEffect(() => {
    setIsBottomBarHidden(isExpanded);

    return () => {
      setIsBottomBarHidden(false);
    };
  }, [isExpanded, setIsBottomBarHidden]);

  return (
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
          "relative min-h-0 flex-1 overflow-hidden",
          isExpanded && "fixed inset-x-0 z-[25] min-h-0"
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
          className="absolute inset-0 h-full w-full bg-black object-cover [transform:scaleX(-1)]"
          muted
          playsInline
          ref={cameraPreviewRef}
        />

        <ArRecognitionBadge
          connectionStatus={connectionStatus}
          errorMessage={errorMessage}
          isExpanded={isExpanded}
        />
        <ArColorPicker
          isExpanded={isExpanded}
          selectedColorId={selectedColorId}
          setSelectedColorId={setSelectedColorId}
        />
        <ArControlBar
          handleExpandedToggle={handleExpandedToggle}
          handleModalOpen={() => handleModalOpen("candidate-save")}
          handleStyleReset={handleStyleReset}
          isExpanded={isExpanded}
        />
        <ArHairstyleCarousel
          activeHairstylePosition={activeHairstylePosition}
          isExpanded={isExpanded}
          onSelect={handleHairstyleSelect}
        />
        {isExpanded && <ArExpandedBottomMenu />}
      </main>

      {activeModal === "candidate-save" && (
        <ArCandidateSaveModal
          memo={candidateMemo}
          onClose={handleModalClose}
          setMemo={setCandidateMemo}
        />
      )}
      {activeModal === "capture" && <ArCaptureModal onClose={handleModalClose} />}
    </section>
  );
};

export default ArHairstylePage;
