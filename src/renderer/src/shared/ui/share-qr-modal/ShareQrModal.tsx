import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { font, lightTheme } from "@heddy/design-tokens";

import { shareLink } from "@/shared/lib/share";
import { CloseIcon } from "@/shared/ui/icons/CloseIcon";
import { CopyIcon } from "@/shared/ui/icons/CopyIcon";

interface ShareQrModalProps {
  shareUrl: string;
  /** 모달 제목. 화면마다 다르게 부를 수 있게 열어 둔다 */
  title?: string;
  onClose: () => void;
}

export const ShareQrModal = ({ shareUrl, title = "공유", onClose }: ShareQrModalProps) => {
  const [isCopied, setIsCopied] = useState(false);

  /**
   * 공유 링크를 클립보드에 복사한다.
   * clipboard는 보안 컨텍스트에서만 있어, 없거나 실패하면 복사됐다고 알리지 않는다.
   */
  /**
   * 카톡·문자·메모 같은 네이티브 공유 시트를 연다.
   * 시트를 지원하지 않는 환경(데스크톱 브라우저 등)에서는 대신 링크를 복사한다.
   */
  const handleNativeShare = async () => {
    const isShared = await shareLink({
      title,
      text: "헤어 스타일을 공유했어요",
      url: shareUrl,
    });

    if (!isShared) {
      handleCopy();
    }
  };

  const handleCopy = () => {
    navigator.clipboard
      ?.writeText(shareUrl)
      .then(() => setIsCopied(true))
      .catch(() => setIsCopied(false));
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="share-modal-title"
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
          className="flex w-full flex-col gap-6 rounded-lg px-6 py-6"
          style={{ backgroundColor: lightTheme.background.normal }}
        >
          <div className="flex items-center justify-between">
            <h2
              id="share-modal-title"
              className={font.headline1.bold}
              style={{ color: lightTheme.label.neutral }}
            >
              {title}
            </h2>
            <button
              type="button"
              aria-label="공유 닫기"
              onClick={onClose}
              className="flex h-[34px] w-[34px] items-center justify-center rounded-full border-0 p-0"
              style={{ backgroundColor: lightTheme.fill.normal }}
            >
              <CloseIcon />
            </button>
          </div>

          <div className="flex justify-center">
            <QRCodeSVG value={shareUrl} size={200} level="M" />
          </div>

          <button
            type="button"
            onClick={handleNativeShare}
            className={`rounded-xl py-3 text-center ${font.headline2.semiBold}`}
            style={{
              backgroundColor: lightTheme.primary.normal,
              color: lightTheme.label.buttonText,
            }}
          >
            다른 앱으로 공유
          </button>

          <div className="flex flex-col gap-2">
            <span className={font.label.medium} style={{ color: lightTheme.label.assistive }}>
              {isCopied ? "링크를 복사했어요" : "공유 링크"}
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
                {shareUrl}
              </span>
              <CopyIcon />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
