import { CALENDAR_DAY_TEMPLATES, DEFAULT_DAY, DEFAULT_MONTH, DEFAULT_YEAR } from "./constants";

import type { CalendarDay } from "./types";

export const padDatePart = (value: number) => String(value).padStart(2, "0");

export const createDateValue = (year: number, month: number, day: number) =>
  `${year}-${padDatePart(month)}-${padDatePart(day)}`;

export const formatDateDisplay = (dateValue: string) => {
  const [year, month, day] = dateValue.split("-");

  return `${year}. ${Number(month)}. ${Number(day)}`;
};

export const createCalendarDays = (year: number): CalendarDay[] =>
  CALENDAR_DAY_TEMPLATES.map(day => ({
    id: createDateValue(year, day.month, day.day),
    label: day.label,
    isCurrentMonth: day.isCurrentMonth,
    day: day.isCurrentMonth ? day.day : undefined,
    tone: "tone" in day ? day.tone : undefined,
  }));

export const parseDateValue = (dateValue: string) => {
  const [year = String(DEFAULT_YEAR), month = String(DEFAULT_MONTH), day = String(DEFAULT_DAY)] =
    dateValue.split("-");

  return {
    year: Number(year),
    month: Number(month),
    day: Number(day),
  };
};
