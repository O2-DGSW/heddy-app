export type RecordFieldNameType = "salon" | "price" | "designer" | "duration";

export interface RecordFormValues {
  date: string;
  salon: string;
  price: string;
  designer: string;
  duration: string;
  details: string;
}

export interface RecordFieldConfig {
  id: RecordFieldNameType;
  label: string;
  placeholder: string;
  inputMode: "decimal" | "text";
}

export interface PhotoItem {
  id: string;
  src: string;
  isObjectUrl: boolean;
}

export interface CalendarDay {
  id: string;
  label: string;
  isCurrentMonth: boolean;
  day?: number;
  tone?: "mutedSunday";
}
