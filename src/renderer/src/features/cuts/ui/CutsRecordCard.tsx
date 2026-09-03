import { font, lightTheme } from "@heddy/design-tokens";

import { CutsStatusBadge } from "@/features/cuts/ui/CutsStatusBadge";
import { CutsStarIcon } from "@/features/cuts/ui/icons/CutsStarIcon";
import { CutsChevronRightIcon } from "@/features/cuts/ui/icons/CutsChevronRightIcon";
import type { CutsRecord } from "@/features/cuts/model/types/CutsRecord.types";

interface CutsRecordCardProps {
  record: CutsRecord;
  onClick: () => void;
}

export const CutsRecordCard = ({ record, onClick }: CutsRecordCardProps) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-2xl p-3 text-left shadow-[0_1px_6px_rgba(0,0,0,0.06)] max-[400px]:gap-2 max-[400px]:p-2"
      style={{ backgroundColor: lightTheme.background.normal }}
    >
      {/* 정사각형을 항상 유지해야 하므로 가로/세로를 각각 고정한다.
          (self-stretch로 세로를 옆 텍스트 블록 높이에 맞추면 좁은 화면에서 폭만 줄어 비율이 깨진다.) */}
      <div
        className="h-20 w-20 shrink-0 overflow-hidden rounded-xl max-[400px]:h-16 max-[400px]:w-16"
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

      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <span className={font.caption.medium} style={{ color: lightTheme.label.assistive }}>
          {record.date}
        </span>
        <span
          className={`truncate ${font.headline2.bold}`}
          style={{ color: lightTheme.label.normal }}
        >
          {record.procedureName}
        </span>
        <span
          className={`truncate ${font.caption.regular}`}
          style={{ color: lightTheme.label.alternative }}
        >
          {record.salonName} · {record.designerName}
        </span>

        {/* 좁은 기기에서는 별점과 배지가 한 줄에 다 들어가지 않아 줄바꿈되며 카드가 어긋난다.
            400px 이하에서는 요소 크기를 줄여 한 줄을 유지한다. */}
        <div className="flex flex-wrap items-center gap-1.5 pt-0.5 max-[400px]:gap-1">
          <CutsRatingStars rating={record.rating} />
          {record.isSharing && <CutsStatusBadge variant="sharing" />}
          {record.analysisStatus && <CutsStatusBadge variant={record.analysisStatus} />}
        </div>
      </div>

      <CutsChevronRightIcon />
    </button>
  );
};

const CutsRatingStars = ({ rating }: { rating: number }) => {
  return (
    <span aria-label={`평점 ${rating}점`} className="flex shrink-0 items-center gap-0.5">
      {Array.from({ length: 5 }, (_, index) => (
        <CutsStarIcon key={index} filled={index < rating} />
      ))}
    </span>
  );
};
