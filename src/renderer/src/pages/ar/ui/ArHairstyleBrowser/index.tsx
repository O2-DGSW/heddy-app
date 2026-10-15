import { font, lightTheme } from "@heddy/design-tokens";
import { useId, useState } from "react";

import type { ArHairstyleOption, HairstyleOptionId } from "@/entities/ar-groom";
import { cn, ModalShell } from "@/shared";

const VIEW_ANGLES = ["정면", "3/4", "옆", "뒤"] as const;

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
  const [selectedGender, setSelectedGender] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const genderOptions = Array.from(
    new Set(hairstyleOptions.flatMap(option => (option.gender ? [option.gender] : [])))
  );
  const typeOptions = Array.from(
    new Set(hairstyleOptions.flatMap(option => (option.type ? [option.type] : [])))
  );
  const tagOptions = Array.from(new Set(hairstyleOptions.flatMap(option => option.tags ?? [])));
  const filterGroups = [
    {
      label: "성별",
      options: genderOptions,
      selectedValue: selectedGender,
      onSelect: setSelectedGender,
    },
    { label: "유형", options: typeOptions, selectedValue: selectedType, onSelect: setSelectedType },
    { label: "태그", options: tagOptions, selectedValue: selectedTag, onSelect: setSelectedTag },
  ].filter(group => group.options.length > 0);
  const activeHairstyle = hairstyleOptions.find(option => option.name === activeHairstyleName);
  const filteredOptions = hairstyleOptions.filter(option => {
    const matchesGender = !selectedGender || option.gender === selectedGender;
    const matchesType = !selectedType || option.type === selectedType;
    const matchesTag = !selectedTag || option.tags?.includes(selectedTag);

    return matchesGender && matchesType && matchesTag;
  });
  const hasActiveFilters = Boolean(selectedGender || selectedType || selectedTag);

  const handleFilterReset = () => {
    setSelectedGender(null);
    setSelectedType(null);
    setSelectedTag(null);
  };

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

        {activeHairstyle?.viewsUrl ? (
          <section aria-label={`${activeHairstyle.label} 4방향 미리보기`} className="mt-5">
            <h3 className={font.label.semiBold} style={{ color: lightTheme.label.neutral }}>
              {activeHairstyle.label} · 방향별 미리보기
            </h3>
            <div className="mt-2 grid grid-cols-4 gap-2">
              {VIEW_ANGLES.map((angle, index) => (
                <div className="min-w-0" key={angle}>
                  <div
                    aria-label={`${activeHairstyle.label} ${angle} 미리보기`}
                    className="aspect-square w-full rounded-[10px] bg-center bg-no-repeat"
                    role="img"
                    style={{
                      backgroundColor: lightTheme.background.neutral,
                      backgroundImage: `url("${activeHairstyle.viewsUrl}")`,
                      backgroundPosition: `${(index / (VIEW_ANGLES.length - 1)) * 100}% center`,
                      backgroundSize: "400% 100%",
                    }}
                  />
                  <p
                    className={cn("mt-1 truncate text-center", font.caption.medium)}
                    style={{ color: lightTheme.label.alternative }}
                  >
                    {angle}
                  </p>
                </div>
              ))}
            </div>
          </section>
        ) : (
          <p
            className={cn("mt-5 rounded-[10px] px-3 py-2", font.caption.regular)}
            role="status"
            style={{
              backgroundColor: lightTheme.background.alternative,
              color: lightTheme.label.alternative,
            }}
          >
            스타일을 선택하면 4방향 참고 이미지를 볼 수 있어요.
          </p>
        )}

        <div className="mt-5 space-y-3">
          {filterGroups.map(({ label, options, selectedValue, onSelect }) => (
            <fieldset className="min-w-0" key={label}>
              <legend
                className={cn("mb-2", font.caption.semiBold)}
                style={{ color: lightTheme.label.alternative }}
              >
                {label}
              </legend>
              <div
                aria-label={`${label} 필터`}
                className="flex gap-2 overflow-x-auto pb-1"
                role="group"
              >
                {[null, ...options].map(value => {
                  const isSelected = selectedValue === value;

                  return (
                    <button
                      aria-pressed={isSelected}
                      className={cn(
                        "ar-motion-press shrink-0 rounded-full border px-3 py-1.5",
                        font.caption.medium
                      )}
                      key={value ?? "all"}
                      onClick={() => onSelect(value)}
                      style={{
                        backgroundColor: isSelected
                          ? lightTheme.primary.normal
                          : lightTheme.background.alternative,
                        borderColor: isSelected
                          ? lightTheme.primary.normal
                          : lightTheme.fill.normal,
                        color: isSelected
                          ? lightTheme.label.buttonText
                          : lightTheme.label.alternative,
                      }}
                      type="button"
                    >
                      {value ?? "전체"}
                    </button>
                  );
                })}
              </div>
            </fieldset>
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
            {filteredOptions.map(option => {
              const isSelected = option.name === activeHairstyleName;

              return (
                <button
                  aria-disabled={disabled}
                  aria-pressed={isSelected}
                  className={cn("ar-motion-press min-w-0 rounded-[14px] border p-2 text-left")}
                  key={option.name || "original"}
                  onClick={() => handleHairstyleSelect(option.name)}
                  style={{
                    backgroundColor: lightTheme.background.normal,
                    borderColor: isSelected ? lightTheme.primary.normal : lightTheme.fill.normal,
                    color: lightTheme.label.neutral,
                  }}
                  type="button"
                >
                  {option.thumbUrl ? (
                    <img
                      alt={`${option.label} 헤어스타일 썸네일`}
                      className="aspect-square w-full rounded-[10px] object-contain p-2"
                      decoding="async"
                      loading="lazy"
                      src={option.thumbUrl}
                      style={{ backgroundColor: lightTheme.background.neutral }}
                    />
                  ) : (
                    <span
                      className={cn(
                        "flex aspect-square w-full items-center justify-center rounded-[10px] px-2 text-center",
                        font.label.semiBold
                      )}
                      style={{
                        backgroundColor: lightTheme.background.neutral,
                        color: lightTheme.label.alternative,
                      }}
                    >
                      {option.label}
                    </span>
                  )}
                  <span className={cn("mt-2 block truncate", font.label.semiBold)}>
                    {option.label}
                  </span>
                  {(option.gender || option.type) && (
                    <span
                      className={cn("mt-1 block truncate", font.caption.regular)}
                      style={{ color: lightTheme.label.alternative }}
                    >
                      {[option.gender, option.type].filter(Boolean).join(" · ")}
                    </span>
                  )}
                  {option.tags && option.tags.length > 0 && (
                    <span
                      className={cn("mt-1 block truncate", font.caption.regular)}
                      style={{ color: lightTheme.label.alternative }}
                    >
                      {option.tags.join(" · ")}
                    </span>
                  )}
                </button>
              );
            })}
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
