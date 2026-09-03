import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { setDirection } from "@capgo/capacitor-transitions/react";
import { font, lightTheme } from "@heddy/design-tokens";

import { arrowIcon } from "@/entities/record";
import { useCreateShare } from "@/entities/share";
import type { ShareFieldType } from "@/entities/share";
import { CutsShareItemList } from "@/features/cuts/ui/share/CutsShareItemList";
import { DEFAULT_CUTS_SHARE_FIELDS } from "@/features/cuts/constrants/shareItems";

export const CutsSharePage = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  // 공유 버튼을 누른 그 기록만 공유한다. 어느 기록인지는 경로가 이미 알려주므로 따로 고르지 않는다.
  const selectedId = id ?? "";

  const [selectedFields, setSelectedFields] = useState<ShareFieldType[]>(DEFAULT_CUTS_SHARE_FIELDS);
  const createShare = useCreateShare();

  const handleToggleField = (field: ShareFieldType) => {
    setSelectedFields(current =>
      current.includes(field) ? current.filter(item => item !== field) : [...current, field]
    );
  };

  const handleBack = () => {
    setDirection("back");
    navigate(-1);
  };

  /** 공유 링크를 만들고, 생성 때만 내려오는 링크를 들고 상세로 이동해 QR 모달을 띄운다 */
  const handleCreateShareLink = () => {
    createShare.mutate(
      { record_ids: [selectedId], fields: selectedFields },
      {
        onSuccess: share => {
          setDirection("back");
          navigate(`/cuts/${selectedId}/info`, {
            state: { isShareModalOpen: true, shareUrl: share.share_url },
          });
        },
      }
    );
  };

  // 서버가 기록·항목 각각 1개 이상을 요구하므로 그 전에는 버튼을 막는다.
  const canCreateShare = Boolean(selectedId) && selectedFields.length > 0 && !createShare.isPending;

  return (
    <cap-page>
      {/* cap-page로 감싸는 전환 애니메이션은 페이지가 자기 높이(h-full) 안에서 직접
        스크롤하는 걸 전제로 한다 (PAGE_SCROLL_PATHS에 "/cuts" 등록됨, <main>이 아님). */}
      <div
        className="flex h-full flex-col overflow-hidden"
        style={{ backgroundColor: lightTheme.background.normal }}
      >
        {/* 헤더는 스크롤 컨테이너(아래 flex-1 div) 밖의 별도 flex 아이템이라 sticky 없이도 고정된다. */}
        <div
          className="flex h-[58px] shrink-0 items-center justify-center"
          style={{ backgroundColor: lightTheme.background.normal }}
        >
          <button
            type="button"
            onClick={handleBack}
            aria-label="뒤로 가기"
            className="absolute left-[14px] flex h-[44px] w-[44px] items-center justify-start border-0 bg-transparent p-0"
          >
            <img alt="" className="h-[20px] w-[20px]" src={arrowIcon} />
          </button>
          <h1 className={font.headline1.bold} style={{ color: lightTheme.label.neutral }}>
            기록 공유
          </h1>
        </div>

        <div
          className="flex flex-1 flex-col overflow-y-auto overscroll-none pb-[calc(28px+var(--safe-area-inset-bottom,env(safe-area-inset-bottom,0px)))] no-scrollbar [-webkit-overflow-scrolling:touch]"
          style={{ backgroundColor: lightTheme.fill.normal }}
        >
          <CutsShareItemList selectedFields={selectedFields} onToggle={handleToggleField} />

          {createShare.isError && (
            <p
              className={`px-4 pt-4 text-center ${font.caption.regular}`}
              style={{ color: lightTheme.status.error }}
            >
              {createShare.error.message}
            </p>
          )}

          <div className="mt-auto grid grid-cols-2 gap-2 px-4 pt-6">
            <button
              type="button"
              onClick={handleBack}
              className={`h-[46px] rounded-xl border ${font.headline2.semiBold}`}
              style={{
                backgroundColor: lightTheme.background.normal,
                borderColor: lightTheme.line.neutral,
                color: lightTheme.label.alternative,
              }}
            >
              취소
            </button>
            <button
              type="button"
              onClick={handleCreateShareLink}
              disabled={!canCreateShare}
              className={`h-[46px] rounded-xl border border-transparent disabled:opacity-60 ${font.headline2.semiBold}`}
              style={{
                backgroundColor: lightTheme.primary.normal,
                color: lightTheme.label.buttonText,
              }}
            >
              {createShare.isPending ? "만드는 중" : "공유 링크 생성"}
            </button>
          </div>
        </div>
      </div>
    </cap-page>
  );
};
