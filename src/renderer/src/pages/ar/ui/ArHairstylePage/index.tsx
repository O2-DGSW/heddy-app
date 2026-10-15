import { font, lightTheme } from "@heddy/design-tokens";
import { setupPage } from "@capgo/capacitor-transitions/react";
import { useEffect, useRef, useState } from "react";

import { useGetArGrooms } from "@/entities/ar-groom";
import type { ArHairstyleOption, HairstyleOptionId } from "@/entities/ar-groom";
import { useDeleteSavedStyle, usePostSavedStyle } from "@/entities/saved-style";
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

const prioritizeHippiePerm = (options: ArHairstyleOption[]) => {
  const firstOption = options.find(option => option.name === "hippie-perm");

  if (!firstOption) return options;

  return [firstOption, ...options.filter(option => option.name !== firstOption.name)];
};

const ArHairstylePage = () => {
  const pageRef = useRef<HTMLElement>(null);
  const cameraPreviewRef = useRef<HTMLVideoElement>(null);
  const faceTrackingVideoRef = useRef<HTMLVideoElement>(null);
  const handlePageEnterRef = useRef<() => void>(() => undefined);
  const handlePageLeaveRef = useRef<() => void>(() => undefined);
  const [isHairstyleBrowserOpen, setIsHairstyleBrowserOpen] = useState(false);
  const [savedStyleIdsByHairstyle, setSavedStyleIdsByHairstyle] = useState<
    Record<string, string | null>
  >({});
  const saveStyleMutation = usePostSavedStyle();
  const deleteSavedStyleMutation = useDeleteSavedStyle();
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
    handleStyleReset,
    fitSettings,
    handleFitSettingsChange,
  } = useArHairstyle(hairstyleOptions);
  const selectedHairstyle = getCircularHairstyleOption(activeHairstylePosition, hairstyleOptions);
  const selectedGroom = selectedHairstyle.name;
  const savedStyleId = savedStyleIdsByHairstyle[selectedHairstyle.name] ?? null;
  const {
    connectionStatus,
    errorMessage,
    controlReady,
    groomState,
    foreheadState,
    hasServerYaw,
    handleGroomRetry,
    handleForeheadRefresh,
    handlePageEnter,
    handlePageLeave,
    handleReconnect,
  } = useArServerConnection(cameraPreviewRef, faceTrackingVideoRef, selectedGroom, fitSettings);
  // 서버가 yaw를 주는 동안에는 기기 감지가 필요 없어 멈춘다.
  const { isFaceTracked: isClientFaceTracked } = useFaceYaw(faceTrackingVideoRef, !hasServerYaw);
  const isFaceTracked = hasServerYaw || isClientFaceTracked;
  const isForeheadLoading = foreheadState.status === "loading";
  const isConnectionPending = connectionStatus === "idle" || connectionStatus === "connecting";
  const isStyleLoading = selectedGroom !== "" && groomState.status === "loading";
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

  const handleCandidateSave = async () => {
    const hairstyleId = selectedHairstyle.name;

    if (!hairstyleId) {
      showInfoToast("원본 스타일은 저장할 수 없어요. 헤어스타일을 선택해 주세요.");
      return;
    }

    try {
      if (savedStyleId) {
        await deleteSavedStyleMutation.mutateAsync(savedStyleId);
        setSavedStyleIdsByHairstyle(current => ({ ...current, [hairstyleId]: null }));
        showSuccessToast("후보 스타일 저장을 취소했어요.");
      } else {
        const savedStyle = await saveStyleMutation.mutateAsync({ hairstyle_id: hairstyleId });
        setSavedStyleIdsByHairstyle(current => ({
          ...current,
          [hairstyleId]: savedStyle.saved_style_id,
        }));
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
          style={{ backgroundColor: lightTheme.label.normal }}
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
                  className="w-[min(24rem,80vw)] animate-spin text-white drop-shadow-[0_1px_5px_rgba(0,0,0,0.5)] motion-reduce:animate-none"
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
                handleCandidateSave={() => void handleCandidateSave()}
                handleHairstyleBrowserOpen={handleHairstyleBrowserOpen}
                handleStyleReset={handleReset}
                isCandidateSaved={Boolean(savedStyleId)}
                isHairstyleBrowserOpen={isHairstyleBrowserOpen}
                isSavePending={saveStyleMutation.isPending || deleteSavedStyleMutation.isPending}
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
      </section>
    </cap-page>
  );
};

export default ArHairstylePage;
