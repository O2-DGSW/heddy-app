import { useState } from "react";

import { CutsLayout } from "@/features/cuts/ui/CutsLayout.tsx";
import { CutsTabBar } from "@/features/cuts/ui/CutsTabBar";
import { CUTS_TABS, type CutsStatusFilter } from "@/features/cuts/constrants/tabs";

export const CutsListPage = () => {
  const [filter, setFilter] = useState<CutsStatusFilter>(CUTS_TABS[0].label);

  return (
    <CutsLayout>
      <CutsTabBar selected={filter} onSelect={setFilter} />
    </CutsLayout>
  );
};
