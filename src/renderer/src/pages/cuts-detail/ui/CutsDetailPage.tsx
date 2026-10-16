import { useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate, useParams } from "react-router-dom";

import { CutsDetailLayout } from "@/features/cuts";
import { ShareQrModal } from "@/shared";
import {
  formatServiceTypes,
  useGetTreatmentRecord,
  usePrefetchLatestAnalysis,
} from "@/entities/record";

interface ShareModalState {
  isShareModalOpen: boolean;
  shareUrl: string;
}

/** 라우터 state는 어디서든 넣을 수 있는 값이라 모양을 확인하고 쓴다 */
const readShareModalState = (state: unknown): ShareModalState | null => {
  if (typeof state !== "object" || state === null) {
    return null;
  }

  const isShareModalOpen = "isShareModalOpen" in state && state.isShareModalOpen === true;
  const shareUrl = "shareUrl" in state && typeof state.shareUrl === "string" ? state.shareUrl : "";

  return { isShareModalOpen, shareUrl };
};

export const CutsDetailPage = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { data: record } = useGetTreatmentRecord(id);
  const prefetchLatestAnalysis = usePrefetchLatestAnalysis();

  // 공유 화면에서 링크를 생성하고 넘어온 경우에만 모달을 띄운다.
  // 공유 링크는 생성 응답으로만 내려오므로 다시 조회할 수 없어, 넘어올 때 함께 받아 들고 있는다.
  const shareState = readShareModalState(location.state);
  const [isShareModalOpen, setIsShareModalOpen] = useState(Boolean(shareState?.isShareModalOpen));
  const [shareUrl] = useState(shareState?.shareUrl ?? "");

  /** 모달을 닫고, 뒤로가기나 새로고침 때 다시 열리지 않도록 라우터 state를 비운다 */
  const handleCloseShareModal = () => {
    setIsShareModalOpen(false);
    navigate(location.pathname, { replace: true, state: null });
  };

  // 정보 탭을 보는 동안 분석 결과를 미리 받아, 분석완료 탭으로 넘어가자마자 결과가 보이게 한다
  useEffect(() => {
    if (id) {
      prefetchLatestAnalysis(id);
    }
  }, [id, prefetchLatestAnalysis]);

  return (
    <cap-page>
      <CutsDetailLayout
        title={(record ? formatServiceTypes(record.service_types) : null) ?? "시술기록"}
      >
        <Outlet />

        {isShareModalOpen && shareUrl && (
          <ShareQrModal shareUrl={shareUrl} onClose={handleCloseShareModal} />
        )}
      </CutsDetailLayout>
    </cap-page>
  );
};
