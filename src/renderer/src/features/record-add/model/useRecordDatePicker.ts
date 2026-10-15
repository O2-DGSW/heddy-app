import { useEffect, useRef, useState } from "react";

import {
  YEAR_OPTIONS,
  createCalendarDays,
  createDateValue,
  getTodayDateValue,
  parseDateValue,
} from "@/entities/record";
import type { CalendarDay } from "@/entities/record";
import { useHideBottomBarWhileOpen } from "@/shared";

import { getClampedDateValue, getShiftedMonthDateValue } from "./datePicker";

interface UseRecordDatePickerOptions {
  value: string;
  onChange: (date: string) => void;
}

/** 날짜 선택 시트의 상태. 확인을 누르기 전까지는 draftDate만 바꾸고 폼 값은 그대로 둔다 */
export const useRecordDatePicker = ({ value, onChange }: UseRecordDatePickerOptions) => {
  const selectedYearRef = useRef<HTMLButtonElement>(null);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [isYearSelectOpen, setIsYearSelectOpen] = useState(false);
  const [draftDate, setDraftDate] = useState(() => getTodayDateValue());

  useHideBottomBarWhileOpen(isDatePickerOpen);

  const draftDateParts = parseDateValue(draftDate);
  const calendarDays = createCalendarDays(draftDateParts.year, draftDateParts.month);
  const hasSixCalendarRows = calendarDays.length > 35;
  const firstYearOption = YEAR_OPTIONS[0] ?? draftDateParts.year;
  const lastYearOption = YEAR_OPTIONS[YEAR_OPTIONS.length - 1] ?? draftDateParts.year;
  const canSelectPreviousMonth =
    draftDateParts.year > firstYearOption ||
    (draftDateParts.year === firstYearOption && draftDateParts.month > 1);
  const canSelectNextMonth =
    draftDateParts.year < lastYearOption ||
    (draftDateParts.year === lastYearOption && draftDateParts.month < 12);

  const handleOpenDatePicker = () => {
    setDraftDate(value || getTodayDateValue());
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
    setDraftDate(getClampedDateValue(year, draftDateParts.month, draftDateParts.day));
    setIsYearSelectOpen(false);
  };

  const handlePreviousMonth = () => {
    if (!canSelectPreviousMonth) {
      return;
    }

    setDraftDate(currentDate => getShiftedMonthDateValue(currentDate, -1));
    setIsYearSelectOpen(false);
  };

  const handleNextMonth = () => {
    if (!canSelectNextMonth) {
      return;
    }

    setDraftDate(currentDate => getShiftedMonthDateValue(currentDate, 1));
    setIsYearSelectOpen(false);
  };

  const handleCalendarDateSelect = (day: CalendarDay) => {
    if (!day.isCurrentMonth || !day.day) {
      return;
    }

    setDraftDate(createDateValue(draftDateParts.year, draftDateParts.month, day.day));
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

  return {
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
  };
};
