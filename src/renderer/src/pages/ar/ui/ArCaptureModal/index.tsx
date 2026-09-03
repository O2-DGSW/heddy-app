import { font, lightTheme } from "@heddy/design-tokens";

import modalCloseImage from "../../assets/modal-close.png";
import { cn } from "@/shared";

interface ArCaptureModalProps {
  onClose: () => void;
}

const ArCaptureModal = ({ onClose }: ArCaptureModalProps) => (
  <div
    aria-labelledby="capture-modal-title"
    aria-modal="true"
    className="ar-motion-overlay-enter fixed inset-y-0 left-1/2 z-50 flex w-full max-w-[430px] -translate-x-1/2 items-center justify-center bg-black/50"
    role="dialog"
  >
    <div className="-translate-y-[31.5px]">
      <div
        className="ar-motion-modal-enter h-[525px] w-[290px] rounded-[10px] px-[14px] pb-[15px] pt-[15px]"
        style={{ backgroundColor: lightTheme.background.normal }}
      >
        <div className="flex h-[28px] items-start justify-between">
          <h2
            className={font.headline2.semiBold}
            id="capture-modal-title"
            style={{ color: lightTheme.label.neutral }}
          >
            캡쳐 이미지
          </h2>
          <button
            aria-label="캡쳐 이미지 모달 닫기"
            className="ar-motion-press flex h-[28px] w-[28px] items-center justify-center rounded-full"
            onClick={onClose}
            style={{ backgroundColor: lightTheme.fill.normal }}
            type="button"
          >
            <img alt="" className="h-[23px] w-[23px]" src={modalCloseImage} />
          </button>
        </div>

        <div className="mt-[24px]">
          <div
            aria-label="캡쳐 이미지 미리보기"
            className="h-[367px] w-[263px] rounded-[10px]"
            style={{ backgroundColor: lightTheme.label.normal }}
          />
          <p
            className={cn("mt-[10px]", font.caption.medium)}
            style={{ color: lightTheme.label.alternative }}
          >
            ※내 기기에만 저장되고 서버로 올라가지 않아요.
          </p>
        </div>

        <div className="mt-[24px] flex gap-[6px]">
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

export default ArCaptureModal;
