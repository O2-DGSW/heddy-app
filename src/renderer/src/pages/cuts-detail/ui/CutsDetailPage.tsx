import { useState } from "react";
import { Outlet, useLocation, useNavigate, useParams } from "react-router-dom";

import { CutsDetailLayout } from "@/features/cuts/ui/CutsDetailLayout";
import { CutsShareQrModal } from "@/features/cuts/ui/share/CutsShareQrModal";
import { dummyCutsRecords } from "@/features/cuts/constrants/dummyRecords";
import { DEFAULT_SHARE_LINK, dummyShareLinks } from "@/features/cuts/constrants/dummyShareLinks";

export const CutsDetailPage = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const record = dummyCutsRecords.find(record => record.id === id);

  // 공유 화면에서 링크를 생성하고 넘어온 경우에만 모달을 띄운다.
  const [isShareModalOpen, setIsShareModalOpen] = useState(
    Boolean((location.state as { isShareModalOpen?: boolean } | null)?.isShareModalOpen)
  );

  /** 모달을 닫고, 뒤로가기나 새로고침 때 다시 열리지 않도록 라우터 state를 비운다 */
  const handleCloseShareModal = () => {
    setIsShareModalOpen(false);
    navigate(location.pathname, { replace: true, state: null });
  };

  return (
    <CutsDetailLayout title={record?.procedureName ?? "시술기록"}>
      <Outlet />

      {isShareModalOpen && (
        <CutsShareQrModal
          shareLink={(id && dummyShareLinks[id]) || DEFAULT_SHARE_LINK}
          onClose={handleCloseShareModal}
        />
      )}
    </CutsDetailLayout>
  );
};
