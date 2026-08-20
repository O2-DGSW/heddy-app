import { font, lightTheme, palette } from "@heddy/design-tokens";
import { useEffect, useRef, useState } from "react";

import {
  DEFAULT_DATE_VALUE,
  DEFAULT_MONTH,
  WEEK_DAYS,
  YEAR_OPTIONS,
  createCalendarDays,
  createDateValue,
  dateIcon,
  dropdownIcon,
  formatDateDisplay,
  noIcon,
  parseDateValue,
} from "@/entities/record";
import { cn } from "@/shared";

import type { CSSProperties } from "react";
import type { CalendarDay } from "@/entities/record";

type PlaceholderStyle = CSSProperties & {
  "--placeholder-color": string;
};

interface RecordDatePickerFieldProps {
  value: string;
  onChange: (date: string) => void;
}

const fieldStyle = {
  "--placeholder-color": lightTheme.line.normal,
  backgroundColor: lightTheme.background.neutral,
  color: lightTheme.label.neutral,
} satisfies PlaceholderStyle;

const datePickerOverlayStyle = { backgroundColor: "rgba(0,0,0,0.5)" };
const datePickerPanelStyle = { backgroundColor: lightTheme.background.normal };
const confirmButtonStyle = {
  backgroundColor: lightTheme.primary.normal,
  color: lightTheme.label.buttonText,
};

const fieldClassName = cn(
  "h-[53px] w-full rounded-[15px] border-0 px-[17px] outline-none",
  font.body.regular
);

const getCalendarDayStyle = (day: CalendarDay, isSelected: boolean): CSSProperties => {
  if (isSelected) {
    return {
      backgroundColor: lightTheme.primary.normal,
      color: lightTheme.background.normal,
    };
  }

  if (!day.isCurrentMonth) {
    return {
      color: day.tone === "mutedSunday" ? palette.red[90] : lightTheme.line.normal,
    };
  }

  return { color: lightTheme.label.alternative };
};

