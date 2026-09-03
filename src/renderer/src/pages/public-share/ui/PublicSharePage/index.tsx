import { useParams } from "react-router-dom";
import { font, lightTheme } from "@heddy/design-tokens";

import { useGetPublicShare } from "@/entities/share";
import type { PublicShareRecord, PublicShareSavedStyle } from "@/entities/share";
import agerSad from "@/shared/assets/agerSad.svg";
import ratingStar from "@/shared/assets/rating-star.svg";

const SERVICE_TYPE_LABEL: Record<string, string> = {
  CUT: "커트",
  PERM: "펌",
  COLOR: "염색",
  BLEACH: "탈색",
  CLINIC: "클리닉",
  STYLING: "스타일링",
  OTHER: "기타",
};

const formatDate = (value?: string | null) => {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
};

const SectionTitle = ({ children }: { children: string }) => (
  <h2 className={font.headline2.semiBold} style={{ color: lightTheme.label.neutral }}>
    {children}
  </h2>
);

/**
 * 공유에서 선택하지 않은 항목은 응답에 키 자체가 없다.
 * 상세 화면처럼 "미입력"으로 채우면 공유 안 한 값을 없는 값처럼 보여주게 되므로, 아예 줄을 그리지 않는다.
 */
const SharedRecordSections = ({ record }: { record: PublicShareRecord }) => {
  const recordInformation = [
    { label: "시술 날짜", value: formatDate(record.performed_at) },
    { label: "미용실", value: record.salon_name ?? "" },
    { label: "담당 디자이너", value: record.designer_name ?? "" },
    {
      label: "시술 종류",
      value: (record.service_types ?? [])
        .map(serviceType => SERVICE_TYPE_LABEL[serviceType] ?? serviceType)
        .join(" · "),
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
                      <img alt="" className="h-[20px] w-[20px]" key={index} src={ratingStar} />
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

const SavedStyleSection = ({ savedStyles }: { savedStyles: PublicShareSavedStyle[] }) => (
  // 시술기록 쪽(SharedRecordSections)과 같은 pt-[29px]를 둬서 헤더와 붙어 보이지 않게 한다.
  <section
    className="flex flex-col gap-[10px] px-[19px] pb-[30px] pt-[29px]"
    aria-label="후보 스타일"
  >
    <SectionTitle>후보 스타일</SectionTitle>
    <div className="flex flex-col gap-[10px]">
      {savedStyles.map((style, index) => (
        <div
          className="flex items-center gap-[12px] rounded-[15px] p-[12px]"
          key={index}
          style={{ backgroundColor: lightTheme.background.normal }}
        >
          {style.image_url && (
            <img
              alt=""
              className="h-[70px] w-[70px] shrink-0 rounded-[10px] object-cover"
              src={style.image_url}
            />
          )}
          <div className="flex min-w-0 flex-col gap-[4px]">
            <span className={font.body.medium} style={{ color: lightTheme.label.neutral }}>
              {style.style_name}
            </span>
            {style.reason && (
              <span className={font.caption.regular} style={{ color: lightTheme.label.assistive }}>
                {style.reason}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  </section>
);

/**
 * 공유 링크(/s/:shareToken)로 들어온 사람이 로그인 없이 보는 화면.
 * 앱 화면이 아니라 웹에서 열리므로 하단 네비게이션 없이 단독으로 그리고,
 * 내용은 시술기록 상세(정보 탭)와 같은 구성으로 맞춘다.
 */
const PublicSharePage = () => {
  const { shareToken } = useParams();
  const { data, isPending, isError, error } = useGetPublicShare(shareToken);

  const records = data?.records ?? [];
  const savedStyles = data?.saved_styles ?? [];
  const hasContent = records.length > 0 || savedStyles.length > 0;

  /**
   * 한 링크에 시술기록과 후보 스타일이 섞여 올 수 있다.
   * 후보 스타일만 담긴 링크를 "시술기록"이라 부르면 받는 사람이 다른 걸 기대하게 되므로,
   * 기록이 없을 때만 제목을 후보 스타일로 바꾼다.
   */
  const title =
    records.length === 0 && savedStyles.length > 0 ? "공유된 후보 스타일" : "공유된 시술기록";

  return (
    // 상세(정보 탭)와 같이 흰 배경 위에 올린다. 시술 정보 카드도 흰색이라 구분선만 남아 납작하게 보인다.
    <main
      // 앱이 아니라 모바일 브라우저에서 열리는 화면이라 --safe-area-inset-*이 주입되지 않는다.
      // env()도 0으로 잡히는 브라우저가 있어 최소 여백을 둬야 제목이 상단에 붙어 잘리지 않는다.
      className="min-h-dvh w-full px-safe pb-[max(16px,var(--safe-area-inset-bottom,env(safe-area-inset-bottom,0px)))] pt-[max(16px,var(--safe-area-inset-top,env(safe-area-inset-top,0px)))]"
      style={{ backgroundColor: lightTheme.background.normal }}
    >
      <div className="mx-auto w-full max-w-[430px]">
        <header
          className="flex flex-col items-center gap-[4px] border-b px-[19px] py-[18px]"
          style={{
            backgroundColor: lightTheme.background.normal,
            borderColor: lightTheme.line.alternative,
          }}
        >
          <h1 className={font.headline1.bold} style={{ color: lightTheme.label.neutral }}>
            {title}
          </h1>
          {data?.share.owner_display_name && (
            <p className={font.caption.regular} style={{ color: lightTheme.label.assistive }}>
              {data.share.owner_display_name}님이 공유했어요
            </p>
          )}
        </header>

        {(isPending || isError) && (
          <div className="flex flex-col items-center justify-center gap-[12px] px-[19px] py-[120px]">
            {isError && <img alt="" className="h-[110px] w-[110px]" src={agerSad} />}
            <p
              className={`text-center ${font.body.medium}`}
              style={{ color: lightTheme.label.assistive }}
            >
              {isError ? (error?.message ?? "공유된 기록을 불러오지 못했습니다.") : "불러오는 중"}
            </p>
          </div>
        )}

        {!isPending && !isError && (
          <>
            {records.map((record, index) => (
              <SharedRecordSections key={index} record={record} />
            ))}

            {savedStyles.length > 0 && <SavedStyleSection savedStyles={savedStyles} />}

            {!hasContent && (
              <p
                className={`px-[19px] py-[120px] text-center ${font.body.medium}`}
                style={{ color: lightTheme.label.assistive }}
              >
                공유된 내용이 없어요
              </p>
            )}

            {data?.share.expires_at && (
              <p
                className={`px-[19px] pb-[30px] text-center ${font.caption.regular}`}
                style={{ color: lightTheme.label.assistive }}
              >
                {formatDate(data.share.expires_at)}까지 볼 수 있어요
              </p>
            )}
          </>
        )}
      </div>
    </main>
  );
};

export default PublicSharePage;
