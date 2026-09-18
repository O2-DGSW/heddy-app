import { font, lightTheme, palette } from "@heddy/design-tokens";

import { cn } from "@/shared";

import RecordRequiredMark from "../RecordRequiredMark";

import { PROCEDURE_TYPES } from "../../model";

import type { CSSProperties } from "react";
import type { ProcedureType } from "../../model";

interface ProcedureTypeSelectorProps {
  /** 한 시술에 커트·염색처럼 여러 종류가 섞일 수 있어 여러 개를 고를 수 있다 */
  selectedProcedureTypes: ProcedureType[];
  errorMessage?: string;
  onToggle: (procedureType: ProcedureType) => void;
}

const getProcedureButtonStyle = (isSelected: boolean): CSSProperties => ({
  backgroundColor: isSelected ? palette.main[97] : lightTheme.label.buttonText,
  borderColor: isSelected ? lightTheme.primary.normal : lightTheme.fill.neutral,
  color: isSelected ? lightTheme.primary.normal : lightTheme.label.alternative,
});

const ProcedureTypeSelector = ({
  errorMessage,
  selectedProcedureTypes,
  onToggle,
}: ProcedureTypeSelectorProps) => {
  const hasError = Boolean(errorMessage);
  const errorId = "record-procedure-type-error";

  return (
    <div className="flex w-full flex-col gap-[12px]">
      <h2 className={font.headline2.semiBold} style={{ color: lightTheme.label.neutral }}>
        시술 종류
        <RecordRequiredMark />
      </h2>
      <div
        aria-describedby={hasError ? errorId : undefined}
        aria-invalid={hasError || undefined}
        className="flex flex-wrap gap-[8px]"
      >
        {PROCEDURE_TYPES.map(procedureType => {
          const isSelected = selectedProcedureTypes.includes(procedureType);

          return (
            <button
              aria-pressed={isSelected}
              className={cn(
                font.label.regular,
                "h-[27px] rounded-[15px] border border-solid px-[13px] py-[3px]"
              )}
              key={procedureType}
              onClick={() => onToggle(procedureType)}
              style={getProcedureButtonStyle(isSelected)}
              type="button"
            >
              {procedureType}
            </button>
          );
        })}
      </div>
      {errorMessage && (
        <span
          className={font.caption.regular}
          id={errorId}
          style={{ color: lightTheme.status.error }}
        >
          {errorMessage}
        </span>
      )}
    </div>
  );
};

export default ProcedureTypeSelector;
