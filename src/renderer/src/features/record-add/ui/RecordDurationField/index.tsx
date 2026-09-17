import { font, lightTheme } from "@heddy/design-tokens";
import { useEffect, useState } from "react";

import {
  DURATION_HOUR_OPTIONS,
  DURATION_MINUTE_OPTIONS,
  createDurationValue,
  formatDurationDisplay,
  noIcon,
  parseDurationValue,
} from "@/entities/record";
import { cn } from "@/shared";

import DurationWheel from "./DurationWheel";
import { WHEEL_ITEM_HEIGHT } from "./constants";

import type { CSSProperties } from "react";

interface RecordDurationFieldProps {
  /** 분 단위 숫자 문자열. 빈 문자열이면 아직 고르지 않은 상태다 */
  value: string;
  onChange: (durationValue: string) => void;
}

const fieldStyle = {
  backgroundColor: lightTheme.background.neutral,
  borderColor: "transparent",
  color: lightTheme.label.neutral,
} satisfies CSSProperties;

const pickerOverlayStyle = { backgroundColor: "rgba(0,0,0,0.5)" };
const pickerPanelStyle = { backgroundColor: lightTheme.background.normal };
const confirmButtonStyle = {
  backgroundColor: lightTheme.primary.normal,
  color: lightTheme.label.buttonText,
};

/** 휠 위에 붙는 열 이름. 휠 안에 두면 선택줄 높이 계산이 어긋나서 밖으로 뺐다 */
const DURATION_WHEEL_LABELS = ["시간", "분"] as const;

const fieldClassName = cn(
  "h-[53px] w-full rounded-[15px] border border-solid px-[17px] outline-none",
  font.body.regular
);

/** 가운데 선택줄. 휠 위에 겹쳐 그리되 스크롤을 막지 않도록 클릭을 통과시킨다 */
const selectionBandStyle = {
  height: WHEEL_ITEM_HEIGHT,
  backgroundColor: lightTheme.fill.normal,
} satisfies CSSProperties;

/**
 * 소요 시간을 시·분 휠로 고르는 입력.
 * 날짜와 같은 바텀시트 구조를 써서 두 입력이 같은 방식으로 열리고 닫히게 맞췄다.
 */
const RecordDurationField = ({ value, onChange }: RecordDurationFieldProps) => {
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [draftHour, setDraftHour] = useState(0);
  const [draftMinute, setDraftMinute] = useState(0);

  const selectedLabel = formatDurationDisplay(value) || "입력";
  const selectedColor = value ? lightTheme.label.neutral : lightTheme.line.normal;

  const handleOpenPicker = () => {
    const { hour, minute } = parseDurationValue(value);

    setDraftHour(hour);
    setDraftMinute(minute);
    setIsPickerOpen(true);
  };

  const handleClosePicker = () => {
    setIsPickerOpen(false);
  };

  const handleConfirm = () => {
    onChange(createDurationValue(draftHour, draftMinute));
    setIsPickerOpen(false);
  };

  useEffect(() => {
    if (!isPickerOpen) {
      return;
    }

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsPickerOpen(false);
      }
    };

    window.addEventListener("keydown", handleEscapeKey);

    return () => {
      window.removeEventListener("keydown", handleEscapeKey);
    };
  }, [isPickerOpen]);

  return (
    <div className="flex w-full flex-col gap-[10px]">
      <h2 className={font.headline2.semiBold} style={{ color: lightTheme.label.neutral }}>
        소요 시간
      </h2>
      <button
        aria-haspopup="dialog"
        aria-label="소요 시간 선택"
        className={cn(fieldClassName, "flex items-center justify-between text-left")}
        onClick={handleOpenPicker}
        style={fieldStyle}
        type="button"
      >
        <span style={{ color: selectedColor }}>{selectedLabel}</span>
      </button>

      {isPickerOpen && (
        <div
          aria-labelledby="duration-picker-title"
          aria-modal="true"
          className="fixed inset-y-0 left-1/2 z-50 w-full max-w-[430px] -translate-x-1/2"
          role="dialog"
        >
          <button
            aria-label="소요 시간 선택 닫기"
            className="absolute inset-0 h-full w-full border-0 p-0"
            onClick={handleClosePicker}
            style={pickerOverlayStyle}
            type="button"
          />
          <div
            className="absolute inset-x-0 bottom-0 flex flex-col items-center overflow-hidden rounded-tl-[32px] rounded-tr-[32px] px-[clamp(18px,5.6vw,24px)] pb-[clamp(24px,5dvh,44px)] pt-[clamp(18px,3.2dvh,22px)]"
            style={pickerPanelStyle}
          >
            <div className="flex w-full max-w-[354px] flex-col items-center">
              <div className="flex w-full items-center justify-between">
                <h2
                  className={font.headline1.bold}
                  id="duration-picker-title"
                  style={{ color: lightTheme.label.neutral }}
                >
                  소요 시간 선택
                </h2>
                <button
                  aria-label="소요 시간 선택 닫기"
                  className="flex h-[34px] w-[34px] items-center justify-center rounded-full border-0 p-0"
                  onClick={handleClosePicker}
                  style={{ backgroundColor: lightTheme.fill.normal }}
                  type="button"
                >
                  <img alt="" className="h-[22px] w-[22px]" src={noIcon} />
                </button>
              </div>

              <div className="mt-[clamp(18px,4dvh,28px)] flex w-full">
                {DURATION_WHEEL_LABELS.map(wheelLabel => (
                  <span
                    className={cn(font.caption.regular, "flex-1 text-center")}
                    key={wheelLabel}
                    style={{ color: lightTheme.label.assistive }}
                  >
                    {wheelLabel}
                  </span>
                ))}
              </div>

              <div className="relative mt-[8px] flex w-full items-center">
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 rounded-[12px]"
                  style={selectionBandStyle}
                />
                <DurationWheel
                  label="시간"
                  onChange={setDraftHour}
                  options={DURATION_HOUR_OPTIONS}
                  unit="시간"
                  value={draftHour}
                />
                <DurationWheel
                  label="분"
                  onChange={setDraftMinute}
                  options={DURATION_MINUTE_OPTIONS}
                  unit="분"
                  value={draftMinute}
                />
              </div>

              <button
                className={cn(
                  font.headline2.semiBold,
                  "mt-[clamp(22px,4dvh,32px)] h-[48px] w-full rounded-[10px] border-0"
                )}
                onClick={handleConfirm}
                style={confirmButtonStyle}
                type="button"
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecordDurationField;
