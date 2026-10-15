import { font, lightTheme, palette } from "@heddy/design-tokens";

import { WEEK_DAYS, YEAR_OPTIONS, dropdownIcon } from "@/entities/record";
import type { CalendarDay } from "@/entities/record";
import { cn } from "@/shared";

import type { CSSProperties, RefObject } from "react";

interface DatePickerCalendarProps {
  draftDate: string;
  draftDateParts: { year: number; month: number; day: number };
  calendarDays: CalendarDay[];
  hasSixCalendarRows: boolean;
  isYearSelectOpen: boolean;
  canSelectPreviousMonth: boolean;
  canSelectNextMonth: boolean;
  selectedYearRef: RefObject<HTMLButtonElement | null>;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
  onToggleYearSelect: () => void;
  onYearSelect: (year: number) => void;
  onDateSelect: (day: CalendarDay) => void;
}

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

const MonthChevronIcon = ({ direction }: { direction: "previous" | "next" }) => (
  <svg
    aria-hidden="true"
    className={cn("h-[24px] w-[24px]", direction === "next" && "rotate-180")}
    fill="none"
    viewBox="0 0 24 24"
  >
    <path
      d="M14.5 6L8.5 12L14.5 18"
      stroke={lightTheme.label.assistive}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
    />
  </svg>
);

/** 월 이동·연도 선택·요일·날짜 그리드 */
const DatePickerCalendar = ({
  draftDate,
  draftDateParts,
  calendarDays,
  hasSixCalendarRows,
  isYearSelectOpen,
  canSelectPreviousMonth,
  canSelectNextMonth,
  selectedYearRef,
  onPreviousMonth,
  onNextMonth,
  onToggleYearSelect,
  onYearSelect,
  onDateSelect,
}: DatePickerCalendarProps) => (
  <div
    className={cn(
      "mt-[clamp(22px,5dvh,36px)] flex w-full min-h-0 flex-col",
      hasSixCalendarRows ? "gap-[clamp(10px,2.6dvh,16px)]" : "gap-[clamp(14px,3dvh,24px)]"
    )}
  >
    <div className="flex w-full items-center justify-between">
      <button
        aria-label="이전 달"
        className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-full border-0 bg-transparent p-0 disabled:opacity-30"
        disabled={!canSelectPreviousMonth}
        onClick={onPreviousMonth}
        type="button"
      >
        <MonthChevronIcon direction="previous" />
      </button>

      <div className="relative">
        <button
          aria-controls="date-picker-year-list"
          aria-expanded={isYearSelectOpen}
          aria-label="년도 선택"
          className="flex items-center gap-[7px] border-0 bg-transparent p-0"
          onClick={onToggleYearSelect}
          type="button"
        >
          <span className={font.headline1.bold} style={{ color: lightTheme.label.neutral }}>
            {draftDateParts.year}. {draftDateParts.month}
          </span>
          <img alt="" className="h-[24px] w-[24px]" src={dropdownIcon} />
        </button>

        {isYearSelectOpen && (
          <div
            className="scrollbar-hidden absolute left-1/2 top-[34px] z-10 flex h-[81px] w-[96px] -translate-x-1/2 flex-col overflow-y-auto rounded-[10px] shadow-[1px_2px_2px_rgba(0,0,0,0.08)]"
            id="date-picker-year-list"
            role="listbox"
            style={{ backgroundColor: lightTheme.background.normal }}
          >
            {YEAR_OPTIONS.map(year => {
              const isSelected = draftDateParts.year === year;

              return (
                <button
                  aria-selected={isSelected}
                  className={cn(font.label.medium, "h-[27px] w-full shrink-0 border-0 text-center")}
                  key={year}
                  onClick={() => onYearSelect(year)}
                  ref={isSelected ? selectedYearRef : null}
                  role="option"
                  style={{
                    backgroundColor: isSelected ? palette.main[90] : lightTheme.background.normal,
                    color: isSelected ? lightTheme.primary.normal : lightTheme.line.normal,
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

      <button
        aria-label="다음 달"
        className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-full border-0 bg-transparent p-0 disabled:opacity-30"
        disabled={!canSelectNextMonth}
        onClick={onNextMonth}
        type="button"
      >
        <MonthChevronIcon direction="next" />
      </button>
    </div>

    <div className="flex w-full flex-col gap-[8px]">
      <div className="grid w-full grid-cols-7 justify-items-center">
        {WEEK_DAYS.map((weekDay, index) => (
          <span
            className={cn(
              font.body.medium,
              "flex h-[21px] w-[clamp(32px,9vw,36px)] items-center justify-center"
            )}
            key={weekDay}
            style={{
              color: index === 0 ? lightTheme.status.error : lightTheme.label.alternative,
            }}
          >
            {weekDay}
          </span>
        ))}
      </div>

      <div
        className={cn(
          "grid w-full grid-cols-7 justify-items-center",
          hasSixCalendarRows ? "gap-y-[4px]" : "gap-y-[8px]"
        )}
      >
        {calendarDays.map(day => {
          const isSelected = draftDate === day.id;

          return (
            <button
              aria-label={`${day.label}일`}
              aria-pressed={isSelected}
              className={cn(
                font.body.semiBold,
                "flex h-[clamp(32px,8.8vw,36px)] w-[clamp(32px,8.8vw,36px)] items-center justify-center rounded-full border-0 bg-transparent p-0",
                day.isCurrentMonth ? "cursor-pointer" : "cursor-default"
              )}
              disabled={!day.isCurrentMonth}
              key={day.id}
              onClick={() => onDateSelect(day)}
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
);

export default DatePickerCalendar;
