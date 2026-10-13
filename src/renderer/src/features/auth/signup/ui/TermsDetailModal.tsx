import { font, lightTheme } from "@heddy/design-tokens";

import type { LegalTermsContent } from "@/features/auth/signup/constants/legalTermsContent";
import { ModalShell } from "@/shared";
import { CloseIcon } from "@/shared/ui/icons/CloseIcon";

interface TermsDetailModalProps {
  content: LegalTermsContent;
  onClose: () => void;
}

export const TermsDetailModal = ({ content, onClose }: TermsDetailModalProps) => {
  return (
    <ModalShell
      labelledBy="terms-detail-title"
      placement="bottom"
      onBackdropClick={onClose}
      backdropLabel="약관 상세 닫기"
    >
      <div
        className="flex max-h-[80vh] flex-col overflow-hidden rounded-t-2xl px-6 pt-6 pb-8"
        style={{ backgroundColor: lightTheme.background.normal }}
      >
        <div className="flex shrink-0 items-center justify-between pb-4">
          <h2
            id="terms-detail-title"
            className={font.headline1.bold}
            style={{ color: lightTheme.label.neutral }}
          >
            {content.title}
          </h2>
          <button
            type="button"
            aria-label="약관 상세 닫기"
            onClick={onClose}
            className="flex h-[34px] w-[34px] items-center justify-center rounded-full border-0 p-0"
            style={{ backgroundColor: lightTheme.fill.normal }}
          >
            <CloseIcon />
          </button>
        </div>

        <p
          className={`shrink-0 pb-4 ${font.caption.regular}`}
          style={{ color: lightTheme.label.assistive }}
        >
          최종 업데이트 {content.updatedAt}
        </p>

        <div className="min-h-0 flex-1 touch-pan-y overflow-y-auto overscroll-contain no-scrollbar [-webkit-overflow-scrolling:touch]">
          <div className="flex flex-col gap-5 pb-2">
            {content.sections.map(section => (
              <section key={section.heading}>
                <h3
                  className={`pb-1.5 ${font.label.semiBold}`}
                  style={{ color: lightTheme.label.neutral }}
                >
                  {section.heading}
                </h3>
                <p
                  className={`whitespace-pre-line ${font.body.regular}`}
                  style={{ color: lightTheme.label.assistive }}
                >
                  {section.body}
                </p>
              </section>
            ))}
          </div>
        </div>
      </div>
    </ModalShell>
  );
};
