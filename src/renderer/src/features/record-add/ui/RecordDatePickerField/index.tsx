import { memo } from "react";
import { font, lightTheme } from "@heddy/design-tokens";

import { dateIcon, formatDateDisplay, noIcon, RecordRequiredMark } from "@/entities/record";
import { cn, ModalShell } from "@/shared";

import { useRecordDatePicker } from "../../model/useRecordDatePicker";
import DatePickerCalendar from "./DatePickerCalendar";

import type { CSSProperties } from "react";

type PlaceholderStyle = CSSProperties & {
  "--placeholder-color": string;
};

interface RecordDatePickerFieldProps {
  value: string;
  errorMessage?: string;
  onChange: (date: string) => void;
}

const fieldStyle = {
  "--placeholder-color": lightTheme.line.normal,
  backgroundColor: lightTheme.background.neutral,
  borderColor: "transparent",
  color: lightTheme.label.neutral,
} satisfies PlaceholderStyle;

const datePickerPanelStyle = { backgroundColor: lightTheme.background.normal };
const confirmButtonStyle = {
  backgroundColor: lightTheme.primary.normal,
  color: lightTheme.label.buttonText,
};

const fieldClassName = cn(
  "h-[53px] w-full rounded-[15px] border border-solid px-[17px] outline-none",
  font.body.regular
);

const RecordDatePickerField = ({ errorMessage, value, onChange }: RecordDatePickerFieldProps) => {
  const {
    selectedYearRef,
    isDatePickerOpen,
    isYearSelectOpen,
    draftDate,
    draftDateParts,
    calendarDays,
    hasSixCalendarRows,
    canSelectPreviousMonth,
    canSelectNextMonth,
    handleOpenDatePicker,
    handleCloseDatePicker,
    handleToggleYearSelect,
    handleYearSelect,
    handlePreviousMonth,
    handleNextMonth,
    handleCalendarDateSelect,
    handleConfirmDate,
  } = useRecordDatePicker({ value, onChange });

  const hasError = Boolean(errorMessage);
  const errorId = "record-date-error";
  const selectedDateLabel = value ? formatDateDisplay(value) : "입력";
  const selectedDateColor = value ? lightTheme.label.neutral : lightTheme.line.normal;

  return (
    <div className="flex w-full flex-col gap-[10px]">
      <h2 className={font.headline2.semiBold} style={{ color: lightTheme.label.neutral }}>
        날짜
        <RecordRequiredMark />
      </h2>
      <button
        aria-describedby={hasError ? errorId : undefined}
        aria-haspopup="dialog"
        aria-invalid={hasError || undefined}
        aria-label="날짜 선택"
        className={cn(fieldClassName, "flex items-center justify-between pr-[17px] text-left")}
        onClick={handleOpenDatePicker}
        style={{
          ...fieldStyle,
          borderColor: hasError ? lightTheme.status.error : fieldStyle.borderColor,
        }}
        type="button"
      >
        <span style={{ color: selectedDateColor }}>{selectedDateLabel}</span>
        <img alt="" className="h-[24px] w-[24px]" src={dateIcon} />
      </button>
      {errorMessage && (
        <span
          className={font.caption.regular}
          id={errorId}
          style={{ color: lightTheme.status.error }}
        >
          {errorMessage}
        </span>
      )}

      {isDatePickerOpen && (
        <ModalShell
          labelledBy="date-picker-title"
          placement="bottom"
          onBackdropClick={handleCloseDatePicker}
          backdropLabel="날짜 선택 닫기"
        >
          <div
            className="flex h-[526px] max-h-[calc(100dvh-24px)] flex-col items-center overflow-hidden rounded-tl-[32px] rounded-tr-[32px] px-[clamp(18px,5.6vw,24px)] pb-[clamp(24px,5dvh,44px)] pt-[clamp(18px,3.2dvh,22px)]"
            style={datePickerPanelStyle}
          >
            <div className="flex h-full min-h-0 w-full max-w-[354px] flex-col items-center">
              <div className="flex w-full items-center justify-between">
                <h2
                  className={font.headline1.bold}
                  id="date-picker-title"
                  style={{ color: lightTheme.label.neutral }}
                >
                  날짜 선택
                </h2>
                <button
                  aria-label="날짜 선택 닫기"
                  className="flex h-[34px] w-[34px] items-center justify-center rounded-full border-0 p-0"
                  onClick={handleCloseDatePicker}
                  style={{ backgroundColor: lightTheme.fill.normal }}
                  type="button"
                >
                  <img alt="" className="h-[22px] w-[22px]" src={noIcon} />
                </button>
              </div>

              <DatePickerCalendar
                draftDate={draftDate}
                draftDateParts={draftDateParts}
                calendarDays={calendarDays}
                hasSixCalendarRows={hasSixCalendarRows}
                isYearSelectOpen={isYearSelectOpen}
                canSelectPreviousMonth={canSelectPreviousMonth}
                canSelectNextMonth={canSelectNextMonth}
                selectedYearRef={selectedYearRef}
                onPreviousMonth={handlePreviousMonth}
                onNextMonth={handleNextMonth}
                onToggleYearSelect={handleToggleYearSelect}
                onYearSelect={handleYearSelect}
                onDateSelect={handleCalendarDateSelect}
              />

              <button
                className={cn(
                  font.headline2.semiBold,
                  "mt-auto h-[48px] w-full rounded-[10px] border-0"
                )}
                onClick={handleConfirmDate}
                style={confirmButtonStyle}
                type="button"
              >
                확인
              </button>
            </div>
          </div>
        </ModalShell>
      )}
    </div>
  );
};

// 폼 전체가 다시 그려질 때 값이 그대로인 필드는 건너뛴다.
export default memo(RecordDatePickerField);
