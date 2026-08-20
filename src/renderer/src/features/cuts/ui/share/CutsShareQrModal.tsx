import { QRCodeSVG } from "qrcode.react";
import { font, lightTheme } from "@heddy/design-tokens";

import { CutsCloseIcon } from "@/features/cuts/ui/icons/CutsCloseIcon";
import { CutsCopyIcon } from "@/features/cuts/ui/icons/CutsCopyIcon";

interface CutsShareQrModalProps {
  shareLink: string;
  onClose: () => void;
}

export const CutsShareQrModal = ({ shareLink, onClose }: CutsShareQrModalProps) => {
  /** 공유 링크를 클립보드에 복사한다 */
  const handleCopy = () => {
    void navigator.clipboard?.writeText(shareLink);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="cuts-share-modal-title"
      className="fixed inset-y-0 left-1/2 z-50 w-full max-w-[430px] -translate-x-1/2"
    >
      <button
        type="button"
        aria-label="공유 닫기"
        onClick={onClose}
        className="absolute inset-0 h-full w-full border-0 p-0"
        style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      />

      <div className="absolute inset-0 flex items-center justify-center px-6">
        <div
          className="flex w-full flex-col gap-6 rounded-3xl px-6 py-6"
          style={{ backgroundColor: lightTheme.background.normal }}
        >
          <div className="flex items-center justify-between">
            <h2
              id="cuts-share-modal-title"
              className={font.headline1.bold}
              style={{ color: lightTheme.label.neutral }}
            >
              공유
            </h2>
            <button
              type="button"
              aria-label="공유 닫기"
              onClick={onClose}
              className="flex h-[34px] w-[34px] items-center justify-center rounded-full border-0 p-0"
              style={{ backgroundColor: lightTheme.fill.normal }}
            >
              <CutsCloseIcon />
            </button>
          </div>

          <div className="flex justify-center">
            <QRCodeSVG value={shareLink} size={200} level="M" />
          </div>

          <div className="flex flex-col gap-2">
            <span className={font.label.medium} style={{ color: lightTheme.label.assistive }}>
              공유 링크
            </span>
            <button
              type="button"
              onClick={handleCopy}
              aria-label="공유 링크 복사"
              className="flex items-center justify-center gap-2 rounded-xl px-4 py-3"
              style={{ backgroundColor: lightTheme.fill.normal }}
            >
              <span
                className={`truncate ${font.body.regular}`}
                style={{ color: lightTheme.label.neutral }}
              >
                {shareLink}
              </span>
              <CutsCopyIcon />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
