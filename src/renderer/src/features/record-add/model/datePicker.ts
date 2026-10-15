import { createDateValue, getDaysInMonth, parseDateValue } from "@/entities/record";

/** 그 달에 없는 날(2월 30일 등)은 그 달의 마지막 날로 맞춘다 */
export const getClampedDateValue = (year: number, month: number, day: number) =>
  createDateValue(year, month, Math.min(day, getDaysInMonth(year, month)));

/** 달을 앞뒤로 옮긴다. 날짜는 유지하되 옮긴 달에 없으면 마지막 날로 맞춘다 */
export const getShiftedMonthDateValue = (dateValue: string, monthOffset: number) => {
  const { year, month, day } = parseDateValue(dateValue);
  const shiftedDate = new Date(year, month - 1 + monthOffset, 1);

  return getClampedDateValue(shiftedDate.getFullYear(), shiftedDate.getMonth() + 1, day);
};
