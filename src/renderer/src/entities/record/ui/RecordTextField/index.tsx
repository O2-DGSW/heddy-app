import { font, lightTheme } from "@heddy/design-tokens";

import { cn } from "@/shared";

import type { ChangeEvent, CSSProperties } from "react";

type PlaceholderStyle = CSSProperties & {
  "--placeholder-color": string;
};

interface RecordTextFieldProps {
  label: string;
  name: string;
  placeholder: string;
  value: string;
  inputMode?: "decimal" | "text";
  multiline?: boolean;
  maxLength?: number;
  onChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

const fieldStyle = {
  "--placeholder-color": lightTheme.line.normal,
  backgroundColor: lightTheme.background.neutral,
  color: lightTheme.label.neutral,
} satisfies PlaceholderStyle;

const fieldClassName = cn(
  "w-full rounded-[15px] border-0 px-[17px] outline-none",
  "placeholder:text-[var(--placeholder-color)]",
  font.body.regular
);

const RecordTextField = ({
  inputMode = "text",
  label,
  maxLength,
  multiline = false,
  name,
  onChange,
  placeholder,
  value,
}: RecordTextFieldProps) => {
  return (
    <label className="flex w-[363px] flex-col gap-[10px]">
      <span className={font.headline2.semiBold} style={{ color: lightTheme.label.neutral }}>
        {label}
      </span>
      {multiline ? (
        <textarea
          className={cn(fieldClassName, "h-[113px] resize-none py-[15px]")}
          maxLength={maxLength}
          name={name}
          onChange={onChange}
          placeholder={placeholder}
          style={fieldStyle}
          value={value}
        />
      ) : (
        <input
          autoComplete="off"
          className={cn(fieldClassName, "h-[53px]")}
          inputMode={inputMode}
          name={name}
          onChange={onChange}
          placeholder={placeholder}
          style={fieldStyle}
          type="text"
          value={value}
        />
      )}
    </label>
  );
};

export default RecordTextField;
