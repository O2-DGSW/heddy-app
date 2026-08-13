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
      className="flex w-full items-center gap-3 rounded-2xl p-3 text-left"
      style={{ backgroundColor: lightTheme.background.normal }}
    >
      <div
        className="h-20 w-20 shrink-0 overflow-hidden rounded-xl"
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
        <span className={font.headline2.bold} style={{ color: lightTheme.label.normal }}>
          {record.procedureName}
        </span>
        <span className={font.caption.regular} style={{ color: lightTheme.label.alternative }}>
          {record.salonName} · {record.designerName}
        </span>

        <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
          <CutsRatingStars rating={record.rating} />
          {record.isSharing && <CutsStatusBadge variant="sharing" />}
          <CutsStatusBadge variant={record.analysisStatus} />
        </div>
      </div>

      <CutsChevronRightIcon />
    </button>
  );
};

const CutsRatingStars = ({ rating }: { rating: number }) => {
  return (
    <span aria-label={`평점 ${rating}점`} className="flex items-center gap-0.5">
      {Array.from({ length: 5 }, (_, index) => (
        <CutsStarIcon key={index} filled={index < rating} />
      ))}
    </span>
  );
};
