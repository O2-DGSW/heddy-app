import { CutsRecordCard } from "@/features/cuts/ui/CutsRecordCard";
import { CutsEmptyState } from "@/features/cuts/ui/CutsEmptyState";
import type { CutsRecord } from "@/features/cuts/model/types/CutsRecord.types";

interface CutsRecordListProps {
  records: CutsRecord[];
  onRecordClick: (record: CutsRecord) => void;
}

export const CutsRecordList = ({ records, onRecordClick }: CutsRecordListProps) => {
  if (records.length === 0) {
    return <CutsEmptyState />;
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
