import { font, lightTheme } from "@heddy/design-tokens";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { arrowIcon, dropdownIcon } from "@/entities/record";
import { cn } from "@/shared";

type PreferredStyleTabType = "preferred" | "excluded";
type StyleTagStatusType = "none" | "preferred" | "excluded";

interface StyleTag {
  id: string;
  label: string;
  status: StyleTagStatusType;
}

interface StyleTagButtonProps {
  label: string;
  status: StyleTagStatusType;
  disabled?: boolean;
  onClick?: () => void;
}

interface StyleTagResultRowProps {
  label: string;
  tags: StyleTag[];
  status: Exclude<StyleTagStatusType, "none">;
  isExpanded: boolean;
  onToggleExpand: () => void;
}

const SELECTED_BACKGROUND_COLOR = "#F4FBF8";
const MAX_VISIBLE_RESULT_TAGS = 2;

const INITIAL_STYLE_TAGS: StyleTag[] = [
  { id: "layered-cut", label: "#레이어드컷", status: "preferred" },
  { id: "hush-cut", label: "#허쉬컷", status: "preferred" },
  { id: "bob-cut", label: "#단발", status: "none" },
  { id: "hippie-perm", label: "#히피펌", status: "none" },
  { id: "volume-magic", label: "#볼륨매직", status: "preferred" },
  { id: "ash-brown", label: "#애쉬브라운", status: "excluded" },
  { id: "bleach", label: "#탈색", status: "none" },
  { id: "clinic", label: "#클리닉", status: "none" },
  { id: "dandy-cut", label: "#댄디컷", status: "preferred" },
  { id: "leaf-cut", label: "#리프컷", status: "none" },
  { id: "parted-perm", label: "#가르마펌", status: "preferred" },
  { id: "c-curl", label: "#C컬펌", status: "excluded" },
  { id: "s-curl", label: "#S컬펌", status: "none" },
  { id: "tassel-cut", label: "#태슬컷", status: "preferred" },
];

const tabLabelByType: Record<PreferredStyleTabType, string> = {
  preferred: "선호",
  excluded: "제외",
};

const titleByTab: Record<PreferredStyleTabType, string> = {
  preferred: "선호 스타일 등록",
  excluded: "제외 스타일 등록",
};

const getIsTagDisabled = (status: StyleTagStatusType, activeTab: PreferredStyleTabType) => {
  if (activeTab === "preferred") {
    return status === "excluded";
  }

  return status === "preferred";
};

const StyleTagButton = ({ label, status, disabled = false, onClick }: StyleTagButtonProps) => {
  const isPreferred = status === "preferred";
  const isExcluded = status === "excluded";
  const className = cn(
    `inline-flex h-[26px] shrink-0 items-center justify-center rounded-[15px] border px-[8px] py-[4px] transition-colors duration-200 ${font.label.medium}`,
    disabled && "cursor-not-allowed"
  );
  const style = {
    backgroundColor: isPreferred
      ? SELECTED_BACKGROUND_COLOR
      : isExcluded
        ? lightTheme.line.normal
        : lightTheme.background.normal,
    borderColor: isPreferred
      ? lightTheme.primary.normal
      : isExcluded
        ? lightTheme.line.normal
        : lightTheme.fill.neutral,
    color: isPreferred
      ? lightTheme.primary.normal
      : isExcluded
        ? lightTheme.label.assistive
        : lightTheme.label.alternative,
  };

  if (!onClick) {
    return (
      <span className={className} style={style}>
        {label}
      </span>
    );
  }

  return (
    <button
      aria-pressed={isPreferred || isExcluded}
      className={className}
      disabled={disabled}
      onClick={onClick}
      style={style}
      type="button"
    >
      {label}
    </button>
  );
};

const getNextTagStatus = (currentStatus: StyleTagStatusType, activeTab: PreferredStyleTabType) => {
  if (currentStatus === activeTab) {
    return "none";
  }

  return activeTab;
};

