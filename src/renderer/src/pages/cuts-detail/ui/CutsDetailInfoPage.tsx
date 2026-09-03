import { useParams } from "react-router-dom";
import { font, lightTheme } from "@heddy/design-tokens";

import ratingStar from "@/shared/assets/rating-star.svg";
import {
  getTreatmentRecordPhotoDisplayUrl,
  useGetTreatmentRecord,
  type ServiceType,
} from "@/entities/record";
import { CutsRecordActions } from "@/features/cuts/ui/CutsRecordActions";

/** 만족도는 5점 만점이라 채운 별과 빈 별을 합쳐 늘 5개를 그린다 */
const SATISFACTION_SCORES = [1, 2, 3, 4, 5];

const SERVICE_TYPE_LABEL: Record<ServiceType, string> = {
  CUT: "커트",
  PERM: "펌",
  COLOR: "염색",
  BLEACH: "탈색",
  CLINIC: "클리닉",
  STYLING: "스타일링",
  OTHER: "기타",
};

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("ko-KR", { year: "numeric", month: "long", day: "numeric" }).format(
    new Date(value)
  );

const formatPrice = (price: { amount: number; currency: string } | null | undefined) => {
  if (!price) {
    return "미입력";
  }

  return price.currency === "KRW"
    ? `${price.amount.toLocaleString("ko-KR")}원`
    : `${price.amount.toLocaleString("ko-KR")} ${price.currency}`;
};

const CutsDetailInfoPage = () => {
  const { id } = useParams();
  const { data: record, isError, isLoading } = useGetTreatmentRecord(id);

  if (isLoading) {
    return (
      <p
        className={`flex flex-1 items-center justify-center ${font.body.regular}`}
        style={{ color: lightTheme.label.assistive }}
      >
        시술 기록을 불러오는 중이에요
      </p>
    );
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
    { label: "시술 날짜", value: formatDate(record.performed_at) },
    { label: "미용실", value: record.salon_name ?? "미입력" },
    { label: "담당 디자이너", value: record.designer_name ?? "미입력" },
    {
      label: "시술 종류",
      value: record.service_types.map(serviceType => SERVICE_TYPE_LABEL[serviceType]).join(" · "),
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
                alt={`시술 사진 ${index + 1}`}
                className="h-[110px] w-[110px] rounded-[10px] object-cover"
                key={index}
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
                  <img
                    alt=""
                    className="h-[20px] w-[20px]"
                    key={score}
                    /* 빈 별도 같은 에셋을 회색으로 바꿔 쓴다. 다른 에셋은 뷰박스 비율이 달라 크기가 어긋난다 */
                    style={
                      score <= (record.satisfaction ?? 0)
                        ? undefined
                        : { filter: "grayscale(1)", opacity: 0.35 }
                    }
                    src={ratingStar}
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
