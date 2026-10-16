import { font, lightTheme } from "@heddy/design-tokens";
import { useId } from "react";

import type { ArHairstyleOption, HairstyleOptionId } from "@/entities/ar-groom";
import { cn, ModalShell } from "@/shared";

import { useArHairstyleFilters } from "../../model/useArHairstyleFilters";
import ArHairstyleViews from "./ArHairstyleViews";
import ArHairstyleFilterGroup from "./ArHairstyleFilterGroup";
import ArHairstyleCard from "./ArHairstyleCard";

interface ArHairstyleBrowserProps {
  activeHairstyleName: HairstyleOptionId;
  disabled: boolean;
  hairstyleOptions: ArHairstyleOption[];
  onClose: () => void;
  onDisabledSelect: () => void;
  onSelect: (hairstyleName: HairstyleOptionId) => void;
}

const ArHairstyleBrowser = ({
  activeHairstyleName,
  disabled,
  hairstyleOptions,
  onClose,
  onDisabledSelect,
  onSelect,
}: ArHairstyleBrowserProps) => {
  const titleId = useId();
  const { filterGroups, filteredOptions, hasActiveFilters, handleFilterReset } =
    useArHairstyleFilters(hairstyleOptions);
  const activeHairstyle = hairstyleOptions.find(option => option.name === activeHairstyleName);

  const handleHairstyleSelect = (hairstyleName: HairstyleOptionId) => {
    if (disabled) {
      onDisabledSelect();
      return;
    }

    onSelect(hairstyleName);
  };

  return (
    <ModalShell
      backdropLabel="헤어스타일 목록 닫기"
      className="ar-motion-overlay-enter"
      labelledBy={titleId}
      onBackdropClick={onClose}
      placement="bottom"
    >
      <section
        className="ar-motion-modal-enter max-h-[86dvh] overflow-y-auto rounded-t-[20px] px-[18px] pb-[max(20px,env(safe-area-inset-bottom))] pt-5"
        style={{ backgroundColor: lightTheme.background.normal }}
      >
        <header className="flex items-center justify-between gap-3">
          <h2
            className={font.headline2.semiBold}
            id={titleId}
            style={{ color: lightTheme.label.neutral }}
          >
            헤어스타일 목록
          </h2>
          <button
            aria-label="헤어스타일 목록 닫기"
            className={cn("ar-motion-press rounded-full px-3 py-2", font.caption.medium)}
            onClick={onClose}
            style={{
              backgroundColor: lightTheme.background.alternative,
              color: lightTheme.label.alternative,
            }}
            type="button"
          >
            닫기
          </button>
        </header>

        <ArHairstyleViews activeHairstyle={activeHairstyle} />

        <div className="mt-5 space-y-3">
          {filterGroups.map(group => (
            <ArHairstyleFilterGroup key={group.label} {...group} />
          ))}
        </div>

        <div className="mt-5 flex items-center justify-between gap-3">
          <h3 className={font.label.semiBold} style={{ color: lightTheme.label.neutral }}>
            스타일
          </h3>
          {hasActiveFilters && (
            <button
              className={cn("ar-motion-press px-2 py-1", font.caption.medium)}
              onClick={handleFilterReset}
              style={{ color: lightTheme.primary.normal }}
              type="button"
            >
              필터 초기화
            </button>
          )}
        </div>

        {filteredOptions.length > 0 ? (
          <div className="mt-2 grid grid-cols-2 gap-3 pb-2">
            {filteredOptions.map(option => (
              <ArHairstyleCard
                key={option.name || "original"}
                option={option}
                isSelected={option.name === activeHairstyleName}
                disabled={disabled}
                onSelect={handleHairstyleSelect}
              />
            ))}
          </div>
        ) : (
          <p
            className={cn("mt-2 rounded-[10px] px-3 py-4 text-center", font.label.regular)}
            role="status"
            style={{
              backgroundColor: lightTheme.background.alternative,
              color: lightTheme.label.alternative,
            }}
          >
            조건에 맞는 헤어스타일이 없습니다.
          </p>
        )}
      </section>
    </ModalShell>
  );
};

export default ArHairstyleBrowser;
