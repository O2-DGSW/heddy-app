import { font, lightTheme } from "@heddy/design-tokens";

import { CutsRecordCard } from "@/features/cuts/ui/CutsRecordCard";
import type { CutsRecord } from "@/features/cuts/model/types/CutsRecord.types";

interface CutsRecordListProps {
  records: CutsRecord[];
  onRecordClick: (record: CutsRecord) => void;
}

export const CutsRecordList = ({ records, onRecordClick }: CutsRecordListProps) => {
  if (records.length === 0) {
    return (
      <p className={`px-4 py-10 text-center ${font.body.regular}`} style={{ color: lightTheme.label.assistive }}>
        해당하는 시술기록이 없어요.
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-2 px-4 pb-6">
      {records.map(record => (
        <li key={record.id}>
          <CutsRecordCard record={record} onClick={() => onRecordClick(record)} />
        </li>
      ))}
    </ul>
  );
};