const StyleTagResultRow = ({
  label,
  tags,
  status,
  isExpanded,
  onToggleExpand,
}: StyleTagResultRowProps) => {
  const visibleTags = tags.slice(0, MAX_VISIBLE_RESULT_TAGS);
  const hasHiddenTags = tags.length > MAX_VISIBLE_RESULT_TAGS;
  const displayTags = isExpanded ? tags : visibleTags;

  return (
    <div className="flex flex-col gap-[14px] px-[14px] py-[14px]">
      <div className="flex min-h-[26px] items-center justify-between gap-[12px]">
        <span className={font.body.medium} style={{ color: lightTheme.label.inactive }}>
          {label}
        </span>

        <div className="flex flex-wrap items-center justify-end gap-[4px]">
          {!isExpanded &&
            displayTags.map(tag => (
              <StyleTagButton key={tag.id} label={tag.label} status={status} />
            ))}

          {hasHiddenTags && (
            <button
              aria-expanded={isExpanded}
              aria-label={isExpanded ? `${label} 접기` : `${label} 더 보기`}
              className="flex h-[32px] w-[32px] shrink-0 items-center justify-center border-0 bg-transparent p-0"
              onClick={onToggleExpand}
              type="button"
            >
              <img
                alt=""
                className={cn(
                  "h-[24px] w-[24px] transition-transform duration-200",
                  isExpanded && "rotate-180"
                )}
                src={dropdownIcon}
              />
            </button>
          )}
        </div>
      </div>

      {isExpanded && (
        <div className="flex flex-wrap gap-[4px] transition-opacity duration-200">
          {displayTags.map(tag => (
            <StyleTagButton key={tag.id} label={tag.label} status={status} />
          ))}
        </div>
      )}
    </div>
  );
};

const PreferredStyleRegistrationPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<PreferredStyleTabType>("preferred");
  const [styleTags, setStyleTags] = useState<StyleTag[]>(INITIAL_STYLE_TAGS);
  const [isPreferredSummaryExpanded, setIsPreferredSummaryExpanded] = useState(false);
  const [isExcludedSummaryExpanded, setIsExcludedSummaryExpanded] = useState(false);

  const preferredTags = useMemo(
    () => styleTags.filter(tag => tag.status === "preferred"),
    [styleTags]
  );
  const excludedTags = useMemo(
    () => styleTags.filter(tag => tag.status === "excluded"),
    [styleTags]
  );

  const handleBack = () => {
    navigate(-1);
  };

  const handleTabClick = (tab: PreferredStyleTabType) => {
    setActiveTab(tab);
  };

  const handleTagClick = (tagId: string) => {
    setStyleTags(currentTags =>
      currentTags.map(tag => {
        if (tag.id !== tagId || getIsTagDisabled(tag.status, activeTab)) {
          return tag;
        }

        return { ...tag, status: getNextTagStatus(tag.status, activeTab) };
      })
    );
  };

  const handlePreferredSummaryToggle = () => {
    setIsPreferredSummaryExpanded(isExpanded => !isExpanded);
  };

  const handleExcludedSummaryToggle = () => {
    setIsExcludedSummaryExpanded(isExpanded => !isExpanded);
  };

  const handleCancel = () => {
    navigate(-1);
  };

  const handleSave = () => {
    navigate(-1);
  };

  return (
    <section
      aria-labelledby="preferred-style-registration-title"
      className="flex min-h-full flex-col overflow-x-clip"
      style={{ backgroundColor: lightTheme.background.normal }}
    >
      <header className="relative flex h-[54px] shrink-0 items-center justify-center px-[20px]">
        <button
          aria-label="뒤로 가기"
          className="absolute left-[20px] flex h-[44px] w-[44px] items-center justify-start border-0 bg-transparent p-0"
          onClick={handleBack}
          type="button"
        >
          <img alt="" className="h-[20px] w-[20px]" src={arrowIcon} />
        </button>

        <h1
          className={`transition-colors duration-300 ease-out ${font.headline1.bold}`}
          id="preferred-style-registration-title"
          style={{ color: lightTheme.label.neutral }}
        >
          {titleByTab[activeTab]}
        </h1>
      </header>

      <div
        aria-label="스타일 등록 유형"
        className="relative grid h-[59px] shrink-0 grid-cols-2 border-b"
        role="tablist"
        style={{ borderColor: lightTheme.label.disable }}
      >
        <span
          className={cn(
            "absolute bottom-[-1px] h-[3px] w-[56px] rounded-full transition-[left] duration-300 ease-out",
            activeTab === "preferred"
              ? "left-[25%] -translate-x-1/2"
              : "left-[75%] -translate-x-1/2"
          )}
          style={{ backgroundColor: lightTheme.label.neutral }}
        />

        {(["preferred", "excluded"] as const).map(tab => {
          const isActive = activeTab === tab;

          return (
            <button
              aria-selected={isActive}
              className={cn(
                "relative flex items-center justify-center border-0 bg-transparent p-0 transition-colors duration-300 ease-out",
                isActive ? font.headline2.semiBold : font.body.medium
              )}
              key={tab}
              onClick={() => handleTabClick(tab)}
              role="tab"
              style={{ color: isActive ? lightTheme.label.neutral : lightTheme.line.normal }}
              type="button"
            >
              {tabLabelByType[tab]}
            </button>
          );
        })}
      </div>

      <div
        className="flex flex-1 flex-col justify-between px-[19px] pb-[22px] pt-[29px]"
        style={{ backgroundColor: lightTheme.fill.normal }}
      >
        <div className="flex flex-col gap-[40px] transition-colors duration-300 ease-out">
          <section aria-labelledby="style-tag-list-title" className="flex flex-col gap-[10px]">
            <h2
              className={`px-[10px] ${font.headline2.semiBold}`}
              id="style-tag-list-title"
              style={{ color: lightTheme.label.neutral }}
            >
              스타일 태그 목록
            </h2>

            <div className="flex flex-wrap gap-[4px]">
              {styleTags.map(tag => (
                <StyleTagButton
                  disabled={getIsTagDisabled(tag.status, activeTab)}
                  key={tag.id}
                  label={tag.label}
                  onClick={() => handleTagClick(tag.id)}
                  status={tag.status}
                />
              ))}
            </div>
          </section>

          <section
            aria-labelledby="selected-style-result-title"
            className="flex flex-col gap-[10px]"
          >
            <h2
              className={`px-[10px] ${font.headline2.semiBold}`}
              id="selected-style-result-title"
              style={{ color: lightTheme.label.neutral }}
            >
              선택 결과
            </h2>

            <div className="rounded-[15px]">
              <div
                className="border-b transition-all duration-200"
                style={{ borderColor: lightTheme.label.disable }}
              >
                <StyleTagResultRow
                  isExpanded={isPreferredSummaryExpanded}
                  label="선호 태그"
                  onToggleExpand={handlePreferredSummaryToggle}
                  status="preferred"
                  tags={preferredTags}
                />
              </div>

              <div className="transition-all duration-200">
                <StyleTagResultRow
                  isExpanded={isExcludedSummaryExpanded}
                  label="제외 태그"
                  onToggleExpand={handleExcludedSummaryToggle}
                  status="excluded"
                  tags={excludedTags}
                />
              </div>
            </div>

            <p
              className={`mt-[31px] text-center ${font.label.regular}`}
              style={{ color: lightTheme.label.neutral }}
            >
              ※제외한 스타일은 추천에 나오지 않아요.
            </p>
          </section>
        </div>

        <div className="grid grid-cols-2 gap-[7px]">
          <button
            className={`h-[42px] rounded-[10px] border ${font.headline2.semiBold}`}
            onClick={handleCancel}
            style={{
              backgroundColor: lightTheme.background.alternative,
              borderColor: lightTheme.fill.neutral,
              color: lightTheme.label.alternative,
            }}
            type="button"
          >
            취소
          </button>
          <button
            className={`h-[42px] rounded-[10px] border border-transparent ${font.headline2.semiBold}`}
            onClick={handleSave}
            style={{
              backgroundColor: lightTheme.primary.normal,
              color: lightTheme.label.buttonText,
            }}
            type="button"
          >
            저장
          </button>
        </div>
      </div>
    </section>
  );
};

export default PreferredStyleRegistrationPage;
