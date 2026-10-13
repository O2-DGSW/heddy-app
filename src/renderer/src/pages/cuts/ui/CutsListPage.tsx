import { useState } from "react";
import { lightTheme } from "@heddy/design-tokens";
import { useNavigate } from "react-router-dom";
import { setDirection } from "@capgo/capacitor-transitions/react";

import { CutsLayout } from "@/features/cuts";
import { CutsCategoryFilter } from "@/features/cuts";
import { CutsViewModeToggle } from "@/features/cuts";
import { CutsRecordList } from "@/features/cuts";
import { CutsAddButton } from "@/features/cuts";
import { CUTS_CATEGORIES, isCutsCategory, type CutsCategoryFilterValue } from "@/features/cuts";
import { useCutsRecords } from "@/features/cuts";
import { SERVICE_TYPE_BY_CATEGORY } from "@/features/cuts";
import { CutsRecordListStatus } from "@/features/cuts";
import { CutsLoadMoreTrigger } from "@/features/cuts";
import type { CutsRecord } from "@/features/cuts";
import type { CutsViewMode } from "@/features/cuts";

export const CutsListPage = () => {
  const navigate = useNavigate();
  const [categoryFilter, setCategoryFilter] = useState<CutsCategoryFilterValue>(CUTS_CATEGORIES[0]);
  const [viewMode, setViewMode] = useState<CutsViewMode>("list");

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
        header={
          // 카테고리 줄에 나란히 두어 목록이 쓸 세로 공간을 더 뺏지 않는다.
          // 카테고리는 가로로 넘치면 스크롤되고, 보기 버튼은 항상 오른쪽에 붙어 있어야 한다.
          <div className="flex items-center" style={{ backgroundColor: lightTheme.fill.normal }}>
            <CutsCategoryFilter selected={categoryFilter} onSelect={setCategoryFilter} />
            <CutsViewModeToggle selected={viewMode} onSelect={setViewMode} />
          </div>
        }
      >
        {isPending || isError ? (
          <CutsRecordListStatus errorMessage={error?.message} isError={isError} onRetry={refetch} />
        ) : (
          <>
            <CutsRecordList
              onRecordClick={handleRecordClick}
              records={records}
              viewMode={viewMode}
            />
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
