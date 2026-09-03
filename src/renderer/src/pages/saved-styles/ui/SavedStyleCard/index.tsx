import { font, lightTheme } from "@heddy/design-tokens";

import type { SavedStyleItem } from "../../model/types";

interface SavedStyleCardProps {
  isSharing: boolean;
  onDelete: (styleId: string) => void;
  onShare: (styleId: string) => void;
  style: SavedStyleItem;
}

export const SavedStyleCard = ({ isSharing, onDelete, onShare, style }: SavedStyleCardProps) => {
  const handleShare = () => {
    onShare(style.id);
  };

  const handleDelete = () => {
    onDelete(style.id);
  };

  return (
    <article
      className="flex flex-col rounded-[14px] p-[10px]"
      style={{ backgroundColor: lightTheme.background.normal }}
    >
      <div
        className="aspect-square w-full overflow-hidden rounded-[10px]"
        style={{ backgroundColor: lightTheme.fill.normal }}
      >
        {style.imageUrl && (
          <img
            alt={`${style.name} 미리보기`}
            className="h-full w-full object-cover"
            src={style.imageUrl}
          />
        )}
      </div>

      <h3
        className={`mt-[10px] truncate ${font.headline2.bold}`}
        style={{ color: lightTheme.label.neutral }}
      >
        {style.name}
      </h3>

      {/* 색을 고르지 않고 저장한 후보도 칩을 그려야 카드 높이와 구성이 서로 어긋나지 않는다 */}
      <div
        className="mt-[8px] flex w-fit items-center gap-[6px] rounded-full border px-[10px] py-[5px]"
        style={{ borderColor: lightTheme.line.neutral }}
      >
        <span
          aria-hidden
          className="h-[12px] w-[12px] shrink-0 rounded-full"
          style={{ backgroundColor: style.colorHex || lightTheme.fill.neutral }}
        />
        <span
          className={`truncate ${font.caption.regular}`}
          style={{ color: lightTheme.label.alternative }}
        >
          {style.colorName || "색상 미지정"}
        </span>
      </div>

      <div className="mt-[10px] grid grid-cols-2 gap-[6px]">
        <button
          className={`h-[34px] rounded-[8px] disabled:opacity-60 ${font.caption.semiBold}`}
          disabled={isSharing}
          onClick={handleShare}
          style={{
            backgroundColor: lightTheme.fill.normal,
            color: lightTheme.label.alternative,
          }}
          type="button"
        >
          공유
        </button>
        <button
          className={`h-[34px] rounded-[8px] ${font.caption.semiBold}`}
          onClick={handleDelete}
          style={{
            backgroundColor: lightTheme.status.error,
            color: lightTheme.label.buttonText,
          }}
          type="button"
        >
          삭제
        </button>
      </div>
    </article>
  );
};
