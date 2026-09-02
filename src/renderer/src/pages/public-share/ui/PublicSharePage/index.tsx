import { useParams } from "react-router-dom";
import { font, lightTheme } from "@heddy/design-tokens";

import { useGetPublicShare } from "@/entities/share";
import type { PublicShareRecord } from "@/entities/share";
import agerSad from "@/shared/assets/agerSad.svg";

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

  return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
};

const InfoRow = ({ label, value }: { label: string; value: string }) => (
  <div
    className="flex items-center justify-between border-b py-3 last:border-b-0"
    style={{ borderColor: lightTheme.line.alternative }}
  >
    <span className={font.label.regular} style={{ color: lightTheme.label.assistive }}>
      {label}
    </span>
    <span className={font.label.semiBold} style={{ color: lightTheme.label.normal }}>
      {value}
    </span>
  </div>
);

/** 공유에서 선택한 항목만 내려오므로, 값이 있는 줄만 그린다 */
const SharedRecordCard = ({ record }: { record: PublicShareRecord }) => {
  const serviceTypes = (record.service_types ?? [])
    .map(type => SERVICE_TYPE_LABEL[type] ?? type)
    .join(" · ");
  const photos = (record.photos ?? []).filter(photo => photo.display_url);

  return (
    <article
      className="flex flex-col gap-4 rounded-2xl p-4 shadow-[0_1px_6px_rgba(0,0,0,0.06)]"
      style={{ backgroundColor: lightTheme.background.normal }}
    >
      {serviceTypes && (
        <h2 className={font.headline2.bold} style={{ color: lightTheme.label.normal }}>
          {serviceTypes}
        </h2>
      )}

      {photos.length > 0 && (
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {photos.map((photo, index) => (
            <img
              alt=""
              className="h-28 w-28 shrink-0 rounded-xl object-cover"
              key={photo.display_url ?? index}
              src={photo.display_url ?? ""}
            />
          ))}
        </div>
      )}

      <div className="flex flex-col">
        {formatDate(record.performed_at) && (
          <InfoRow label="시술 날짜" value={formatDate(record.performed_at)} />
        )}
        {record.salon_name && <InfoRow label="미용실" value={record.salon_name} />}
        {record.designer_name && <InfoRow label="담당 디자이너" value={record.designer_name} />}
        {typeof record.satisfaction === "number" && (
          <InfoRow label="만족도" value={"★".repeat(record.satisfaction)} />
        )}
      </div>

      {record.memo && (
        <div className="flex flex-col gap-1">
          <span className={font.label.semiBold} style={{ color: lightTheme.label.neutral }}>
            메모
          </span>
          <p
            className={`whitespace-pre-line rounded-xl p-3 ${font.caption.regular}`}
            style={{ backgroundColor: lightTheme.fill.normal, color: lightTheme.label.alternative }}
          >
            {record.memo}
          </p>
        </div>
      )}

      {record.next_visit_cautions && (
        <div className="flex flex-col gap-1">
          <span className={font.label.semiBold} style={{ color: lightTheme.label.neutral }}>
            다음 방문 시 주의사항
          </span>
          <p
            className={`whitespace-pre-line rounded-xl p-3 ${font.caption.regular}`}
            style={{ backgroundColor: lightTheme.fill.normal, color: lightTheme.label.alternative }}
          >
            {record.next_visit_cautions}
          </p>
        </div>
      )}
    </article>
  );
};

/**
 * 공유 링크(/s/:shareToken)로 들어온 사람이 로그인 없이 보는 화면.
 * 앱 화면이 아니라 웹에서 열리는 페이지라 하단 네비게이션 없이 단독으로 그린다.
 */
const PublicSharePage = () => {
  const { shareToken } = useParams();
  const { data, isPending, isError, error } = useGetPublicShare(shareToken);

  const records = data?.records ?? [];
  const savedStyles = data?.saved_styles ?? [];

  return (
    <main
      className="min-h-dvh w-full px-safe py-safe"
      style={{ backgroundColor: lightTheme.fill.normal }}
    >
      <div className="mx-auto flex w-full max-w-[560px] flex-col gap-4 px-4 py-8">
        <header className="flex flex-col gap-1">
          <h1 className={font.headline1.bold} style={{ color: lightTheme.label.normal }}>
            공유된 시술기록
          </h1>
          {data?.share.owner_display_name && (
            <p className={font.label.regular} style={{ color: lightTheme.label.assistive }}>
              {data.share.owner_display_name}님이 공유했어요
            </p>
          )}
        </header>

        {(isPending || isError) && (
          <div className="flex flex-col items-center justify-center gap-3 py-20">
            {isError && <img alt="" className="h-28 w-28" src={agerSad} />}
            <p
              className={`text-center ${font.body.regular}`}
              style={{ color: lightTheme.label.assistive }}
            >
              {isError ? (error?.message ?? "공유된 기록을 불러오지 못했습니다.") : "불러오는 중"}
            </p>
          </div>
        )}

        {!isPending && !isError && (
          <>
            {records.map((record, index) => (
              <SharedRecordCard key={index} record={record} />
            ))}

            {savedStyles.length > 0 && (
              <section className="flex flex-col gap-3">
                <h2 className={font.headline2.bold} style={{ color: lightTheme.label.normal }}>
                  후보 스타일
                </h2>
                {savedStyles.map((style, index) => (
                  <article
                    className="flex items-center gap-3 rounded-2xl p-3 shadow-[0_1px_6px_rgba(0,0,0,0.06)]"
                    key={index}
                    style={{ backgroundColor: lightTheme.background.normal }}
                  >
                    {style.image_url && (
                      <img
                        alt=""
                        className="h-20 w-20 shrink-0 rounded-xl object-cover"
                        src={style.image_url}
                      />
                    )}
                    <div className="flex min-w-0 flex-col gap-1">
                      <span
                        className={font.headline2.bold}
                        style={{ color: lightTheme.label.normal }}
                      >
                        {style.style_name}
                      </span>
                      {style.reason && (
                        <span
                          className={font.caption.regular}
                          style={{ color: lightTheme.label.alternative }}
                        >
                          {style.reason}
                        </span>
                      )}
                    </div>
                  </article>
                ))}
              </section>
            )}

            {records.length === 0 && savedStyles.length === 0 && (
              <p
                className={`py-20 text-center ${font.body.regular}`}
                style={{ color: lightTheme.label.assistive }}
              >
                공유된 내용이 없어요
              </p>
            )}

            {data?.share.expires_at && (
              <p
                className={`pt-2 text-center ${font.caption.regular}`}
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
