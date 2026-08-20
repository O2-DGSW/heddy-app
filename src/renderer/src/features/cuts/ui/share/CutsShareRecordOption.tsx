import { font, lightTheme } from "@heddy/design-tokens";

import { RadioButton } from "@/shared/ui/radio/RadioButton";
import type { CutsRecord } from "@/features/cuts/model/types/CutsRecord.types";

interface CutsShareRecordOptionProps {
  record: CutsRecord;
  isSelected: boolean;
  onSelect: () => void;
}

export const CutsShareRecordOption = ({ record, isSelected, onSelect }: CutsShareRecordOptionProps) => {
  return (
    <div
      role="radio"
      aria-checked={isSelected}
      onClick={onSelect}
      className="flex w-full items-center gap-3 rounded-2xl p-3 text-left"
      style={{ backgroundColor: lightTheme.background.normal }}
    >
      <RadioButton label="" selected={isSelected} onClick={onSelect} />

      <div
        className="h-14 w-14 shrink-0 overflow-hidden rounded-xl"
        style={{ backgroundColor: lightTheme.fill.normal }}
      >
        {record.thumbnailUrl && (
          <img
            src={record.thumbnailUrl}
            alt={`${record.procedureName} 시술 사진`}
            className="h-full w-full object-cover"
          />
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className={font.headline2.bold} style={{ color: lightTheme.label.normal }}>
          {record.procedureName}
        </span>
        <span className={font.caption.regular} style={{ color: lightTheme.label.assistive }}>
          {record.salonName} · {record.date}
        </span>
      </div>
    </div>
  );
};
