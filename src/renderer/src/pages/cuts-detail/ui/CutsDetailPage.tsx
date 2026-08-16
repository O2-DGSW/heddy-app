import { Outlet, useParams } from "react-router-dom";

import { CutsDetailLayout } from "@/features/cuts/ui/CutsDetailLayout";
import { dummyCutsRecords } from "@/features/cuts/constrants/dummyRecords";

export const CutsDetailPage = () => {
  const { id } = useParams();
  const record = dummyCutsRecords.find(record => record.id === id);

  return (
    <CutsDetailLayout title={record?.procedureName ?? "시술기록"}>
      <Outlet />
    </CutsDetailLayout>
  );
};
