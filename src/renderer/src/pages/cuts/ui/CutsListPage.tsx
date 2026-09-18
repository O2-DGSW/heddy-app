import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { setDirection } from "@capgo/capacitor-transitions/react";

import { CutsLayout } from "@/features/cuts/ui/CutsLayout.tsx";
import { CutsCategoryFilter } from "@/features/cuts/ui/CutsCategoryFilter";
import { CutsRecordList } from "@/features/cuts/ui/CutsRecordList";
import { CutsAddButton } from "@/features/cuts/ui/CutsAddButton";
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

export const CutsListPage = () => {
  const navigate = useNavigate();
  const [categoryFilter, setCategoryFilter] = useState<CutsCategoryFilterValue>(CUTS_CATEGORIES[0]);

  // 분석 상태 탭을 없애면서 걸러낼 조건이 카테고리 하나만 남았고, 그건 서버가 걸러 준다.
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

  const handleRecordClick = (record: CutsRecord) => {
    setDirection("forward");
    navigate(`/cuts/${record.id}`);
  };

  return (
    <cap-page>
      <CutsLayout
        floatingAction={<CutsAddButton />}
        header={<CutsCategoryFilter selected={categoryFilter} onSelect={setCategoryFilter} />}
      >
        {isPending || isError ? (
          <CutsRecordListStatus errorMessage={error?.message} isError={isError} onRetry={refetch} />
        ) : (
          <>
            <CutsRecordList records={records} onRecordClick={handleRecordClick} />
            <CutsLoadMoreTrigger
              hasNextPage={hasNextPage}
              isFetchingNextPage={isFetchingNextPage}
              onLoadMore={fetchNextPage}
            />
          </>
        )}
      </CutsLayout>
    </cap-page>
  );
};
