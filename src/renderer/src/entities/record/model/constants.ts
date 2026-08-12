import recordPhoto from "../assets/result.png";

import type { PhotoItem, RecordFieldConfig, RecordFormValues } from "./types";

export const MAX_PHOTO_COUNT = 10;
export const DEFAULT_YEAR = 2026;
export const DEFAULT_MONTH = 5;
export const DEFAULT_DAY = 28;
export const DEFAULT_DATE_VALUE = `${DEFAULT_YEAR}-05-${DEFAULT_DAY}`;
export const YEAR_OPTIONS = Array.from({ length: 13 }, (_, index) => 2020 + index);
export const PROCEDURE_TYPES = ["#커트", "#펌", "#염색", "#클리닉"] as const;
export const WEEK_DAYS = ["일", "월", "화", "수", "목", "금", "토"] as const;

export const RECORD_FIELDS = [
  { id: "salon", label: "미용실", placeholder: "미용실", inputMode: "text" },
  { id: "price", label: "가격", placeholder: "가격", inputMode: "decimal" },
  {
    id: "designer",
    label: "담당 디자이너",
    placeholder: "담당 디자이너",
    inputMode: "text",
  },
  { id: "duration", label: "소요 시간", placeholder: "소요 시간", inputMode: "text" },
] as const satisfies readonly RecordFieldConfig[];

export const INITIAL_FORM_VALUES: RecordFormValues = {
  date: "",
  salon: "",
  price: "",
  designer: "",
  duration: "",
  details: "",
};

export const INITIAL_PHOTOS: PhotoItem[] = Array.from({ length: 5 }, (_, index) => ({
  id: `initial-photo-${index + 1}`,
  src: recordPhoto,
  isObjectUrl: false,
}));

export const CALENDAR_DAY_TEMPLATES = [
  { month: 4, day: 27, label: "27", isCurrentMonth: false, tone: "mutedSunday" },
  { month: 4, day: 28, label: "28", isCurrentMonth: false },
  { month: 4, day: 29, label: "29", isCurrentMonth: false },
  { month: 4, day: 30, label: "30", isCurrentMonth: false },
  { month: 5, day: 1, label: "1", isCurrentMonth: true },
  { month: 5, day: 2, label: "2", isCurrentMonth: true },
  { month: 5, day: 3, label: "3", isCurrentMonth: true },
  { month: 5, day: 4, label: "4", isCurrentMonth: true },
  { month: 5, day: 5, label: "5", isCurrentMonth: true },
  { month: 5, day: 6, label: "6", isCurrentMonth: true },
  { month: 5, day: 7, label: "7", isCurrentMonth: true },
  { month: 5, day: 8, label: "8", isCurrentMonth: true },
  { month: 5, day: 9, label: "9", isCurrentMonth: true },
  { month: 5, day: 10, label: "10", isCurrentMonth: true },
  { month: 5, day: 11, label: "11", isCurrentMonth: true },
  { month: 5, day: 12, label: "12", isCurrentMonth: true },
  { month: 5, day: 13, label: "13", isCurrentMonth: true },
  { month: 5, day: 14, label: "14", isCurrentMonth: true },
  { month: 5, day: 15, label: "15", isCurrentMonth: true },
  { month: 5, day: 16, label: "16", isCurrentMonth: true },
  { month: 5, day: 17, label: "17", isCurrentMonth: true },
  { month: 5, day: 18, label: "18", isCurrentMonth: true },
  { month: 5, day: 19, label: "19", isCurrentMonth: true },
  { month: 5, day: 20, label: "20", isCurrentMonth: true },
  { month: 5, day: 21, label: "21", isCurrentMonth: true },
  { month: 5, day: 22, label: "22", isCurrentMonth: true },
  { month: 5, day: 23, label: "23", isCurrentMonth: true },
  { month: 5, day: 24, label: "24", isCurrentMonth: true },
  { month: 5, day: 25, label: "25", isCurrentMonth: true },
  { month: 5, day: 26, label: "26", isCurrentMonth: true },
  { month: 5, day: 27, label: "27", isCurrentMonth: true },
  { month: 5, day: 28, label: "28", isCurrentMonth: true },
  { month: 5, day: 29, label: "29", isCurrentMonth: true },
  { month: 5, day: 30, label: "30", isCurrentMonth: true },
  { month: 5, day: 31, label: "31", isCurrentMonth: true },
] as const;

export type ProcedureType = (typeof PROCEDURE_TYPES)[number];
