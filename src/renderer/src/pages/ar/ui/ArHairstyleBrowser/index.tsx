import { font, lightTheme } from "@heddy/design-tokens";
import { useId } from "react";

import type { ArHairstyleOption, HairstyleOptionId } from "@/entities/ar-groom";
import { cn, ModalShell } from "@/shared";

import { useArHairstyleFilters } from "../../model/useArHairstyleFilters";
import { useArHairstyleSheet } from "../../model/useArHairstyleSheet";
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
  const contentId = useId();
  const {
    sheetRef,
    handleRef,
    height,
    isDragging,
    isExpanded,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    handlePointerCancel,
    handleToggle,
    handleHandleKeyDown,
    handleSheetKeyDown,
  } = useArHairstyleSheet(onClose);
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
      contentClassName="pointer-events-none flex h-full items-end"
      labelledBy={titleId}
      onBackdropClick={onClose}
      placement="bottom"
    >
      <section
        ref={sheetRef}
        onKeyDown={handleSheetKeyDown}
        className={cn(
          "pointer-events-auto flex w-full flex-col overflow-hidden rounded-t-[32px] shadow-2xl transition-[height] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none",
          isDragging && "will-change-[height]"
        )}
        style={{
          height: `${height}%`,
          backgroundColor: lightTheme.background.normal,
          color: lightTheme.label.normal,
        }}
      >
        <button
          ref={handleRef}
          aria-label={isExpanded ? "헤어스타일 목록 접기" : "헤어스타일 목록 펼치기"}
          aria-expanded={isExpanded}
          aria-controls={contentId}
          className="flex min-h-11 w-full shrink-0 touch-none select-none items-center justify-center rounded-t-[32px] cursor-grab active:cursor-grabbing focus-visible:outline-2 focus-visible:-outline-offset-4"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerCancel}
          onLostPointerCapture={handlePointerCancel}
          onClick={handleToggle}
          onKeyDown={handleHandleKeyDown}
          type="button"
        >
          <span
            aria-hidden="true"
            className="h-1 w-10 rounded-full"
            style={{ backgroundColor: lightTheme.label.assistive }}
          />
        </button>
        <header
          className="flex shrink-0 items-center gap-3 border-b px-5 pb-4"
          style={{ borderColor: lightTheme.line.alternative }}
        >
          <div
            className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-full"
            style={{ backgroundColor: lightTheme.background.alternative }}
          >
            {activeHairstyle?.thumbUrl ? (
              <img alt="" src={activeHairstyle.thumbUrl} className="size-full object-contain p-1" />
            ) : (
              <span aria-hidden="true" className={font.headline2.semiBold}>
                —
              </span>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className={font.caption.regular} style={{ color: lightTheme.label.assistive }}>
              현재 스타일
            </p>
            <h2 id={titleId} className={cn("mt-1 truncate", font.headline2.semiBold)}>
              {activeHairstyle?.label ?? "헤어스타일"}
            </h2>
          </div>
          <button
            aria-label="헤어스타일 목록 닫기"
            className={cn("min-h-11 px-2", font.caption.medium)}
            onClick={onClose}
            type="button"
            style={{ color: lightTheme.label.alternative }}
          >
            닫기
          </button>
        </header>
        <div
          id={contentId}
          className="min-h-0 flex-1 overflow-y-auto overscroll-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden px-5 pb-[max(20px,env(safe-area-inset-bottom))]"
        >
          <details className="border-b py-3" style={{ borderColor: lightTheme.line.alternative }}>
            <summary className={cn("cursor-pointer py-1", font.label.medium)}>
              스타일 필터{hasActiveFilters ? " · 적용 중" : ""}
            </summary>
            <div className="mt-3 space-y-3">
              {filterGroups.map(group => (
                <ArHairstyleFilterGroup key={group.label} {...group} />
              ))}
            </div>
            {hasActiveFilters && (
              <button
                className={cn("mt-2 min-h-11", font.caption.medium)}
                onClick={handleFilterReset}
                style={{ color: lightTheme.primary.normal }}
                type="button"
              >
                필터 초기화
              </button>
            )}
          </details>
          <h3 className={cn("pb-1 pt-4", font.label.semiBold)}>
            헤어스타일{" "}
            <span style={{ color: lightTheme.label.assistive }}>{filteredOptions.length}</span>
          </h3>
          {filteredOptions.length > 0 ? (
            <div className="space-y-1">
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
              className={cn("py-6 text-center", font.label.regular)}
              role="status"
              style={{ color: lightTheme.label.alternative }}
            >
              조건에 맞는 헤어스타일이 없습니다.
            </p>
          )}
          <ArHairstyleViews activeHairstyle={activeHairstyle} />
        </div>
      </section>
    </ModalShell>
  );
};

export default ArHairstyleBrowser;
