import { font, lightTheme } from "@heddy/design-tokens";

import type { CutsRecord } from "@/features/cuts/model/types/CutsRecord.types";

interface CutsShareRecordOptionProps {
  record: CutsRecord;
  isSelected: boolean;
  onSelect: () => void;
}

export const CutsShareRecordOption = ({ record, isSelected, onSelect }: CutsShareRecordOptionProps) => {
  return (
    <button
      type="button"
      onClick={onSelect}
      role="radio"
      aria-checked={isSelected}
      className="flex w-full items-center gap-3 rounded-2xl p-3 text-left"
      style={{ backgroundColor: lightTheme.background.normal }}
    >
      <span
        className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full"
        style={{ border: `2px solid ${isSelected ? lightTheme.primary.normal : lightTheme.line.neutral}` }}
      >
        {isSelected && (
          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: lightTheme.primary.normal }} />
        )}
      </span>

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
    </button>
  );
};
