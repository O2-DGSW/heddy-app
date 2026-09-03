import { font, lightTheme } from "@heddy/design-tokens";

import type { RecentRecordCardProps } from "@/pages/home/model/types.ts";

import CroppedHairImage from "./CroppedHairImage.tsx";
import RatingStars from "./RatingStars.tsx";

const RecentRecordCard = ({
  record,
  isLoading = false,
  isError = false,
  onClick,
}: RecentRecordCardProps) => {
  const hasRecord = Boolean(record);

  return (
    <button
      type="button"
      className="h-full min-h-0 overflow-hidden rounded-[10px] p-[clamp(10px,1.65svh,14px)] text-left shadow-[0_0_4px_rgba(0,0,0,0.13)] active:scale-[0.99]"
      style={{ backgroundColor: lightTheme.background.normal }}
      onClick={onClick}
    >
      <span className="flex h-full min-h-0 flex-col gap-[clamp(6px,1.2svh,10px)]">
        <span className={font.label.medium} style={{ color: lightTheme.primary.normal }}>
          최근 시술 기록
        </span>

        <span className="block h-[clamp(72px,12svh,108px)] shrink-0 overflow-hidden rounded-[12px]">
          {hasRecord ? (
            <CroppedHairImage
              alt={`${record?.procedureName ?? "최근"} 시술 사진`}
              src={record?.thumbnailUrl || undefined}
            />
          ) : (
            <span
              className={`flex size-full items-center justify-center rounded-[12px] text-center ${font.caption.medium}`}
              style={{
                backgroundColor: lightTheme.background.neutral,
                color: lightTheme.label.assistive,
              }}
            >
              {isLoading ? "불러오는 중" : isError ? "다시 시도" : "기록 없음"}
            </span>
          )}
        </span>

        <span className="flex min-w-0 flex-1 flex-col gap-px overflow-hidden">
          <span className={font.caption.medium} style={{ color: lightTheme.label.alternative }}>
            {record?.date || "최근 기록을 확인해보세요"}
          </span>
          <span
            className={`${font.headline2.semiBold} block truncate`}
            style={{ color: lightTheme.label.neutral }}
          >
            {record?.procedureName || (isLoading ? "시술 기록 로딩 중" : "아직 기록이 없어요")}
          </span>
          <span
            className={`${font.caption.medium} block truncate`}
            style={{ color: lightTheme.label.alternative }}
          >
            {record ? `${record.salonName} · ${record.designerName}` : "첫 기록을 추가해보세요"}
          </span>
          <RatingStars rating={record?.rating ?? 0} />
        </span>
      </span>
    </button>
  );
};

export default RecentRecordCard;
