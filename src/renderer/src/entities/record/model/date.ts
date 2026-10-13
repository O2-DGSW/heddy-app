import type { CalendarDay } from "./types";

export const padDatePart = (value: number) => String(value).padStart(2, "0");

export const createDateValue = (year: number, month: number, day: number) =>
  `${year}-${padDatePart(month)}-${padDatePart(day)}`;

export const getTodayDateValue = () => {
  const today = new Date();

  return createDateValue(today.getFullYear(), today.getMonth() + 1, today.getDate());
};

/** ISO 8601 일시를 YYYY-MM-DD로 바꾼다(기기 시간대 기준). 날짜가 아니면 빈 문자열이다 */
export const toDateValue = (dateTime: string) => {
  const date = new Date(dateTime);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return createDateValue(date.getFullYear(), date.getMonth() + 1, date.getDate());
};

const LONG_DATE_FORMAT = new Intl.DateTimeFormat("ko-KR", {
  year: "numeric",
  month: "long",
  day: "numeric",
});

/** ISO 8601 일시를 "2026년 3월 5일"로 바꾼다. 값이 없거나 날짜가 아니면 빈 문자열이다 */
export const formatLongDate = (dateTime?: string | null) => {
  if (!dateTime) {
    return "";
  }

  const date = new Date(dateTime);

  return Number.isNaN(date.getTime()) ? "" : LONG_DATE_FORMAT.format(date);
};

export const formatDateDisplay = (dateValue: string) => {
  const [year, month, day] = dateValue.split("-");

  return `${year}. ${Number(month)}. ${Number(day)}`;
};

export const getDaysInMonth = (year: number, month: number) => new Date(year, month, 0).getDate();

export const createCalendarDays = (year: number, month: number): CalendarDay[] => {
  const firstDayOfMonth = new Date(year, month - 1, 1);
  const firstWeekday = firstDayOfMonth.getDay();
  const daysInMonth = getDaysInMonth(year, month);
  const calendarDayCount = Math.ceil((firstWeekday + daysInMonth) / 7) * 7;

  return Array.from({ length: calendarDayCount }, (_, index) => {
    const date = new Date(year, month - 1, index - firstWeekday + 1);
    const dateYear = date.getFullYear();
    const dateMonth = date.getMonth() + 1;
    const dateDay = date.getDate();
    const isCurrentMonth = dateMonth === month;

    return {
      id: createDateValue(dateYear, dateMonth, dateDay),
      label: String(dateDay),
      isCurrentMonth,
      day: isCurrentMonth ? dateDay : undefined,
      tone: !isCurrentMonth && date.getDay() === 0 ? "mutedSunday" : undefined,
    };
  });
};

export const parseDateValue = (dateValue: string) => {
  const [yearValue, monthValue, dayValue] = dateValue.split("-");
  const year = Number(yearValue);
  const month = Number(monthValue);
  const day = Number(dayValue);
  const parsedDate = new Date(year, month - 1, day);

  if (
    Number.isNaN(parsedDate.getTime()) ||
    parsedDate.getFullYear() !== year ||
    parsedDate.getMonth() + 1 !== month ||
    parsedDate.getDate() !== day
  ) {
    const today = new Date();

    return {
      year: today.getFullYear(),
      month: today.getMonth() + 1,
      day: today.getDate(),
    };
  }

  return {
    year,
    month,
    day,
  };
};
