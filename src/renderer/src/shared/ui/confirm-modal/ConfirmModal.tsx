import { font, lightTheme } from "@heddy/design-tokens";
import { useId } from "react";

import { cn } from "@/shared/lib";

import { ModalShell } from "../modal";

type ConfirmToneType = "primary" | "danger";

interface ConfirmModalProps {
  title: string;
  description?: string;
  confirmLabel: string;
  cancelLabel?: string;
  /** danger: 삭제·버리기처럼 되돌릴 수 없는 동작 */
  tone?: ConfirmToneType;
  isPending?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const CONFIRM_BACKGROUND_BY_TONE: Record<ConfirmToneType, string> = {
  primary: lightTheme.primary.normal,
  danger: lightTheme.status.error,
};

/** window.confirm 대신 쓰는 앱 스타일 확인 창. 바깥을 누르면 취소로 본다 */
export const ConfirmModal = ({
  title,
  description,
  confirmLabel,
  cancelLabel = "취소",
  tone = "primary",
  isPending = false,
  onConfirm,
  onCancel,
}: ConfirmModalProps) => {
  const titleId = useId();

  return (
    <ModalShell
      backdropLabel={cancelLabel}
      labelledBy={titleId}
      onBackdropClick={isPending ? undefined : onCancel}
      placement="center"
    >
      <div
        aria-busy={isPending}
        className="w-full rounded-[15px] px-[20px] pb-[20px] pt-[22px]"
        style={{ backgroundColor: lightTheme.background.normal }}
      >
        <h2
          className={font.headline1.bold}
          id={titleId}
          style={{ color: lightTheme.label.neutral }}
        >
          {title}
        </h2>
        {description && (
          <p
            className={cn("mt-[10px] whitespace-pre-line", font.label.regular)}
            style={{ color: lightTheme.label.alternative }}
          >
            {description}
          </p>
        )}

        <div className="mt-[24px] grid grid-cols-2 gap-[7px]">
          <button
            className={cn("h-[42px] rounded-[10px] border", font.headline2.semiBold)}
            disabled={isPending}
            onClick={onCancel}
            style={{
              backgroundColor: lightTheme.background.alternative,
              borderColor: lightTheme.fill.neutral,
              color: lightTheme.label.alternative,
            }}
            type="button"
          >
            {cancelLabel}
          </button>
          <button
            className={cn("h-[42px] rounded-[10px] border-0", font.headline2.semiBold)}
            disabled={isPending}
            onClick={onConfirm}
            style={{
              backgroundColor: CONFIRM_BACKGROUND_BY_TONE[tone],
              color: lightTheme.label.buttonText,
            }}
            type="button"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </ModalShell>
  );
};
