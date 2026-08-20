import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
    navigate(-1);
  };

  return (
    <div className="flex min-h-full flex-col" style={{ backgroundColor: lightTheme.background.normal }}>
      <div className="sticky top-0 z-10 flex h-[58px] items-center justify-center" style={{ backgroundColor: lightTheme.background.normal }}>
        <button
          type="button"
          onClick={handleBack}
          aria-label="뒤로 가기"
          className="absolute left-[14px] flex h-[44px] w-[44px] items-center justify-start border-0 bg-transparent p-0"
        >
          <img alt="" className="h-[20px] w-[20px]" src={arrowIcon} />
        </button>
        <h1 className={font.headline1.bold} style={{ color: lightTheme.label.neutral }}>
          기록 수정
        </h1>
      </div>

      <div className="flex flex-1 flex-col pb-[calc(28px+var(--safe-area-inset-bottom,env(safe-area-inset-bottom,0px)))]" style={{ backgroundColor: lightTheme.fill.normal }}>
        <CutsShareRecordList records={dummyCutsRecords} selectedId={selectedId} onSelect={setSelectedId} />
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
            className={`h-[46px] rounded-xl border border-transparent ${font.headline2.semiBold}`}
            style={{ backgroundColor: lightTheme.primary.normal, color: lightTheme.label.buttonText }}
          >
            공유 링크 생성
          </button>
        </div>
      </div>
    </div>
  );
};
