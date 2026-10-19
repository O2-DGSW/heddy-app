import type { ReactNode } from "react";

import { cn } from "@/shared/lib";

type ModalPlacementType = "center" | "bottom";

interface ModalShellProps {
  /** 제목 요소의 id. 스크린 리더가 대화상자 이름으로 읽는다 */
  labelledBy: string;
  /** center: 가운데 카드, bottom: 아래에서 올라오는 시트 */
  placement: ModalPlacementType;
  /** 주면 바깥(어두운 배경)을 눌러 닫을 수 있다 */
  onBackdropClick?: () => void;
  /** 바깥 닫기 버튼의 접근성 이름 */
  backdropLabel?: string;
  /** 등장 애니메이션 등 바깥 컨테이너에 더할 클래스 */
  className?: string;
  contentClassName?: string;
  children: ReactNode;
}

/** 모달 공통 껍데기. 앱 폭(최대 430px) 안에 어두운 배경을 깔고 내용을 가운데나 아래에 둔다 */
export const ModalShell = ({
  labelledBy,
  placement,
  onBackdropClick,
  backdropLabel = "닫기",
  className,
  contentClassName,
  children,
}: ModalShellProps) => (
  <div
    role="dialog"
    aria-modal="true"
    aria-labelledby={labelledBy}
    className={cn("fixed inset-y-0 left-1/2 z-50 w-full max-w-[430px] -translate-x-1/2", className)}
  >
    {onBackdropClick ? (
      <button
        type="button"
        aria-label={backdropLabel}
        onClick={onBackdropClick}
        className="absolute inset-0 h-full w-full border-0 bg-black/50 p-0"
      />
    ) : (
      <div aria-hidden="true" className="absolute inset-0 bg-black/50" />
    )}

    {placement === "center" ? (
      // 정렬용 레이어가 배경 클릭을 가리지 않도록 내용만 클릭을 받는다
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center px-6">
        <div className="pointer-events-auto flex w-full justify-center">{children}</div>
      </div>
    ) : (
      <div className={cn("absolute inset-x-0 bottom-0", contentClassName)}>{children}</div>
    )}
  </div>
);
