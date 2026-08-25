import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { setDirection } from "@capgo/capacitor-transitions/react";
import { font, lightTheme } from "@heddy/design-tokens";

import { arrowIcon } from "@/entities/record";
import { CutsShareRecordList } from "@/features/cuts/ui/share/CutsShareRecordList";
import { CutsShareItemList } from "@/features/cuts/ui/share/CutsShareItemList";
import { dummyCutsRecords } from "@/features/cuts/constrants/dummyRecords";

export const CutsSharePage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [selectedId, setSelectedId] = useState(id ?? dummyCutsRecords[0]?.id ?? "");

  const handleBack = () => {
    setDirection("back");
    navigate(-1);
  };

  /** 공유 링크를 만들고 선택한 시술기록 상세로 이동해 QR 모달을 띄운다 */
  const handleCreateShareLink = () => {
    setDirection("back");
    navigate(`/cuts/${selectedId}/info`, { state: { isShareModalOpen: true } });
  };

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
          <CutsShareRecordList
            records={dummyCutsRecords}
            selectedId={selectedId}
            onSelect={setSelectedId}
          />
          <CutsShareItemList />

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
              className={`h-[46px] rounded-xl border border-transparent ${font.headline2.semiBold}`}
              style={{
                backgroundColor: lightTheme.primary.normal,
                color: lightTheme.label.buttonText,
              }}
            >
              공유 링크 생성
            </button>
          </div>
        </div>
      </div>
    </cap-page>
  );
};
