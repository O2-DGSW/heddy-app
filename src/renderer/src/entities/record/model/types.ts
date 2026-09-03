export type RecordFieldNameType = "salon" | "price" | "duration" | "designer" | "procedureContent";

export interface RecordFormValues {
  date: string;
  salon: string;
  price: string;
  duration: string;
  designer: string;
  procedureContent: string;
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
  file?: File;
}

export interface CalendarDay {
  id: string;
  label: string;
  isCurrentMonth: boolean;
  day?: number;
  tone?: "mutedSunday";
}
