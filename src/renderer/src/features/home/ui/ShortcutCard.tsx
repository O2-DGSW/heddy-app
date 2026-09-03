import { font, lightTheme, palette } from "@heddy/design-tokens";

import type { ShortcutCardProps } from "@/pages/home/model/types.ts";

const ShortcutCard = ({ card, onClick }: ShortcutCardProps) => {
  return (
    <button
      type="button"
      className="relative min-h-0 overflow-hidden rounded-[10px] p-0 text-left active:scale-[0.99]"
      style={{ backgroundColor: palette.main[90] }}
      onClick={onClick}
    >
      <span className="absolute left-[clamp(10px,3.1vw,12.5px)] right-[clamp(48px,15vw,78px)] top-[clamp(12px,2.2svh,18px)] flex min-w-0 flex-col gap-1">
        <span
          className={`${font.caption.medium} truncate`}
          style={{ color: lightTheme.primary.normal }}
        >
          {card.eyebrow}
        </span>
        <span
          className={`${font.headline2.semiBold} truncate`}
          style={{ color: lightTheme.label.alternative }}
        >
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
