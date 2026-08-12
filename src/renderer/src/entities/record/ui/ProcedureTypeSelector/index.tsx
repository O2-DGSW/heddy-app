import { font, lightTheme, palette } from "@heddy/design-tokens";

import { cn } from "@/shared";

import { PROCEDURE_TYPES } from "../../model";

import type { CSSProperties } from "react";
import type { ProcedureType } from "../../model";

interface ProcedureTypeSelectorProps {
  selectedProcedureType: ProcedureType;
  onChange: (procedureType: ProcedureType) => void;
}

const getProcedureButtonStyle = (isSelected: boolean): CSSProperties => ({
  backgroundColor: isSelected ? palette.main[97] : lightTheme.label.buttonText,
  borderColor: isSelected ? lightTheme.primary.normal : lightTheme.fill.neutral,
  color: isSelected ? lightTheme.primary.normal : lightTheme.label.alternative,
});

const ProcedureTypeSelector = ({ selectedProcedureType, onChange }: ProcedureTypeSelectorProps) => {
  return (
    <div className="flex w-[363px] flex-col gap-[12px]">
      <h2 className={font.headline2.semiBold} style={{ color: lightTheme.label.neutral }}>
        시술 종류
      </h2>
      <div className="flex flex-wrap gap-[8px]">
        {PROCEDURE_TYPES.map(procedureType => {
          const isSelected = selectedProcedureType === procedureType;

          return (
            <button
              aria-pressed={isSelected}
              className={cn(
                font.label.regular,
                "h-[27px] rounded-[15px] border border-solid px-[13px] py-[3px]"
              )}
              key={procedureType}
              onClick={() => onChange(procedureType)}
              style={getProcedureButtonStyle(isSelected)}
              type="button"
            >
              {procedureType}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ProcedureTypeSelector;
