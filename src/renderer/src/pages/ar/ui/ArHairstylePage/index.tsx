import { font, lightTheme } from "@heddy/design-tokens";
import { useEffect, useRef, useState, type CSSProperties } from "react";

import bookmarkIcon from "../../assets/bookmark.svg";
import downPermImage from "../../assets/down-perm.png";
import minimizeIcon from "../../assets/minimize.svg";
import modalCloseImage from "../../assets/modal-close.png";
import noStyleIcon from "../../assets/no-style.svg";
import refreshIcon from "../../assets/refresh.svg";
import resizeIcon from "../../assets/resize.svg";
import { cn, useBottomBarVisibility } from "@/shared";

const HAIRSTYLE_OPTIONS = [
  { id: "down-perm-1" },
  { id: "none" },
  { id: "down-perm-2" },
  { id: "down-perm-3" },
  { id: "down-perm-4" },
] as const;

const HAIRSTYLE_SIZES = [50, 62, 80, 62, 50] as const;

const HAIRSTYLE_GAP = 25;
const HAIRSTYLE_CENTER_POSITION = 202;

const EXPANDED_BOTTOM_ITEMS = ["홈", "기록", "추천", "프로필"] as const;

type HairstyleOption = (typeof HAIRSTYLE_OPTIONS)[number];

const HAIR_COLOR_OPTIONS = [
  { id: "natural-black", color: lightTheme.label.strong },
  { id: "dark-brown", color: "#100604" },
  { id: "brown", color: "#3B150E" },
  { id: "auburn", color: "#4A251F" },
  { id: "ash-brown", color: "#342D2D" },
] as const;

type ArModal = "candidate-save" | "capture";

type PlaceholderStyle = CSSProperties & {
  "--placeholder-color": string;
};

const getHairstyleSizes = (selectedIndex: number) =>
  HAIRSTYLE_OPTIONS.map((_, index) => {
    const distance = Math.abs(index - selectedIndex);

    if (distance === 0) {
      return HAIRSTYLE_SIZES[2];
    }

    if (distance === 1) {
      return HAIRSTYLE_SIZES[1];
    }

    return HAIRSTYLE_SIZES[0];
  });

const getHairstyleTrackOffset = (sizes: number[], selectedIndex: number) => {
  const selectedCenter =
    sizes.slice(0, selectedIndex).reduce((total, size) => total + size, 0) +
    HAIRSTYLE_GAP * selectedIndex +
    sizes[selectedIndex] / 2;

  return HAIRSTYLE_CENTER_POSITION - selectedCenter;
};

const CANDIDATE_MEMO_STYLE = {
  "--placeholder-color": lightTheme.line.normal,
  backgroundColor: lightTheme.background.neutral,
  color: lightTheme.label.neutral,
} satisfies PlaceholderStyle;

