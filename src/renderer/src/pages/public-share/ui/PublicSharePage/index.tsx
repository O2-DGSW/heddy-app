import { useParams } from "react-router-dom";
import { font, lightTheme } from "@heddy/design-tokens";

import { formatLongDate } from "@/entities/record";
import { useGetPublicShare } from "@/entities/share";
import agerSad from "@/shared/assets/agerSad.svg";

import SavedStyleSection from "../SavedStyleSection";
import SharedRecordSections from "../SharedRecordSections";

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
                {formatLongDate(data.share.expires_at)}까지 볼 수 있어요
              </p>
            )}
          </>
        )}
      </div>
    </main>
  );
};

export default PublicSharePage;
