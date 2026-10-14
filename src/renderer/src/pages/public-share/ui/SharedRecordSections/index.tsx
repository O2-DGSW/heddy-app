import { font, lightTheme } from "@heddy/design-tokens";

import { formatLongDate, formatServiceTypes } from "@/entities/record";
import type { PublicShareRecord } from "@/entities/share";
import { StarIcon } from "@/shared";

import SectionTitle from "../SectionTitle";

/**
 * 공유에서 선택하지 않은 항목은 응답에 키 자체가 없다.
 * 상세 화면처럼 "미입력"으로 채우면 공유 안 한 값을 없는 값처럼 보여주게 되므로, 아예 줄을 그리지 않는다.
 */
interface SharedRecordSectionsProps {
  record: PublicShareRecord;
}

const SharedRecordSections = ({ record }: SharedRecordSectionsProps) => {
  const recordInformation = [
    { label: "시술 날짜", value: formatLongDate(record.performed_at) },
    { label: "미용실", value: record.salon_name ?? "" },
    { label: "담당 디자이너", value: record.designer_name ?? "" },
    {
      label: "시술 종류",
      value: formatServiceTypes(record.service_types ?? []),
    },
  ].filter(({ value }) => Boolean(value));

  const photoUrls = (record.photos ?? [])
    .map(photo => photo.display_url)
    .filter((photoUrl): photoUrl is string => Boolean(photoUrl));
  const hasSharedPhotos = record.photos !== undefined;
  const hasSatisfaction = typeof record.satisfaction === "number";

  return (
    <div className="flex flex-col gap-[52px] px-[19px] pb-[30px] pt-[29px]">
      {hasSharedPhotos && (
        <section className="flex flex-col gap-[6px]" aria-label="공유된 사진">
          <SectionTitle>사진</SectionTitle>
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
      )}

      <div className="flex flex-col gap-[28px]">
        {(recordInformation.length > 0 || hasSatisfaction) && (
          <section className="flex flex-col gap-[10px]" aria-label="시술 정보">
            <SectionTitle>시술 정보</SectionTitle>
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

              {hasSatisfaction && (
                <div className="flex h-[53px] items-center justify-between px-[14px]">
                  <dt className={font.body.medium} style={{ color: lightTheme.label.assistive }}>
                    만족도
                  </dt>
                  <dd
                    aria-label={`만족도 ${record.satisfaction ?? 0}점`}
                    className="flex -space-x-[3px]"
                  >
                    {Array.from({ length: record.satisfaction ?? 0 }, (_, index) => (
                      <StarIcon className="h-[20px] w-[20px]" key={index} />
                    ))}
                  </dd>
                </div>
              )}
            </dl>
          </section>
        )}

        {record.memo !== undefined && (
          <section className="flex flex-col gap-[10px]" aria-label="메모">
            <SectionTitle>메모</SectionTitle>
            <p
              className={`${font.body.medium} min-h-[92px] whitespace-pre-line rounded-[15px] px-[17px] py-[15px]`}
              style={{
                backgroundColor: lightTheme.background.neutral,
                color: lightTheme.label.alternative,
              }}
            >
              {record.memo || "등록된 메모가 없어요"}
            </p>
          </section>
        )}

        {record.next_visit_cautions !== undefined && (
          <section className="flex flex-col gap-[10px]" aria-label="다음 방문 시 주의사항">
            <SectionTitle>다음 방문 시 주의사항</SectionTitle>
            <p
              className={`${font.body.medium} min-h-[92px] whitespace-pre-line rounded-[15px] px-[17px] py-[15px]`}
              style={{
                backgroundColor: lightTheme.background.neutral,
                color: lightTheme.label.alternative,
              }}
            >
              {record.next_visit_cautions || "등록된 주의사항이 없어요"}
            </p>
          </section>
        )}
      </div>
    </div>
  );
};

export default SharedRecordSections;