const RecordDatePickerField = ({ value, onChange }: RecordDatePickerFieldProps) => {
  const selectedYearRef = useRef<HTMLButtonElement>(null);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [isYearSelectOpen, setIsYearSelectOpen] = useState(false);
  const [draftDate, setDraftDate] = useState(DEFAULT_DATE_VALUE);

  const draftDateParts = parseDateValue(draftDate);
  const calendarDays = createCalendarDays(draftDateParts.year);
  const selectedDateLabel = value ? formatDateDisplay(value) : "입력";
  const selectedDateColor = value ? lightTheme.label.neutral : lightTheme.line.normal;

  const handleOpenDatePicker = () => {
    setDraftDate(value || DEFAULT_DATE_VALUE);
    setIsYearSelectOpen(false);
    setIsDatePickerOpen(true);
  };

  const handleCloseDatePicker = () => {
    setIsYearSelectOpen(false);
    setIsDatePickerOpen(false);
  };

  const handleToggleYearSelect = () => {
    setIsYearSelectOpen(currentValue => !currentValue);
  };

  const handleYearSelect = (year: number) => {
    setDraftDate(createDateValue(year, DEFAULT_MONTH, draftDateParts.day));
    setIsYearSelectOpen(false);
  };

  const handleCalendarDateSelect = (day: CalendarDay) => {
    if (!day.isCurrentMonth || !day.day) {
      return;
    }

    setDraftDate(createDateValue(draftDateParts.year, DEFAULT_MONTH, day.day));
  };

  const handleConfirmDate = () => {
    onChange(draftDate);
    setIsDatePickerOpen(false);
  };

  useEffect(() => {
    if (!isDatePickerOpen) {
      return;
    }

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsDatePickerOpen(false);
      }
    };

    window.addEventListener("keydown", handleEscapeKey);

    return () => {
      window.removeEventListener("keydown", handleEscapeKey);
    };
  }, [isDatePickerOpen]);

  useEffect(() => {
    if (!isYearSelectOpen) {
      return;
    }

    selectedYearRef.current?.scrollIntoView({ block: "center" });
  }, [isYearSelectOpen]);

  return (
    <div className="flex w-full flex-col gap-[10px]">
      <h2 className={font.headline2.semiBold} style={{ color: lightTheme.label.neutral }}>
        날짜
      </h2>
      <button
        aria-haspopup="dialog"
        aria-label="날짜 선택"
        className={cn(fieldClassName, "flex items-center justify-between pr-[17px] text-left")}
        onClick={handleOpenDatePicker}
        style={fieldStyle}
        type="button"
      >
        <span style={{ color: selectedDateColor }}>{selectedDateLabel}</span>
        <img alt="" className="h-[24px] w-[24px]" src={dateIcon} />
      </button>

      {isDatePickerOpen && (
        <div
          aria-labelledby="date-picker-title"
          aria-modal="true"
          className="fixed inset-y-0 left-1/2 z-50 w-full max-w-[430px] -translate-x-1/2"
          role="dialog"
        >
          <button
            aria-label="날짜 선택 닫기"
            className="absolute inset-0 h-full w-full border-0 p-0"
            onClick={handleCloseDatePicker}
            style={datePickerOverlayStyle}
            type="button"
          />
          <div
            className="absolute inset-x-0 bottom-0 flex h-[526px] max-h-[calc(100dvh-40px)] flex-col items-center overflow-hidden rounded-tl-[32px] rounded-tr-[32px] px-[24px] pb-[44px] pt-[22px]"
            style={datePickerPanelStyle}
          >
            <div className="flex w-full max-w-[354px] flex-col items-center gap-[44px]">
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

              <div className="flex w-full flex-col gap-[24px]">
                <div className="relative self-start">
                  <button
                    aria-controls="date-picker-year-list"
                    aria-expanded={isYearSelectOpen}
                    aria-label="년도 선택"
                    className="flex items-center gap-[7px] border-0 bg-transparent p-0"
                    onClick={handleToggleYearSelect}
                    type="button"
                  >
                    <span
                      className={font.headline1.bold}
                      style={{ color: lightTheme.label.neutral }}
                    >
                      {draftDateParts.year}. {draftDateParts.month}
                    </span>
                    <img alt="" className="h-[24px] w-[24px]" src={dropdownIcon} />
                  </button>

                  {isYearSelectOpen && (
                    <div
                      className="scrollbar-hidden absolute left-0 top-[34px] z-10 flex h-[81px] w-[96px] flex-col overflow-y-auto rounded-[10px] shadow-[1px_2px_2px_rgba(0,0,0,0.08)]"
                      id="date-picker-year-list"
                      role="listbox"
                      style={{ backgroundColor: lightTheme.background.normal }}
                    >
                      {YEAR_OPTIONS.map(year => {
                        const isSelected = draftDateParts.year === year;

                        return (
                          <button
                            aria-selected={isSelected}
                            className={cn(
                              font.label.medium,
                              "h-[27px] w-full shrink-0 border-0 text-center"
                            )}
                            key={year}
                            onClick={() => handleYearSelect(year)}
                            ref={isSelected ? selectedYearRef : null}
                            role="option"
                            style={{
                              backgroundColor: isSelected
                                ? palette.main[90]
                                : lightTheme.background.normal,
                              color: isSelected
                                ? lightTheme.primary.normal
                                : lightTheme.line.normal,
                            }}
                            type="button"
                          >
                            {year}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="flex w-full flex-col gap-[8px]">
                  <div className="grid w-full grid-cols-7 justify-items-center">
                    {WEEK_DAYS.map((weekDay, index) => (
                      <span
                        className={cn(
                          font.body.medium,
                          "flex h-[21px] w-[36px] items-center justify-center"
                        )}
                        key={weekDay}
                        style={{
                          color:
                            index === 0 ? lightTheme.status.error : lightTheme.label.alternative,
                        }}
                      >
                        {weekDay}
                      </span>
                    ))}
                  </div>

                  <div className="grid w-full grid-cols-7 justify-items-center gap-y-[8px]">
                    {calendarDays.map(day => {
                      const isSelected = draftDate === day.id;

                      return (
                        <button
                          aria-label={`${day.label}일`}
                          aria-pressed={isSelected}
                          className={cn(
                            font.body.semiBold,
                            "flex h-[36px] w-[36px] items-center justify-center rounded-full border-0 bg-transparent p-0",
                            day.isCurrentMonth ? "cursor-pointer" : "cursor-default"
                          )}
                          disabled={!day.isCurrentMonth}
                          key={day.id}
                          onClick={() => handleCalendarDateSelect(day)}
                          style={getCalendarDayStyle(day, isSelected)}
                          type="button"
                        >
                          {day.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <button
                className={cn(font.headline2.semiBold, "h-[48px] w-full rounded-[10px] border-0")}
                onClick={handleConfirmDate}
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

export default RecordDatePickerField;
