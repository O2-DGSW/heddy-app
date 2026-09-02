import { useState } from "react";
import { Outlet, useLocation, useNavigate, useParams } from "react-router-dom";

import { CutsDetailLayout } from "@/features/cuts/ui/CutsDetailLayout";
import { CutsShareQrModal } from "@/features/cuts/ui/share/CutsShareQrModal";
import { useGetTreatmentRecord, type ServiceType } from "@/entities/record";

const SERVICE_TYPE_LABEL: Record<ServiceType, string> = {
  CUT: "커트",
  PERM: "펌",
  COLOR: "염색",
  BLEACH: "탈색",
  CLINIC: "클리닉",
  STYLING: "스타일링",
  OTHER: "기타",
};

export const CutsDetailPage = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { data: record } = useGetTreatmentRecord(id);

  // 공유 화면에서 링크를 생성하고 넘어온 경우에만 모달을 띄운다.
  // 공유 링크는 생성 응답으로만 내려오므로 다시 조회할 수 없어, 넘어올 때 함께 받아 들고 있는다.
  const shareState = location.state as
    { isShareModalOpen?: boolean; shareUrl?: string } | null | undefined;
  const [isShareModalOpen, setIsShareModalOpen] = useState(Boolean(shareState?.isShareModalOpen));
  const [shareUrl] = useState(shareState?.shareUrl ?? "");

  /** 모달을 닫고, 뒤로가기나 새로고침 때 다시 열리지 않도록 라우터 state를 비운다 */
  const handleCloseShareModal = () => {
    setIsShareModalOpen(false);
    navigate(location.pathname, { replace: true, state: null });
  };

  return (
    <cap-page>
      <CutsDetailLayout
        title={
          record?.service_types.map(serviceType => SERVICE_TYPE_LABEL[serviceType]).join(" · ") ??
          "시술기록"
        }
      >
        <Outlet />

        {isShareModalOpen && shareUrl && (
          <CutsShareQrModal shareLink={shareUrl} onClose={handleCloseShareModal} />
        )}
      </CutsDetailLayout>
    </cap-page>
  );
};
