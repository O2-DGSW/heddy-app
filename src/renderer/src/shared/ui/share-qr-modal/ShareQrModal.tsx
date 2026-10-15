import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { font, lightTheme } from "@heddy/design-tokens";

import { shareLink } from "@/shared/lib/share";
import { CloseIcon } from "@/shared/ui/icons/CloseIcon";
import { CopyIcon } from "@/shared/ui/icons/CopyIcon";
import { ModalShell } from "@/shared/ui/modal";
import { ShareIcon } from "@/shared/ui/icons/ShareIcon";

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
    <ModalShell
      labelledBy="share-modal-title"
      placement="center"
      onBackdropClick={onClose}
      backdropLabel="공유 닫기"
    >
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
            style={{ backgroundColor: lightTheme.fill.neutral }}
          >
            <CloseIcon />
          </button>
        </div>

        <div className="flex justify-center">
          <QRCodeSVG value={shareUrl} size={200} level="M" />
        </div>

        <div className="flex flex-col gap-2">
          <span className={font.label.medium} style={{ color: lightTheme.label.assistive }}>
            {isCopied ? "링크를 복사했어요" : "공유 링크"}
          </span>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleCopy}
              aria-label="공유 링크 복사"
              className="flex min-w-0 flex-1 items-center justify-between gap-2 rounded-xl px-5 py-3"
              style={{ backgroundColor: lightTheme.fill.normal }}
            >
              <span
                className={`truncate ${font.label.semiBold}`}
                style={{ color: lightTheme.label.neutral }}
              >
                {shareUrl}
              </span>
              <span className="shrink-0">
                <CopyIcon />
              </span>
            </button>
            <button
              type="button"
              onClick={handleNativeShare}
              aria-label="다른 앱으로 공유"
              className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-full border-0 p-0"
              style={{ backgroundColor: lightTheme.fill.normal }}
            >
              <ShareIcon />
            </button>
          </div>
        </div>
      </div>
    </ModalShell>
  );
};
