import type { CSSProperties } from "react";

export type RecordFieldNameType = "salon" | "price" | "designer" | "duration";

export type PlaceholderStyle = CSSProperties & {
  "--placeholder-color": string;
};
