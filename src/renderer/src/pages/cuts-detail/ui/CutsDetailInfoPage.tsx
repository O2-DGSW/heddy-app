import { useParams } from "react-router-dom";
import { font, lightTheme } from "@heddy/design-tokens";

import {
  formatDurationDisplay,
  getTreatmentRecordPhotoDisplayUrl,
  useGetTreatmentRecord,
  formatLongDate,
  formatServiceTypes,
} from "@/entities/record";
import { CutsRecordActions } from "@/features/cuts";
import { cn, Skeleton, StarIcon } from "@/shared";

/** 만족도는 5점 만점이라 채운 별과 빈 별을 합쳐 늘 5개를 그린다 */
const SATISFACTION_SCORES = [1, 2, 3, 4, 5];

const formatPrice = (price: { amount: number; currency: string } | null | undefined) => {
  if (!price) {
    return "미입력";
  }

  return price.currency === "KRW"
    ? `${price.amount.toLocaleString("ko-KR")}원`
    : `${price.amount.toLocaleString("ko-KR")} ${price.currency}`;
};

const CutsDetailInfoSkeleton = () => (
  <div
    role="status"
    aria-busy="true"
    aria-label="시술 기록을 불러오는 중"
    className="flex flex-col gap-[52px] px-[19px] pb-[30px] pt-[29px]"
  >
    <span className="sr-only">시술 기록을 불러오는 중</span>
    <div aria-hidden="true" className="flex flex-col gap-[6px]">
      <h2 className={font.headline2.semiBold} style={{ color: lightTheme.label.neutral }}>
        사진
      </h2>
      <div className="flex gap-[11px] overflow-hidden pl-[6px]">
        <Skeleton className="size-[110px] shrink-0 rounded-[10px]" />
        <Skeleton className="size-[110px] shrink-0 rounded-[10px]" />
      </div>
    </div>
    <div aria-hidden="true" className="flex flex-col gap-[28px]">
      <div className="flex flex-col gap-[10px]">
        <h2 className={font.headline2.semiBold} style={{ color: lightTheme.label.neutral }}>
          시술 정보
        </h2>
        <div
          className="overflow-hidden rounded-[15px]"
          style={{ backgroundColor: lightTheme.background.normal }}
        >
          {[
            "시술 날짜",
            "미용실",
            "담당 디자이너",
            "시술 종류",
            "시술 내용",
            "소요 시간",
            "금액",
            "만족도",
          ].map(label => (
            <div
              key={label}
              className="flex h-[53px] items-center justify-between gap-4 border-b px-[14px] last:border-b-0"
              style={{ borderColor: lightTheme.label.buttonText }}
            >
              <span className={font.body.medium} style={{ color: lightTheme.label.assistive }}>
                {label}
              </span>
              <Skeleton className={cn("h-[1lh] w-28 rounded", font.body.medium)} />
            </div>
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-[10px]">
        <h2 className={font.headline2.semiBold} style={{ color: lightTheme.label.neutral }}>
          메모
        </h2>
        <Skeleton className="h-[92px] rounded-[15px]" />
      </div>
    </div>
    <div aria-hidden="true" className="grid grid-cols-3 gap-2">
      {[0, 1, 2].map(index => (
        <Skeleton key={index} className="h-12 rounded-xl" />
      ))}
    </div>
  </div>
);

const CutsDetailInfoPage = () => {
  const { id } = useParams();
  const { data: record, isError, isLoading } = useGetTreatmentRecord(id);

  if (isLoading) {
    return <CutsDetailInfoSkeleton />;
  }

  if (isError || !record) {
    return (
      <p
        className={`flex flex-1 items-center justify-center ${font.body.regular}`}
        style={{ color: lightTheme.label.assistive }}
      >
        시술 기록을 찾을 수 없어요
      </p>
    );
  }

  const recordInformation = [
    { label: "시술 날짜", value: formatLongDate(record.performed_at) },
    { label: "미용실", value: record.salon_name ?? "미입력" },
    { label: "담당 디자이너", value: record.designer_name ?? "미입력" },
    {
      label: "시술 종류",
      value: formatServiceTypes(record.service_types),
    },
    { label: "시술 내용", value: record.treatment_content ?? "미입력" },
    {
      label: "소요 시간",
      // 입력이 시·분 휠로 바뀌어서, 보여줄 때도 "155분"이 아니라 "2시간 35분"으로 맞춘다
      value: record.duration_minutes
        ? formatDurationDisplay(String(record.duration_minutes))
        : "미입력",
    },
    { label: "금액", value: formatPrice(record.price) },
  ];
  const photoUrls = (record.photos ?? [])
    .map(getTreatmentRecordPhotoDisplayUrl)
    .filter((photoUrl): photoUrl is string => Boolean(photoUrl));

  return (
    <div className="flex flex-col gap-[52px] px-[19px] pb-[30px] pt-[29px]">
      <section className="flex flex-col gap-[6px]" aria-labelledby="record-photo-title">
        <h2
          className={font.headline2.semiBold}
          id="record-photo-title"
          style={{ color: lightTheme.label.neutral }}
        >
          사진
        </h2>
        {photoUrls.length > 0 ? (
          <div className="flex gap-[11px] overflow-x-auto pl-[6px] no-scrollbar">
            {photoUrls.map((photoUrl, index) => (
              <img
                decoding="async"
                loading="lazy"
                width={110}
                height={110}
                alt={`시술 사진 ${index + 1}`}
                className="h-[110px] w-[110px] rounded-[10px] object-cover"
                key={photoUrl}
                src={photoUrl}
              />
            ))}
          </div>
        ) : (
          <p className={font.body.medium} style={{ color: lightTheme.label.assistive }}>
            등록된 사진이 없어요
          </p>
        )}
      </section>

      <div className="flex flex-col gap-[28px]">
        <section className="flex flex-col gap-[10px]" aria-labelledby="record-information-title">
          <h2
            className={font.headline2.semiBold}
            id="record-information-title"
            style={{ color: lightTheme.label.neutral }}
          >
            시술 정보
          </h2>
          <dl
            className="overflow-hidden rounded-[15px]"
            style={{ backgroundColor: lightTheme.background.normal }}
          >
            {recordInformation.map(({ label, value }) => (
              <div
                className="flex h-[53px] items-center justify-between border-b px-[14px] last:border-b-0"
                key={label}
                style={{ borderColor: lightTheme.label.buttonText }}
              >
                <dt className={font.body.medium} style={{ color: lightTheme.label.assistive }}>
                  {label}
                </dt>
                <dd className={font.body.medium} style={{ color: lightTheme.label.alternative }}>
                  {value}
                </dd>
              </div>
            ))}
            <div className="flex h-[53px] items-center justify-between px-[14px]">
              <dt className={font.body.medium} style={{ color: lightTheme.label.assistive }}>
                만족도
              </dt>
              <dd
                aria-label={`만족도 ${record.satisfaction ?? 0}점`}
                className="flex -space-x-[3px]"
              >
                {SATISFACTION_SCORES.map(score => (
                  <StarIcon
                    key={score}
                    /* 빈 별도 같은 별을 회색으로 바꿔 쓴다 */
                    className={cn(
                      "h-[20px] w-[20px]",
                      score > (record.satisfaction ?? 0) && "opacity-35 grayscale"
                    )}
                  />
                ))}
              </dd>
            </div>
          </dl>
        </section>

        <section className="flex flex-col gap-[10px]" aria-labelledby="record-memo-title">
          <h2
            className={font.headline2.semiBold}
            id="record-memo-title"
            style={{ color: lightTheme.label.neutral }}
          >
            메모
          </h2>
          <p
            className={`${font.body.medium} min-h-[92px] rounded-[15px] px-[17px] py-[15px]`}
            style={{
              backgroundColor: lightTheme.background.neutral,
              color: lightTheme.label.alternative,
            }}
          >
            {record.memo ?? "등록된 메모가 없어요"}
          </p>
        </section>
      </div>

      <CutsRecordActions />
    </div>
  );
};

export { CutsDetailInfoPage };
