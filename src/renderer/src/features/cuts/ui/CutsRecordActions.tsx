import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { setDirection } from "@capgo/capacitor-transitions/react";
import { font, lightTheme } from "@heddy/design-tokens";

import { useDeleteTreatmentRecord } from "@/entities/record";
import { cn, ConfirmModal, showErrorToast } from "@/shared";

interface CutsRecordActionsProps {
  /** 탭마다 배치가 달라 바깥 여백만 호출부에서 받는다 */
  className?: string;
}

/** 시술기록 정보·분석완료 탭이 함께 쓰는 수정/공유/삭제 버튼 줄 */
export const CutsRecordActions = ({ className }: CutsRecordActionsProps) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const deleteRecord = useDeleteTreatmentRecord();
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  const handleEditClick = () => {
    setDirection("forward");
    navigate("../edit");
  };

  const handleShareClick = () => {
    setDirection("forward");
    navigate("../share");
  };

  /** 삭제는 되돌릴 수 없어 한 번 되묻는다 */
  const handleDeleteClick = () => {
    setIsDeleteConfirmOpen(true);
  };

  const handleDeleteCancel = () => {
    setIsDeleteConfirmOpen(false);
  };

  /** 지운 뒤에는 없는 화면에 남지 않도록 목록으로 보낸다 */
  const handleDeleteConfirm = () => {
    if (!id) {
      return;
    }

    deleteRecord.mutate(id, {
      onSuccess: () => {
        setDirection("back");
        navigate("/cuts", { replace: true });
      },
      onError: error => {
        setIsDeleteConfirmOpen(false);
        showErrorToast(error.message || "시술기록을 삭제하지 못했습니다. 다시 시도해주세요.");
      },
    });
  };

  return (
    <div className={cn("flex gap-2", className)}>
      <button
        type="button"
        onClick={handleEditClick}
        className={`flex-1 rounded-xl py-3 text-center ${font.label.semiBold}`}
        style={{ border: `1px solid ${lightTheme.line.neutral}`, color: lightTheme.label.neutral }}
      >
        수정
      </button>
      <button
        type="button"
        onClick={handleShareClick}
        className={`flex-1 rounded-xl py-3 text-center ${font.label.semiBold}`}
        style={{ border: `1px solid ${lightTheme.line.neutral}`, color: lightTheme.label.neutral }}
      >
        공유
      </button>
      <button
        type="button"
        onClick={handleDeleteClick}
        disabled={deleteRecord.isPending}
        className={`flex-1 rounded-xl py-3 text-center disabled:opacity-60 ${font.label.semiBold}`}
        style={{ backgroundColor: lightTheme.status.error, color: lightTheme.background.normal }}
      >
        {deleteRecord.isPending ? "삭제 중" : "삭제"}
      </button>

      {isDeleteConfirmOpen && (
        <ConfirmModal
          confirmLabel={deleteRecord.isPending ? "삭제 중" : "삭제"}
          description="삭제한 시술기록은 되돌릴 수 없어요."
          isPending={deleteRecord.isPending}
          onCancel={handleDeleteCancel}
          onConfirm={handleDeleteConfirm}
          title="이 시술기록을 삭제할까요?"
          tone="danger"
        />
      )}
    </div>
  );
};
