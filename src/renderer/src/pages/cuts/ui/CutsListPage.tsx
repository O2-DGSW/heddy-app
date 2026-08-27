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
import { dummyCutsRecords } from "@/features/cuts/constrants/dummyRecords";
import { useHorizontalSwipe } from "@/shared";
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

  const filteredRecords = useMemo(
    () =>
      dummyCutsRecords.filter(record => {
        const matchesCategory =
          !isCutsCategory(categoryFilter) || record.category === categoryFilter;

        return matchesCategory && matchesStatusFilter(record, statusFilter);
      }),
    [statusFilter, categoryFilter]
  );

  const handleRecordClick = (record: CutsRecord) => {
    setDirection("forward");
    navigate(`/cuts/${record.id}`);
  };

  /** 좌우 스와이프로 상태 탭을 넘긴다 (양 끝에서는 더 넘어가지 않는다) */
  const moveTab = (offset: number) => {
    const nextIndex = CUTS_TABS.findIndex(({ label }) => label === statusFilter) + offset;

    if (nextIndex < 0 || nextIndex >= CUTS_TABS.length) {
      return;
    }

    setStatusFilter(CUTS_TABS[nextIndex].label);
  };

  const contentSwipeProps = useHorizontalSwipe({
    onSwipeLeft: () => moveTab(1),
    onSwipeRight: () => moveTab(-1),
  });

  return (
    <cap-page>
      <CutsLayout
        contentSwipeProps={contentSwipeProps}
        header={
          <>
            <CutsTabBar selected={statusFilter} onSelect={setStatusFilter} />
            <CutsCategoryFilter selected={categoryFilter} onSelect={setCategoryFilter} />
          </>
        }
      >
        <CutsRecordList records={filteredRecords} onRecordClick={handleRecordClick} />
        <CutsAddButton />
      </CutsLayout>
    </cap-page>
  );
};
