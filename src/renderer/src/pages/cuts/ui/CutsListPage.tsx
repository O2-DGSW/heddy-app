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
import { SERVICE_TYPE_BY_CATEGORY } from "@/features/cuts/model/mapTreatmentRecord";
import { CutsRecordListStatus } from "@/features/cuts/ui/CutsRecordListStatus";
import { CutsLoadMoreTrigger } from "@/features/cuts/ui/CutsLoadMoreTrigger";
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

  // 카테고리는 서버가 걸러 주고, 분석 상태는 조회 조건이 없어 받아온 목록에서 거른다.
  const {
    records,
    isPending,
    isError,
    error,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useCutsRecords({
    serviceType: isCutsCategory(categoryFilter)
      ? SERVICE_TYPE_BY_CATEGORY[categoryFilter]
      : undefined,
  });

  const filteredRecords = useMemo(
    () => records.filter(record => matchesStatusFilter(record, statusFilter)),
    [records, statusFilter]
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
          <>
            <CutsRecordList records={filteredRecords} onRecordClick={handleRecordClick} />
            <CutsLoadMoreTrigger
              hasNextPage={hasNextPage}
              isFetchingNextPage={isFetchingNextPage}
              onLoadMore={fetchNextPage}
            />
          </>
        )}
        <CutsAddButton />
      </CutsLayout>
    </cap-page>
  );
};