const ArHairstylePage = () => {
  const cameraPreviewRef = useRef<HTMLVideoElement>(null);
  const { setIsBottomBarHidden } = useBottomBarVisibility();
  const [selectedHairstyleId, setSelectedHairstyleId] =
    useState<HairstyleOption["id"]>("down-perm-2");
  const [selectedColorId, setSelectedColorId] = useState<string>(HAIR_COLOR_OPTIONS[0].id);
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeModal, setActiveModal] = useState<ArModal | null>(null);
  const [candidateMemo, setCandidateMemo] = useState("");

  const handleModalOpen = (modal: ArModal) => {
    setActiveModal(modal);
  };

  const handleModalClose = () => {
    setActiveModal(null);
  };

  const handleStyleReset = () => {
    setSelectedHairstyleId("down-perm-2");
    setSelectedColorId(HAIR_COLOR_OPTIONS[0].id);
  };

  const handleHairstyleSelect = (selectedId: HairstyleOption["id"]) => {
    setSelectedHairstyleId(selectedId);
  };

  const handleExpandedToggle = () => {
    setIsExpanded(isCurrentExpanded => !isCurrentExpanded);
  };

  useEffect(() => {
    if (!navigator.mediaDevices?.getUserMedia) {
      return;
    }

    let isUnmounted = false;
    let cameraStream: MediaStream | null = null;

    const startCameraPreview = async () => {
      try {
        cameraStream = await navigator.mediaDevices.getUserMedia({
          audio: false,
          video: { facingMode: { ideal: "user" } },
        });

        if (isUnmounted) {
          cameraStream.getTracks().forEach(track => track.stop());
          return;
        }

        if (cameraPreviewRef.current) {
          cameraPreviewRef.current.srcObject = cameraStream;
          void cameraPreviewRef.current.play().catch(() => undefined);
        }
      } catch {
        // 카메라 권한을 거부했거나 사용할 수 없는 경우 검은 AR 미리보기 화면을 유지한다.
      }
    };

    void startCameraPreview();

    return () => {
      isUnmounted = true;
      cameraStream?.getTracks().forEach(track => track.stop());
    };
  }, []);

  useEffect(() => {
    setIsBottomBarHidden(isExpanded);

    return () => {
      setIsBottomBarHidden(false);
    };
  }, [isExpanded, setIsBottomBarHidden]);

  const selectedHairstyleIndex = HAIRSTYLE_OPTIONS.findIndex(
    option => option.id === selectedHairstyleId
  );
  const hairstyleSizes = getHairstyleSizes(selectedHairstyleIndex);
  const hairstyleTrackOffset = getHairstyleTrackOffset(hairstyleSizes, selectedHairstyleIndex);

  return (
    <section
      aria-labelledby="ar-hairstyle-title"
      className="ar-motion-page-enter flex min-h-full flex-col overflow-hidden"
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
          "relative min-h-[656px] flex-1 overflow-hidden",
          isExpanded && "fixed inset-x-0 z-[25] min-h-0"
        )}
        style={{
          backgroundColor: lightTheme.label.normal,
          ...(isExpanded && {
            bottom: "0px",
            top: "0px",
          }),
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

        <span
          className={cn(
            "absolute right-[16px] rounded-[5px] px-[8px] py-[4px]",
            isExpanded ? "top-[24px]" : "top-[15px]",
            font.label.medium
          )}
          style={{
            backgroundColor: lightTheme.primary.normal,
            color: lightTheme.label.buttonText,
          }}
        >
          얼굴 인식 중
        </span>

        <div
          aria-label="헤어 컬러 선택"
          className={cn(
            "absolute left-[31px] flex flex-col gap-[11px]",
            isExpanded ? "top-[185px]" : "top-[172px]"
          )}
        >
          {HAIR_COLOR_OPTIONS.map(option => {
            const isSelected = option.id === selectedColorId;

            return (
              <button
                aria-label={`${option.id} 컬러 선택`}
                aria-pressed={isSelected}
                className="ar-motion-press h-[36px] w-[36px] rounded-full"
                key={option.id}
                onClick={() => setSelectedColorId(option.id)}
                style={{
                  backgroundColor: option.color,
                  borderColor: isSelected ? "#F4FBF8" : "rgba(128, 128, 128, 0.3)",
                  borderWidth: isSelected ? "2px" : "0.818841px",
                }}
                type="button"
              />
            );
          })}
        </div>

        <div
          className={cn(
            "absolute left-1/2 flex w-[332px] -translate-x-1/2 items-center gap-[8px]",
            isExpanded ? "top-[549px]" : "bottom-[142px]"
          )}
        >
          <button
            aria-label="후보 스타일 저장"
            className="ar-motion-press flex h-[37px] w-[37px] shrink-0 items-center justify-center rounded-full bg-white/20 shadow-[0_0_8.222px_rgba(0,0,0,0.07)] backdrop-blur-[1.779px]"
            onClick={() => handleModalOpen("candidate-save")}
            type="button"
          >
            <img alt="" className="h-[19px] w-[15px]" src={bookmarkIcon} />
          </button>
          <span
            className={cn(
              "flex h-[37px] flex-1 items-center justify-center whitespace-nowrap rounded-full bg-white/20 px-[43px] py-[9px] text-center shadow-[0_0_11.556px_rgba(0,0,0,0.07)] backdrop-blur",
              font.label.medium
            )}
            style={{ color: lightTheme.label.disable }}
          >
            다운펌 - 내추럴 블랙
          </span>
          <button
            aria-label="스타일 선택 초기화"
            className="ar-motion-press flex h-[37px] w-[37px] shrink-0 items-center justify-center rounded-full bg-white/20 shadow-[0_0_8.222px_rgba(0,0,0,0.07)] backdrop-blur-[1.779px]"
            onClick={handleStyleReset}
            type="button"
          >
            <img alt="" className="h-[20px] w-[20px]" src={refreshIcon} />
          </button>
          <button
            aria-label={isExpanded ? "AR 화면 축소" : "AR 화면 확대"}
            className="ar-motion-press flex h-[37px] w-[37px] shrink-0 items-center justify-center rounded-full bg-white/20 shadow-[0_0_8.222px_rgba(0,0,0,0.07)] backdrop-blur-[1.779px]"
            onClick={handleExpandedToggle}
            type="button"
          >
            <img
              alt=""
              className="h-[20.5px] w-[20.5px]"
              src={isExpanded ? minimizeIcon : resizeIcon}
            />
          </button>
        </div>

        <div
          aria-label="헤어스타일 선택"
          className={cn(
            "absolute left-1/2 w-[404px] -translate-x-1/2",
            isExpanded ? "top-[626px]" : "bottom-[24px]"
          )}
        >
          <div
            className="flex items-center gap-[25px] transition-transform duration-[280ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none"
            style={{ transform: `translateX(${hairstyleTrackOffset}px)` }}
          >
            {HAIRSTYLE_OPTIONS.map((option, index) => {
              const isSelected = option.id === selectedHairstyleId;
              const isNoStyle = option.id === "none";
              const size = hairstyleSizes[index];

              return (
                <div
                  className="shrink-0 transition-[width,height] duration-[280ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none"
                  key={option.id}
                  style={{ height: size, width: size }}
                >
                  <button
                    aria-label={isNoStyle ? "헤어스타일 적용 안 함" : "다운펌 선택"}
                    aria-pressed={isSelected}
                    className={cn(
                      "ar-motion-press h-full w-full overflow-hidden rounded-full shadow-[0_0_9px_rgba(0,0,0,0.1)]",
                      size === 80 && "bg-[#F4FBF8]/90 p-[4px]",
                      isSelected && size !== 80 && "ring-[2px] ring-[#F4FBF8]"
                    )}
                    onClick={() => handleHairstyleSelect(option.id)}
                    type="button"
                  >
                    {isNoStyle ? (
                      <span className="flex h-full w-full items-center justify-center rounded-full bg-[rgba(103,103,103,0.3)] backdrop-blur-[5px]">
                        <img alt="" className="h-[28px] w-[28px]" src={noStyleIcon} />
                      </span>
                    ) : (
                      <span
                        className={cn(
                          "block h-full w-full overflow-hidden rounded-full",
                          size === 80 && "border-[2.5px] border-black"
                        )}
                      >
                        <img
                          alt="다운펌 헤어스타일"
                          className="h-full w-full object-cover"
                          src={downPermImage}
                        />
                      </span>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {isExpanded && (
          <div
            aria-label="확대 AR 하단 메뉴"
            className={cn(
              "absolute left-1/2 top-[746px] flex -translate-x-1/2 items-center gap-[33px]",
              font.label.medium
            )}
            style={{ color: lightTheme.label.assistive }}
          >
            {EXPANDED_BOTTOM_ITEMS.map((item, index) => (
              <span
                className={cn(
                  "text-center",
                  index < 3 && "w-[35px]",
                  index === 3 && "whitespace-nowrap"
                )}
                key={item}
              >
                {item}
              </span>
            ))}
          </div>
        )}

        {isExpanded && (
          <div
            aria-hidden="true"
            className="absolute inset-x-0 bottom-0 flex h-[34px] items-end justify-center bg-white pb-[8px]"
          >
            <span className="h-[5px] w-[144px] rounded-full bg-black" />
          </div>
        )}
      </main>

      {activeModal === "candidate-save" && (
        <div
          aria-labelledby="candidate-save-modal-title"
          aria-modal="true"
          className="ar-motion-overlay-enter fixed inset-y-0 left-1/2 z-50 flex w-full max-w-[430px] -translate-x-1/2 items-center justify-center bg-black/50"
          role="dialog"
        >
          <div className="translate-y-[11.5px]">
            <div
              className="ar-motion-modal-enter w-[290px] rounded-[10px] px-[14px] pb-[14px] pt-[15px]"
              style={{ backgroundColor: lightTheme.background.normal }}
            >
              <div className="flex h-[28px] items-start justify-between">
                <h2
                  className={font.headline2.semiBold}
                  id="candidate-save-modal-title"
                  style={{ color: lightTheme.label.neutral }}
                >
                  후보 스타일 저장
                </h2>
                <button
                  aria-label="후보 스타일 저장 모달 닫기"
                  className="ar-motion-press flex h-[28px] w-[28px] items-center justify-center rounded-full"
                  onClick={handleModalClose}
                  style={{ backgroundColor: lightTheme.fill.normal }}
                  type="button"
                >
                  <img alt="" className="h-[23px] w-[23px]" src={modalCloseImage} />
                </button>
              </div>

              <label className="mt-[14px] flex flex-col gap-[10px]">
                <span
                  className={font.label.semiBold}
                  style={{ color: lightTheme.label.alternative }}
                >
                  메모
                </span>
                <textarea
                  className={cn(
                    "h-[86px] resize-none rounded-[15px] px-[12px] py-[9px] outline-none",
                    "placeholder:text-[var(--placeholder-color)]",
                    font.caption.medium
                  )}
                  onChange={event => setCandidateMemo(event.target.value)}
                  placeholder="(선택) 메모 내용을 입력해 주세요."
                  style={CANDIDATE_MEMO_STYLE}
                  value={candidateMemo}
                />
              </label>

              <div className="mt-[16px] flex gap-[6px]">
                <button
                  className={cn(
                    "ar-motion-press h-[26px] w-[128px] rounded-[5px] border",
                    font.label.medium
                  )}
                  onClick={handleModalClose}
                  style={{
                    backgroundColor: lightTheme.label.buttonText,
                    borderColor: lightTheme.fill.neutral,
                    color: lightTheme.label.alternative,
                  }}
                  type="button"
                >
                  취소
                </button>
                <button
                  className={cn(
                    "ar-motion-press h-[26px] w-[128px] rounded-[5px]",
                    font.label.medium
                  )}
                  onClick={handleModalClose}
                  style={{
                    backgroundColor: lightTheme.primary.normal,
                    color: lightTheme.label.buttonText,
                  }}
                  type="button"
                >
                  저장
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeModal === "capture" && (
        <div
          aria-labelledby="capture-modal-title"
          aria-modal="true"
          className="ar-motion-overlay-enter fixed inset-y-0 left-1/2 z-50 flex w-full max-w-[430px] -translate-x-1/2 items-center justify-center bg-black/50"
          role="dialog"
        >
          <div className="-translate-y-[31.5px]">
            <div
              className="ar-motion-modal-enter h-[525px] w-[290px] rounded-[10px] px-[14px] pb-[15px] pt-[15px]"
              style={{ backgroundColor: lightTheme.background.normal }}
            >
              <div className="flex h-[28px] items-start justify-between">
                <h2
                  className={font.headline2.semiBold}
                  id="capture-modal-title"
                  style={{ color: lightTheme.label.neutral }}
                >
                  캡쳐 이미지
                </h2>
                <button
                  aria-label="캡쳐 이미지 모달 닫기"
                  className="ar-motion-press flex h-[28px] w-[28px] items-center justify-center rounded-full"
                  onClick={handleModalClose}
                  style={{ backgroundColor: lightTheme.fill.normal }}
                  type="button"
                >
                  <img alt="" className="h-[23px] w-[23px]" src={modalCloseImage} />
                </button>
              </div>

              <div className="mt-[24px]">
                <div
                  aria-label="캡쳐 이미지 미리보기"
                  className="h-[367px] w-[263px] rounded-[10px]"
                  style={{ backgroundColor: lightTheme.label.normal }}
                />
                <p
                  className={cn("mt-[10px]", font.caption.medium)}
                  style={{ color: lightTheme.label.alternative }}
                >
                  ※내 기기에만 저장되고 서버로 올라가지 않아요.
                </p>
              </div>

              <div className="mt-[24px] flex gap-[6px]">
                <button
                  className={cn(
                    "ar-motion-press h-[26px] w-[128px] rounded-[5px] border",
                    font.label.medium
                  )}
                  onClick={handleModalClose}
                  style={{
                    backgroundColor: lightTheme.label.buttonText,
                    borderColor: lightTheme.fill.neutral,
                    color: lightTheme.label.alternative,
                  }}
                  type="button"
                >
                  취소
                </button>
                <button
                  className={cn(
                    "ar-motion-press h-[26px] w-[128px] rounded-[5px]",
                    font.label.medium
                  )}
                  onClick={handleModalClose}
                  style={{
                    backgroundColor: lightTheme.primary.normal,
                    color: lightTheme.label.buttonText,
                  }}
                  type="button"
                >
                  저장
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default ArHairstylePage;
