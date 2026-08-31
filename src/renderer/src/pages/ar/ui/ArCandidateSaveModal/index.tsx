import { font, lightTheme } from "@heddy/design-tokens";
import type { CSSProperties } from "react";

import modalCloseImage from "../../assets/modal-close.png";
import { cn } from "@/shared";

interface ArCandidateSaveModalProps {
  memo: string;
  onClose: () => void;
  setMemo: (memo: string) => void;
}

type PlaceholderStyle = CSSProperties & {
  "--placeholder-color": string;
};

const CANDIDATE_MEMO_STYLE = {
  "--placeholder-color": lightTheme.line.normal,
  backgroundColor: lightTheme.background.neutral,
  color: lightTheme.label.neutral,
} satisfies PlaceholderStyle;

const ArCandidateSaveModal = ({ memo, onClose, setMemo }: ArCandidateSaveModalProps) => (
  <div
    aria-labelledby="candidate-save-modal-title"
    aria-modal="true"
    className="ar-motion-overlay-enter fixed inset-y-0 left-1/2 z-50 flex w-full max-w-[430px] -translate-x-1/2 items-center justify-center bg-black/50"
    role="dialog"
  >
    <div className="translate-y-[11.5px]">
      <div
        className="ar-motion-modal-enter w-[290px] rounded-[10px] px-[14px] pb-[14px] pt-[15px]"
        style={{ backgroundColor: lightTheme.background.normal }}
      >
        <div className="flex h-[28px] items-start justify-between">
          <h2
            className={font.headline2.semiBold}
            id="candidate-save-modal-title"
            style={{ color: lightTheme.label.neutral }}
          >
            후보 스타일 저장
          </h2>
          <button
            aria-label="후보 스타일 저장 모달 닫기"
            className="ar-motion-press flex h-[28px] w-[28px] items-center justify-center rounded-full"
            onClick={onClose}
            style={{ backgroundColor: lightTheme.fill.normal }}
            type="button"
          >
            <img alt="" className="h-[23px] w-[23px]" src={modalCloseImage} />
          </button>
        </div>

        <label className="mt-[14px] flex flex-col gap-[10px]">
          <span className={font.label.semiBold} style={{ color: lightTheme.label.alternative }}>
            메모
          </span>
          <textarea
            className={cn(
              "h-[86px] resize-none rounded-[15px] px-[12px] py-[9px] outline-none",
              "placeholder:text-[var(--placeholder-color)]",
              font.caption.medium
            )}
            onChange={event => setMemo(event.target.value)}
            placeholder="(선택) 메모 내용을 입력해 주세요."
            style={CANDIDATE_MEMO_STYLE}
            value={memo}
          />
        </label>

        <div className="mt-[16px] flex gap-[6px]">
          <button
            className={cn(
              "ar-motion-press h-[26px] w-[128px] rounded-[5px] border",
              font.label.medium
            )}
            onClick={onClose}
            style={{
              backgroundColor: lightTheme.label.buttonText,
              borderColor: lightTheme.fill.neutral,
              color: lightTheme.label.alternative,
            }}
            type="button"
          >
            취소
          </button>
          <button
            className={cn("ar-motion-press h-[26px] w-[128px] rounded-[5px]", font.label.medium)}
            onClick={onClose}
            style={{
              backgroundColor: lightTheme.primary.normal,
              color: lightTheme.label.buttonText,
            }}
            type="button"
          >
            저장
          </button>
        </div>
      </div>
    </div>
  </div>
);

export default ArCandidateSaveModal;
