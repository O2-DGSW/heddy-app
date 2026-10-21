import { font, lightTheme } from "@heddy/design-tokens";
import { setupPage } from "@capgo/capacitor-transitions/react";
import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";

import { useGetArGrooms } from "@/entities/ar-groom";
import type { ArHairstyleOption, HairstyleOptionId } from "@/entities/ar-groom";
import { useArServerConnection } from "@/features/ar-session";
import { useArHairstyle } from "../../model/useArHairstyle";
import { getCircularHairstyleOption, ORIGINAL_HAIRSTYLE_OPTION } from "../../model/constants";
import { cn, showInfoToast } from "@/shared";
import ArControlBar from "../ArControlBar";
import ArHairstyleBrowser from "../ArHairstyleBrowser";
import { ArCameraViewport, ArHairstyleCarousel } from "@/features/ar-preview";
import ArStatusNotice from "../ArStatusNotice";
import ArConnectionLoader from "../ArConnectionLoader";

const prioritizeHippiePerm = (options: ArHairstyleOption[]) => {
  const firstOption = options.find(option => option.name === "hippie-perm");

  if (!firstOption) return options;

  return [firstOption, ...options.filter(option => option.name !== firstOption.name)];
};

const normalizeGroomName = (value: string) => value.replace(/\s/g, "").toLowerCase();

const ArHairstylePage = () => {
  const location = useLocation();
  const pageRef = useRef<HTMLElement>(null);
  const cameraPreviewRef = useRef<HTMLVideoElement>(null);
  const handlePageEnterRef = useRef<() => void>(() => undefined);
  const handlePageLeaveRef = useRef<() => void>(() => undefined);
  const appliedRecommendationRef = useRef<string | null>(null);
  const appliedOfferRef = useRef<unknown>(null);
  const [isHairstyleBrowserOpen, setIsHairstyleBrowserOpen] = useState(false);
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
  const searchParams = new URLSearchParams(location.search);
  const requestedGroom = searchParams.get("groom");
  const requestedColor = searchParams.get("groom_color");
  const requestKey = `${location.key}:${requestedGroom}`;
  const normalizedGroom = normalizeGroomName(requestedGroom ?? "");
  // 서버와 동일하게 이름·표시명을 공백 및 대소문자 구분 없이 찾는다.
  const requestedHairstylePosition = hairstyleOptions.findIndex(
    option =>
      option.name !== "" &&
      (normalizeGroomName(option.name) === normalizedGroom ||
        normalizeGroomName(option.label) === normalizedGroom)
  );
  // 목록보다 offer 준비가 빠른 경우에도 서버가 초기 선택을 해석할 수 있게 원래 요청을 보낸다.
  const selectedGroom =
    requestedGroom && appliedRecommendationRef.current !== requestKey
      ? (hairstyleOptions[requestedHairstylePosition]?.name ?? requestedGroom)
      : selectedHairstyle.name;
  const {
    offerGroom,
    connectionStatus,
    connectionFeedback,
    reconnectMessage,
    controlReady,
    isPreviewMirrored,
    groomState,
    foreheadState,
    handleGroomRetry,
    handleForeheadRefresh,
    handlePageEnter,
    handlePageLeave,
    handleReconnect,
    handleCameraSwitch,
  } = useArServerConnection(cameraPreviewRef, selectedGroom, fitSettings);
  const canSelectHairstyle = controlReady;
  const isConnectionPending = connectionStatus !== "connected";
  const isStyleLoading =
    selectedGroom !== "" && groomState.groom === selectedGroom && groomState.status === "loading";
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

  const handleHairstyleBrowserOpen = () => setIsHairstyleBrowserOpen(true);
  const handleHairstyleBrowserClose = () => setIsHairstyleBrowserOpen(false);

  useEffect(() => {
    if (
      !requestedGroom ||
      isGroomsPending ||
      groomsError ||
      appliedRecommendationRef.current === requestKey
    )
      return;

    appliedRecommendationRef.current = requestKey;
    if (requestedColor && /^#[0-9a-f]{6}$/i.test(requestedColor)) {
      handleFitSettingsChange({ groom_color: requestedColor });
    }
    if (requestedHairstylePosition < 0) {
      selectHairstylePosition(0);
      showInfoToast("추천한 스타일은 현재 AR에서 사용할 수 없어요. 다른 스타일을 골라 주세요.");
      return;
    }
    // 연결 전에도 원하는 선택을 보관한다. 연결이 준비되면 기존 fit 흐름에서 적용한다.
    selectHairstylePosition(requestedHairstylePosition);
  }, [
    groomsError,
    isGroomsPending,
    location.key,
    requestedGroom,
    requestedColor,
    requestKey,
    handleFitSettingsChange,
    requestedHairstylePosition,
    selectHairstylePosition,
  ]);

  useEffect(() => {
    if (!offerGroom || appliedOfferRef.current === offerGroom || isGroomsPending) return;
    appliedOfferRef.current = offerGroom;
    // 응답을 기다리는 사이 사용자가 고른 다른 스타일은 덮어쓰지 않는다.
    if (offerGroom.requested !== selectedGroom) return;
    const index = hairstyleOptions.findIndex(option => option.name === offerGroom.applied);
    selectHairstylePosition(index >= 0 ? index : 0);
  }, [offerGroom, isGroomsPending, selectedGroom, hairstyleOptions, selectHairstylePosition]);

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
          className="relative min-h-0 flex-1 overflow-hidden"
          style={{
            backgroundColor: isConnectionPending
              ? lightTheme.background.normal
              : lightTheme.label.normal,
          }}
        >
          <div
            aria-hidden={isConnectionPending}
            aria-busy={isStyleLoading}
            className={cn("absolute inset-0", isConnectionPending && "invisible")}
            inert={isConnectionPending}
          >
            <ArCameraViewport videoRef={cameraPreviewRef} fit="cover" mirrored={isPreviewMirrored}>
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
                  handleCameraSwitch={handleCameraSwitch}
                  handleHairstyleBrowserOpen={handleHairstyleBrowserOpen}
                  isHairstyleBrowserOpen={isHairstyleBrowserOpen}
                  canSelectColor={controlReady}
                  selectedColor={fitSettings.groom_color}
                  onColorSelect={handleColorSelect}
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
            </ArCameraViewport>
          </div>
          {isConnectionPending && (
            <ArConnectionLoader
              key={connectionFeedback}
              feedback={connectionFeedback}
              onRetry={handleReconnect}
            />
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
