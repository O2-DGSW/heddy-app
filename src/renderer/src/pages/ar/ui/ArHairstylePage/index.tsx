import { font, lightTheme } from "@heddy/design-tokens";
import { useState } from "react";

import cameraIcon from "../../assets/camera.svg";
import downPermImage from "../../assets/down-perm.png";
import eyeIcon from "../../assets/eye.svg";
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

const ArHairstylePage = () => {
  const [selectedHairstyleId, setSelectedHairstyleId] = useState(HAIRSTYLE_OPTIONS[0].id);
  const [selectedColorId, setSelectedColorId] = useState(COLOR_OPTIONS[1].id);
  const [isFaceGuideVisible, setIsFaceGuideVisible] = useState(true);

  const handleFaceGuideToggle = () => {
    setIsFaceGuideVisible(isVisible => !isVisible);
  };

  const handleFaceGuideReset = () => {
    setIsFaceGuideVisible(true);
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
              <div
                aria-label="얼굴 가이드"
                className="absolute left-1/2 top-1/2 h-[160px] w-[128px] -translate-x-1/2 -translate-y-1/2 rounded-[72px] border-2 border-dashed opacity-70"
                style={{ borderColor: lightTheme.primary.normal }}
              />
            )}

            <div className="absolute inset-x-0 bottom-[29px] flex items-center justify-center gap-[14px]">
              <button
                aria-label={isFaceGuideVisible ? "얼굴 가이드 숨기기" : "얼굴 가이드 표시"}
                className="flex h-[27px] w-[27px] items-center justify-center rounded-full shadow-[0_0_6px_rgba(0,0,0,0.07)]"
                onClick={handleFaceGuideToggle}
                style={{ backgroundColor: "rgba(255, 255, 255, 0.16)" }}
                type="button"
              >
                <img alt="" className="h-[16px] w-[16px]" src={eyeIcon} />
              </button>
              <button
                aria-label="카메라 제어"
                className="flex h-[44px] w-[44px] items-center justify-center rounded-full shadow-[0_0_6px_rgba(0,0,0,0.07)]"
                style={{ backgroundColor: lightTheme.background.normal }}
                type="button"
              >
                <img alt="" className="h-[24px] w-[24px]" src={cameraIcon} />
              </button>
              <button
                aria-label="얼굴 가이드 다시 표시"
                className="flex h-[27px] w-[27px] items-center justify-center rounded-full shadow-[0_0_6px_rgba(0,0,0,0.07)]"
                onClick={handleFaceGuideReset}
                style={{ backgroundColor: "rgba(255, 255, 255, 0.16)" }}
                type="button"
              >
                <img alt="" className="h-[14px] w-[14px]" src={refreshIcon} />
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
    </section>
  );
};

export default ArHairstylePage;
