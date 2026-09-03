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
  errorMessage?: string;
  inputMode?: "decimal" | "text";
  multiline?: boolean;
  maxLength?: number;
  onChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

const fieldStyle = {
  "--placeholder-color": lightTheme.line.normal,
  backgroundColor: lightTheme.background.neutral,
  borderColor: "transparent",
  color: lightTheme.label.neutral,
} satisfies PlaceholderStyle;

const fieldClassName = cn(
  "w-full rounded-[15px] border-0 px-[17px] outline-none",
  "placeholder:text-[var(--placeholder-color)]",
  font.body.regular
);

const RecordTextField = ({
  errorMessage,
  inputMode = "text",
  label,
  maxLength,
  multiline = false,
  name,
  onChange,
  placeholder,
  value,
}: RecordTextFieldProps) => {
  const hasError = Boolean(errorMessage);
  const errorId = `${name}-error`;
  const mergedFieldStyle = {
    ...fieldStyle,
    borderColor: hasError ? lightTheme.status.error : fieldStyle.borderColor,
  };

  return (
    <label className="flex w-full flex-col gap-[10px]">
      <span className={font.headline2.semiBold} style={{ color: lightTheme.label.neutral }}>
        {label}
      </span>
      {multiline ? (
        <textarea
          aria-describedby={hasError ? errorId : undefined}
          aria-invalid={hasError || undefined}
          className={cn(fieldClassName, "h-[113px] resize-none border border-solid py-[15px]")}
          maxLength={maxLength}
          name={name}
          onChange={onChange}
          placeholder={placeholder}
          style={mergedFieldStyle}
          value={value}
        />
      ) : (
        <input
          aria-describedby={hasError ? errorId : undefined}
          aria-invalid={hasError || undefined}
          autoComplete="off"
          className={cn(fieldClassName, "h-[53px] border border-solid")}
          inputMode={inputMode}
          name={name}
          onChange={onChange}
          placeholder={placeholder}
          style={mergedFieldStyle}
          type="text"
          value={value}
        />
      )}
      {errorMessage && (
        <span
          className={font.caption.regular}
          id={errorId}
          style={{ color: lightTheme.status.error }}
        >
          {errorMessage}
        </span>
      )}
    </label>
  );
};

export default RecordTextField;
