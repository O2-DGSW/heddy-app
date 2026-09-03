import { font, lightTheme } from "@heddy/design-tokens";

import { arrowIcon } from "@/entities/record";
import { ShareQrModal } from "@/shared";

import { SavedStyleCard } from "../SavedStyleCard";
import { useSavedStyles } from "../../model/useSavedStyles";

const CenteredMessage = ({ children }: { children: string }) => (
  <p
    className={`px-[18px] py-[120px] text-center ${font.body.medium}`}
    style={{ color: lightTheme.label.assistive }}
  >
    {children}
  </p>
);

const SavedStylesPage = () => {
  const {
    savedStyles,
    isPending,
    isError,
    loadErrorMessage,
    shareUrl,
    isSharing,
    actionErrorMessage,
    handleBack,
    handleCloseShareResult,
    handleDelete,
    handleRetryWithAr,
    handleShare,
  } = useSavedStyles();

  return (
    // /profile로 시작하는 경로는 부모 main의 스크롤이 잠겨 있어(PAGE_SCROLL_PATHS) 페이지가 직접 스크롤한다.
    <section
      aria-labelledby="saved-styles-title"
      className="relative flex h-full flex-col overflow-hidden"
      style={{ backgroundColor: lightTheme.background.normal }}
    >
      <header className="relative flex h-[54px] shrink-0 items-center justify-center px-[20px]">
        <button
          aria-label="뒤로 가기"
          className="absolute left-[20px] flex h-[44px] w-[44px] items-center justify-start border-0 bg-transparent p-0"
          onClick={handleBack}
          type="button"
        >
          <img alt="" className="h-[20px] w-[20px]" src={arrowIcon} />
        </button>

        <h1
          className={font.headline1.bold}
          id="saved-styles-title"
          style={{ color: lightTheme.label.neutral }}
        >
          저장한 후보 스타일
        </h1>
      </header>

      <div
        className="min-h-0 flex-1 touch-pan-y overflow-y-auto overscroll-contain no-scrollbar [-webkit-overflow-scrolling:touch]"
        style={{ backgroundColor: lightTheme.fill.normal }}
      >
        <h2
          className={`px-[18px] pb-[12px] pt-[20px] ${font.headline2.bold}`}
          style={{ color: lightTheme.label.neutral }}
        >
          후보
        </h2>

        {actionErrorMessage && (
          <p
            className={`px-[18px] pb-[8px] ${font.caption.regular}`}
            style={{ color: lightTheme.status.error }}
          >
            {actionErrorMessage}
          </p>
        )}

        {isPending && <CenteredMessage>저장한 후보 스타일을 불러오는 중</CenteredMessage>}

        {isError && (
          <CenteredMessage>
            {loadErrorMessage || "저장한 후보 스타일을 불러오지 못했습니다."}
          </CenteredMessage>
        )}

        {!isPending && !isError && savedStyles.length === 0 && (
          <CenteredMessage>저장한 후보 스타일이 없어요</CenteredMessage>
        )}

        {!isPending && !isError && savedStyles.length > 0 && (
          // 하단 패딩은 떠 있는 AR 버튼이 마지막 카드를 가리지 않을 만큼 둔다.
          <div className="grid grid-cols-2 gap-[12px] px-[18px] pb-[110px]">
            {savedStyles.map(style => (
              <SavedStyleCard
                isSharing={isSharing}
                key={style.id}
                onDelete={handleDelete}
                onShare={handleShare}
                style={style}
              />
            ))}
          </div>
        )}
      </div>

      <button
        className={`absolute inset-x-[18px] bottom-[20px] h-[54px] rounded-[14px] ${font.headline2.semiBold}`}
        onClick={handleRetryWithAr}
        style={{
          backgroundColor: lightTheme.primary.normal,
          color: lightTheme.label.buttonText,
        }}
        type="button"
      >
        AR로 다시 체험하기
      </button>

      {/* 공유 링크는 생성 응답에만 들어 있어, 받은 즉시 모달로 띄워 복사할 수 있게 한다 */}
      {shareUrl && (
        <ShareQrModal
          onClose={handleCloseShareResult}
          shareLink={shareUrl}
          title="후보 스타일 공유"
        />
      )}
    </section>
  );
};

export default SavedStylesPage;
