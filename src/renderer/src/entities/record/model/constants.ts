import type { PhotoItem, RecordFieldConfig, RecordFormValues } from "./types";

export const MAX_PHOTO_COUNT = 10;
export const YEAR_OPTIONS = Array.from(
  { length: 13 },
  (_, index) => new Date().getFullYear() - 6 + index
);
export const PROCEDURE_TYPES = ["#커트", "#펌", "#염색", "#클리닉"] as const;
export const WEEK_DAYS = ["일", "월", "화", "수", "목", "금", "토"] as const;

export const RECORD_FIELDS = [
  { id: "salon", label: "미용실", placeholder: "미용실", inputMode: "text" },
  { id: "price", label: "가격", placeholder: "가격", inputMode: "decimal" },
  { id: "duration", label: "소요 시간", placeholder: "소요 시간", inputMode: "text" },
] as const satisfies readonly RecordFieldConfig[];

export const RECORD_DETAIL_FIELDS = [
  {
    id: "designer",
    label: "담당 디자이너",
    placeholder: "담당 디자이너",
    inputMode: "text",
  },
  {
    id: "procedureContent",
    label: "시술 내용",
    placeholder: "시술 내용",
    inputMode: "text",
  },
] as const satisfies readonly RecordFieldConfig[];

export const INITIAL_FORM_VALUES: RecordFormValues = {
  date: "",
  salon: "",
  price: "",
  duration: "",
  designer: "",
  procedureContent: "",
  details: "",
};

export const INITIAL_PHOTOS: PhotoItem[] = [];

export type ProcedureType = (typeof PROCEDURE_TYPES)[number];
