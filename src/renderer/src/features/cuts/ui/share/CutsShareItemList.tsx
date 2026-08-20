import { useState } from "react";
import { font, lightTheme } from "@heddy/design-tokens";

import { CutsShareItemToggle } from "@/features/cuts/ui/share/CutsShareItemToggle";
import { CUTS_SHARE_ITEMS } from "@/features/cuts/constrants/shareItems";

export const CutsShareItemList = () => {
  const [enabledIds, setEnabledIds] = useState<string[]>(
    CUTS_SHARE_ITEMS.filter(item => item.defaultEnabled).map(item => item.id)
  );

  const handleToggle = (itemId: string) => {
    setEnabledIds(current =>
      current.includes(itemId) ? current.filter(id => id !== itemId) : [...current, itemId]
    );
  };

  return (
    <section className="flex flex-col gap-4 px-4 pt-6">
      <h2 className={font.headline2.bold} style={{ color: lightTheme.label.neutral }}>
        공유 항목
      </h2>

      <div className="flex flex-col divide-y" style={{ borderColor: lightTheme.line.alternative }}>
        {CUTS_SHARE_ITEMS.map(item => (
          <div key={item.id} className="flex items-center justify-between py-4">
            <span className={font.body.medium} style={{ color: lightTheme.label.neutral }}>
              {item.label}
            </span>
            <CutsShareItemToggle
              label={item.label}
              checked={enabledIds.includes(item.id)}
              onToggle={() => handleToggle(item.id)}
            />
          </div>
        ))}
      </div>
    </section>
  );
};
