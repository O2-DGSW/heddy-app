import { font, lightTheme } from "@heddy/design-tokens";

import { CutsShareItemToggle } from "@/features/cuts/ui/share/CutsShareItemToggle";
import { CUTS_SHARE_ITEMS } from "@/features/cuts/constrants/shareItems";
import type { ShareFieldType } from "@/entities/share";

interface CutsShareItemListProps {
  /** 선택한 노출 항목. 그대로 공유 생성 요청의 fields로 나간다 */
  selectedFields: ShareFieldType[];
  onToggle: (field: ShareFieldType) => void;
}

export const CutsShareItemList = ({ selectedFields, onToggle }: CutsShareItemListProps) => {
  return (
    <section className="flex flex-col gap-4 px-4 pt-6">
      <h2 className={font.headline2.bold} style={{ color: lightTheme.label.neutral }}>
        공유 항목
      </h2>

      <div className="flex flex-col">
        {CUTS_SHARE_ITEMS.map((item, index) => (
          <div
            key={item.id}
            className="flex items-center justify-between py-4"
            style={index > 0 ? { borderTop: `1px solid ${lightTheme.label.disable}` } : undefined}
          >
            <span className={font.body.medium} style={{ color: lightTheme.label.neutral }}>
              {item.label}
            </span>
            <CutsShareItemToggle
              label={item.label}
              checked={selectedFields.includes(item.id)}
              onToggle={() => onToggle(item.id)}
            />
          </div>
        ))}
      </div>
    </section>
  );
};
