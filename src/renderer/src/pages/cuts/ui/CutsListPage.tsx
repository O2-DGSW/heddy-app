import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { setDirection } from "@capgo/capacitor-transitions/react";

import { CutsLayout } from "@/features/cuts/ui/CutsLayout.tsx";
import { CutsTabBar } from "@/features/cuts/ui/CutsTabBar";
import { CutsCategoryFilter } from "@/features/cuts/ui/CutsCategoryFilter";
import { CutsRecordList } from "@/features/cuts/ui/CutsRecordList";
import { CutsAddButton } from "@/features/cuts/ui/CutsAddButton";
import { CUTS_TABS, type CutsStatusFilter } from "@/features/cuts/constrants/tabs";
import {
  CUTS_CATEGORIES,
  isCutsCategory,
  type CutsCategoryFilterValue,
} from "@/features/cuts/constrants/categories";
import { useCutsRecords } from "@/features/cuts/model/hooks/useCutsRecords";
import { CutsRecordListStatus } from "@/features/cuts/ui/CutsRecordListStatus";
import type { CutsRecord } from "@/features/cuts/model/types/CutsRecord.types";

const matchesStatusFilter = (record: CutsRecord, statusFilter: CutsStatusFilter) => {
  if (statusFilter === "전체") {
    return true;
  }

  if (statusFilter === "분석됨") {
    return record.analysisStatus === "분석 완료";
  }

  return record.analysisStatus === "분석 중" || record.analysisStatus === "재촬영";
};

export const CutsListPage = () => {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState<CutsStatusFilter>(CUTS_TABS[0].label);
  const [categoryFilter, setCategoryFilter] = useState<CutsCategoryFilterValue>(CUTS_CATEGORIES[0]);

  const { records, isPending, isError, error, refetch } = useCutsRecords();

  // 서버는 첫 페이지만 내려주고, 탭·카테고리 필터는 받아온 목록에서 걸러 보여준다.
  const filteredRecords = useMemo(
    () =>
      records.filter(record => {
        const matchesCategory =
          !isCutsCategory(categoryFilter) || record.category === categoryFilter;

        return matchesCategory && matchesStatusFilter(record, statusFilter);
      }),
    [records, statusFilter, categoryFilter]
  );

  const handleRecordClick = (record: CutsRecord) => {
    setDirection("forward");
    navigate(`/cuts/${record.id}`);
  };

  return (
    <cap-page>
      <CutsLayout
        header={
          <>
            <CutsTabBar selected={statusFilter} onSelect={setStatusFilter} />
            <CutsCategoryFilter selected={categoryFilter} onSelect={setCategoryFilter} />
          </>
        }
      >
        {isPending || isError ? (
          <CutsRecordListStatus errorMessage={error?.message} isError={isError} onRetry={refetch} />
        ) : (
          <CutsRecordList records={filteredRecords} onRecordClick={handleRecordClick} />
        )}
        <CutsAddButton />
      </CutsLayout>
    </cap-page>
  );
};
