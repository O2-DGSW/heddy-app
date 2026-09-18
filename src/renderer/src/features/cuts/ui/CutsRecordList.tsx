import { CutsRecordCard } from "@/features/cuts/ui/CutsRecordCard";
import { CutsEmptyState } from "@/features/cuts/ui/CutsEmptyState";
import type { CutsRecord } from "@/features/cuts/model/types/CutsRecord.types";
import type { CutsViewMode } from "@/features/cuts/model/types/CutsViewMode.types";

interface CutsRecordListProps {
  records: CutsRecord[];
  onRecordClick: (record: CutsRecord) => void;
  viewMode?: CutsViewMode;
}

/**
 * 보기 방식별 배치.
 *
 * 그리드는 뷰포트 브레이크포인트 대신 auto-fill을 쓴다 — 넓은 화면에서는 앱이 휴대폰 프레임 안에
 * 들어가서 화면은 넓어도 목록 폭은 그대로라, 뷰포트 기준으로 칸을 늘리면 좁은 칸에 4열이 박힌다.
 * auto-fill은 목록이 실제로 쓰는 폭만 보고 칸 수를 정해서 두 경우 모두 맞는다.
 * 140px는 가장 좁은 기기(320px)에서도 두 칸이 나오는 값이다.
 */
const LIST_CLASS_NAME = "flex flex-col gap-2 px-4 pb-6 max-[400px]:px-3";
const GRID_CLASS_NAME =
  "grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-2 px-4 pb-6 max-[400px]:px-3";

export const CutsRecordList = ({
  records,
  onRecordClick,
  viewMode = "list",
}: CutsRecordListProps) => {
  if (records.length === 0) {
    return <CutsEmptyState />;
  }

  return (
    <ul className={viewMode === "grid" ? GRID_CLASS_NAME : LIST_CLASS_NAME}>
      {records.map(record => (
        // 그리드에서는 같은 줄 카드끼리 높이를 맞춰야 글자 수가 달라도 아래가 들쭉날쭉하지 않다
        <li className={viewMode === "grid" ? "h-full" : undefined} key={record.id}>
          <CutsRecordCard
            onClick={() => onRecordClick(record)}
            record={record}
            viewMode={viewMode}
          />
        </li>
      ))}
    </ul>
  );
};
