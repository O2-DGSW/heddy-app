import { font, lightTheme, palette } from "@heddy/design-tokens";

import type { ShortcutCardProps } from "@/pages/home/model/types.ts";

const ShortcutCard = ({ card, onClick }: ShortcutCardProps) => {
  return (
    <button
      type="button"
      className="relative overflow-hidden rounded-[10px] p-0 text-left active:scale-[0.99]"
      style={{ backgroundColor: palette.main[90] }}
      onClick={onClick}
    >
      <span className="absolute left-[12.5px] top-[18px] flex flex-col gap-1">
        <span className={font.caption.medium} style={{ color: lightTheme.primary.normal }}>
          {card.eyebrow}
        </span>
        <span className={font.headline2.semiBold} style={{ color: lightTheme.label.alternative }}>
          {card.title}
        </span>
      </span>
      <img
        src={card.imageSrc}
        alt={card.imageAlt}
        className={`pointer-events-none absolute object-contain ${card.imageClassName}`}
      />
    </button>
  );
};

export default ShortcutCard;
