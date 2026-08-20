import { font, lightTheme } from "@heddy/design-tokens";

import { CutsShareRecordOption } from "@/features/cuts/ui/share/CutsShareRecordOption";
import type { CutsRecord } from "@/features/cuts/model/types/CutsRecord.types";

interface CutsShareRecordListProps {
  records: CutsRecord[];
  selectedId: string;
  onSelect: (recordId: string) => void;
}

export const CutsShareRecordList = ({ records, selectedId, onSelect }: CutsShareRecordListProps) => {
  return (
    <section className="flex flex-col gap-4 px-4 pt-4">
      <h2 className={font.headline2.bold} style={{ color: lightTheme.label.neutral }}>
        공유할 기록 선택
      </h2>

      <div role="radiogroup" aria-label="공유할 기록 선택" className="flex flex-col gap-2">
        {records.map(record => (
          <CutsShareRecordOption
            key={record.id}
            record={record}
            isSelected={record.id === selectedId}
            onSelect={() => onSelect(record.id)}
          />
        ))}
      </div>
    </section>
  );
};
