import { font, lightTheme } from "@heddy/design-tokens";
import { useState, type CSSProperties } from "react";

import cameraIcon from "../../assets/camera.svg";
import downPermImage from "../../assets/down-perm.png";
import eyeIcon from "../../assets/eye.svg";
import faceGuideImage from "../../assets/face-guide.png";
import modalCloseImage from "../../assets/modal-close.png";
import refreshIcon from "../../assets/refresh.svg";
import { cn } from "@/shared";

const HAIRSTYLE_OPTIONS = Array.from({ length: 5 }, (_, index) => ({
  id: `down-perm-${index + 1}`,
  label: "다운펌",
}));

const COLOR_OPTIONS = Array.from({ length: 5 }, (_, index) => ({
  id: `natural-black-${index + 1}`,
  label: "내추럴 블랙",
}));

const SELECTED_BACKGROUND_COLOR = "#F4FBF8";

type ArModal = "candidate-save" | "capture";

type PlaceholderStyle = CSSProperties & {
  "--placeholder-color": string;
};

const CANDIDATE_MEMO_STYLE = {
  "--placeholder-color": lightTheme.line.normal,
  backgroundColor: lightTheme.background.neutral,
  color: lightTheme.label.neutral,
} satisfies PlaceholderStyle;

const ArHairstylePage = () => {
  const [selectedHairstyleId, setSelectedHairstyleId] = useState(HAIRSTYLE_OPTIONS[0].id);
  const [selectedColorId, setSelectedColorId] = useState(COLOR_OPTIONS[1].id);
  const [isFaceGuideVisible, setIsFaceGuideVisible] = useState(true);
  const [activeModal, setActiveModal] = useState<ArModal | null>(null);
  const [candidateMemo, setCandidateMemo] = useState("");

  const handleFaceGuideToggle = () => {
    setIsFaceGuideVisible(isVisible => !isVisible);
  };

  const handleFaceGuideReset = () => {
    setIsFaceGuideVisible(true);
  };

  const handleModalOpen = (modal: ArModal) => {
    setActiveModal(modal);
  };

  const handleModalClose = () => {
    setActiveModal(null);
  };

  return (
    <section
      aria-labelledby="ar-hairstyle-title"
      className="flex min-h-full flex-col overflow-x-clip"
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
        className="flex flex-1 flex-col gap-[28px] px-[19px] pb-[22px] pt-[29px]"
        style={{ backgroundColor: lightTheme.fill.normal }}
      >
        <section aria-label="AR 미리보기" className="flex flex-col items-center gap-[28px]">
          <div
            className="relative h-[367px] w-full max-w-[340px] overflow-hidden rounded-[10px]"
            style={{ backgroundColor: lightTheme.label.normal }}
          >
            <div className="absolute inset-x-[16px] top-[14px] flex items-center justify-between">
              <span
                className={cn("rounded-[5px] px-[8px] py-[4px]", font.label.medium)}
                style={{
                  backgroundColor: lightTheme.primary.normal,
                  color: lightTheme.label.buttonText,
                }}
              >
                얼굴 인식 중
              </span>
              <span className={font.label.medium} style={{ color: lightTheme.background.normal }}>
                후보 목록
              </span>
            </div>

            {isFaceGuideVisible && (
              <img
                alt="얼굴 가이드"
                className="pointer-events-none absolute left-1/2 top-1/2 h-[160px] w-[128px] -translate-x-1/2 -translate-y-1/2"
                src={faceGuideImage}
              />
            )}

            <div className="absolute inset-x-0 top-[304px] flex items-center justify-center gap-[14px]">
              <button
                aria-label={isFaceGuideVisible ? "얼굴 가이드 숨기기" : "얼굴 가이드 표시"}
                className="flex h-[27px] w-[27px] items-center justify-center rounded-full shadow-[0_0_6px_rgba(0,0,0,0.07)]"
                onClick={handleFaceGuideToggle}
                style={{ backgroundColor: "rgba(255, 255, 255, 0.16)" }}
                type="button"
              >
                <img alt="" className="h-[10px] w-[14.6667px]" src={eyeIcon} />
              </button>
              <button
                aria-label="카메라 제어"
                className="flex h-[44px] w-[44px] items-center justify-center rounded-full shadow-[0_0_6px_rgba(0,0,0,0.07)]"
                style={{ backgroundColor: lightTheme.background.normal }}
                type="button"
              >
                <img alt="" className="h-[18px] w-[20px]" src={cameraIcon} />
              </button>
              <button
                aria-label="얼굴 가이드 다시 표시"
                className="flex h-[27px] w-[27px] items-center justify-center rounded-full shadow-[0_0_6px_rgba(0,0,0,0.07)]"
                onClick={handleFaceGuideReset}
                style={{ backgroundColor: "rgba(255, 255, 255, 0.16)" }}
                type="button"
              >
                <img alt="" className="h-[11.6667px] w-[11.6667px]" src={refreshIcon} />
              </button>
            </div>
          </div>

          <section
            aria-labelledby="hairstyle-options-title"
            className="flex w-full flex-col gap-[10px]"
          >
            <h2
              className={cn("px-[10px]", font.headline2.semiBold)}
              id="hairstyle-options-title"
              style={{ color: lightTheme.label.neutral }}
            >
              헤어스타일
            </h2>
            <div className="no-scrollbar -mx-[19px] flex gap-[8px] overflow-x-auto px-[19px] pb-[2px]">
              {HAIRSTYLE_OPTIONS.map(option => {
                const isSelected = option.id === selectedHairstyleId;

                return (
                  <button
                    aria-pressed={isSelected}
                    className="flex h-[99px] w-[80px] shrink-0 flex-col items-center justify-center gap-[4px] rounded-[10px] border p-[4px]"
                    key={option.id}
                    onClick={() => setSelectedHairstyleId(option.id)}
                    style={{
                      backgroundColor: isSelected
                        ? SELECTED_BACKGROUND_COLOR
                        : lightTheme.background.normal,
                      borderColor: isSelected
                        ? lightTheme.primary.normal
                        : lightTheme.label.disable,
                    }}
                    type="button"
                  >
                    <img
                      alt={`${option.label} 헤어스타일`}
                      className="h-[70px] w-[70px] rounded-[10px] object-cover"
                      src={downPermImage}
                    />
                    <span
                      className={font.caption.medium}
                      style={{
                        color: isSelected
                          ? lightTheme.primary.normal
                          : lightTheme.label.alternative,
                      }}
                    >
                      {option.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>
        </section>

        <section aria-labelledby="hair-color-options-title" className="flex flex-col gap-[10px]">
          <h2
            className={cn("px-[10px]", font.headline2.semiBold)}
            id="hair-color-options-title"
            style={{ color: lightTheme.label.neutral }}
          >
            헤어스타일
          </h2>
          <div className="flex flex-wrap gap-[8px]">
            {COLOR_OPTIONS.map(option => {
              const isSelected = option.id === selectedColorId;

              return (
                <button
                  aria-pressed={isSelected}
                  className="flex items-center gap-[6px] rounded-[15px] border px-[8px] py-[4px]"
                  key={option.id}
                  onClick={() => setSelectedColorId(option.id)}
                  style={{
                    backgroundColor: isSelected
                      ? SELECTED_BACKGROUND_COLOR
                      : lightTheme.background.normal,
                    borderColor: isSelected ? lightTheme.primary.normal : lightTheme.fill.neutral,
                  }}
                  type="button"
                >
                  <span
                    aria-hidden="true"
                    className="h-[12px] w-[12px] rounded-full"
                    style={{ backgroundColor: lightTheme.label.strong }}
                  />
                  <span
                    className={font.label.medium}
                    style={{
                      color: isSelected ? lightTheme.primary.normal : lightTheme.label.alternative,
                    }}
                  >
                    {option.label}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        <div className="mt-auto grid grid-cols-2 gap-[7px] pt-[14px]">
          <button
            className={cn("h-[42px] rounded-[10px] border", font.headline2.semiBold)}
            onClick={() => handleModalOpen("capture")}
            style={{
              backgroundColor: lightTheme.background.alternative,
              borderColor: lightTheme.fill.neutral,
              color: lightTheme.label.alternative,
            }}
            type="button"
          >
            캡쳐
          </button>
          <button
            className={cn("h-[42px] rounded-[10px] border-0", font.headline2.semiBold)}
            onClick={() => handleModalOpen("candidate-save")}
            style={{
              backgroundColor: lightTheme.primary.normal,
              color: lightTheme.label.buttonText,
            }}
            type="button"
          >
            후보 저장
          </button>
        </div>
      </main>

      {activeModal === "candidate-save" && (
        <div
          aria-labelledby="candidate-save-modal-title"
          aria-modal="true"
          className="fixed inset-y-0 left-1/2 z-50 flex w-full max-w-[430px] -translate-x-1/2 items-center justify-center bg-black/50"
          role="dialog"
        >
          <div
            className="w-[290px] translate-y-[11.5px] rounded-[10px] px-[14px] pb-[14px] pt-[15px]"
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
                className="flex h-[28px] w-[28px] items-center justify-center rounded-full"
                onClick={handleModalClose}
                style={{ backgroundColor: lightTheme.fill.normal }}
                type="button"
              >
                <img alt="" className="h-[23px] w-[23px]" src={modalCloseImage} />
              </button>
            </div>

            <label className="mt-[14px] flex flex-col gap-[10px]">
              <span className={font.label.semiBold} style={{ color: lightTheme.label.alternative }}>
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
                className={cn("h-[26px] w-[128px] rounded-[5px] border", font.label.medium)}
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
                className={cn("h-[26px] w-[128px] rounded-[5px]", font.label.medium)}
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
      )}

      {activeModal === "capture" && (
        <div
          aria-labelledby="capture-modal-title"
          aria-modal="true"
          className="fixed inset-y-0 left-1/2 z-50 flex w-full max-w-[430px] -translate-x-1/2 items-center justify-center bg-black/50"
          role="dialog"
        >
          <div
            className="h-[525px] w-[290px] -translate-y-[31.5px] rounded-[10px] px-[14px] pb-[15px] pt-[15px]"
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
                className="flex h-[28px] w-[28px] items-center justify-center rounded-full"
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
                className={cn("h-[26px] w-[128px] rounded-[5px] border", font.label.medium)}
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
                className={cn("h-[26px] w-[128px] rounded-[5px]", font.label.medium)}
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
      )}
    </section>
  );
};

export default ArHairstylePage;
