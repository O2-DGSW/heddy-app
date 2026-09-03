import { useEffect } from "react";
import { font, lightTheme } from "@heddy/design-tokens";

import { arrowIcon } from "@/entities/record";
import { cn, useBottomBarVisibility } from "@/shared";

import { getIsTagDisabled } from "../../lib/styleTag";
import { PREFERRED_STYLE_TABS, TAB_LABEL_BY_TYPE, TITLE_BY_TAB } from "../../model/constants";
import { usePreferredStyleRegistration } from "../../model/usePreferredStyleRegistration";
import StyleTagButton from "../StyleTagButton";
import StyleTagResultRow from "../StyleTagResultRow";

const PreferredStyleRegistrationPage = () => {
  const { setIsBottomBarHidden } = useBottomBarVisibility();
  const {
    activeTab,
    actionErrorMessage,
    excludedTags,
    handleBack,
    handleCancel,
    handleExcludedSummaryToggle,
    handlePreferredSummaryToggle,
    handleRetry,
    handleSave,
    handleTabClick,
    handleTagClick,
    isExcludedSummaryExpanded,
    isFetching,
    isPreferredSummaryExpanded,
    isSaveDisabled,
    isSaving,
    loadErrorMessage,
    preferredTags,
    styleTags,
  } = usePreferredStyleRegistration();

  useEffect(() => {
    setIsBottomBarHidden(true);

    return () => {
      setIsBottomBarHidden(false);
    };
  }, [setIsBottomBarHidden]);

  return (
    <section
      aria-labelledby="preferred-style-registration-title"
      aria-busy={isFetching || isSaving}
      className="flex h-full min-h-0 flex-col overflow-x-clip"
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
          {TITLE_BY_TAB[activeTab]}
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

        {PREFERRED_STYLE_TABS.map(tab => {
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
              {TAB_LABEL_BY_TYPE[tab]}
            </button>
          );
        })}
      </div>

      <div
        className="flex min-h-0 flex-1 flex-col px-[clamp(16px,4.4vw,19px)] pb-[clamp(18px,3.6dvh,29px)] pt-[clamp(18px,3.6dvh,29px)]"
        style={{ backgroundColor: lightTheme.fill.normal }}
      >
        <div className="min-h-0 flex-1 touch-pan-y overflow-y-auto overscroll-contain transition-colors duration-300 ease-out no-scrollbar [-webkit-overflow-scrolling:touch]">
          <div className="flex min-h-full flex-col">
            <div className="flex shrink-0 flex-col gap-[clamp(24px,4.4dvh,40px)]">
              <section aria-labelledby="style-tag-list-title" className="flex flex-col gap-[10px]">
                <h2
                  className={`px-[10px] ${font.headline2.semiBold}`}
                  id="style-tag-list-title"
                  style={{ color: lightTheme.label.neutral }}
                >
                  스타일 태그 목록
                </h2>

                <div className="flex flex-wrap gap-[4px]">
                  {isFetching && styleTags.length === 0 ? (
                    <p
                      className={`px-[10px] py-[8px] ${font.label.regular}`}
                      style={{ color: lightTheme.label.assistive }}
                    >
                      스타일 태그를 불러오는 중입니다.
                    </p>
                  ) : (
                    styleTags.map(tag => (
                      <StyleTagButton
                        disabled={isSaving || getIsTagDisabled(tag.status, activeTab)}
                        key={tag.id}
                        label={tag.label}
                        onClick={() => handleTagClick(tag.id)}
                        status={tag.status}
                      />
                    ))
                  )}
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
              </section>
            </div>

            <div className="flex min-h-[clamp(72px,13dvh,96px)] flex-1 flex-col items-center justify-center gap-[8px] py-[clamp(10px,2dvh,18px)]">
              {actionErrorMessage && (
                <div className="flex flex-col items-center gap-[8px]" role="alert">
                  <p
                    className={`text-center ${font.caption.regular}`}
                    style={{ color: lightTheme.status.error }}
                  >
                    {actionErrorMessage}
                  </p>
                  {loadErrorMessage && (
                    <button
                      className={`h-[34px] rounded-[8px] border px-[14px] ${font.label.medium}`}
                      onClick={handleRetry}
                      style={{
                        backgroundColor: lightTheme.background.normal,
                        borderColor: lightTheme.fill.neutral,
                        color: lightTheme.label.alternative,
                      }}
                      type="button"
                    >
                      다시 시도
                    </button>
                  )}
                </div>
              )}

              <p
                className={`text-center ${font.label.regular}`}
                style={{ color: lightTheme.label.neutral }}
              >
                ※제외한 스타일은 추천에 나오지 않아요.
              </p>
            </div>
          </div>
        </div>

        <div className="shrink-0 pt-[clamp(10px,2dvh,16px)]">
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
              disabled={isSaveDisabled}
              onClick={handleSave}
              style={{
                backgroundColor: isSaveDisabled
                  ? lightTheme.fill.neutral
                  : lightTheme.primary.normal,
                color: lightTheme.label.buttonText,
              }}
              type="button"
            >
              {isSaving ? "저장 중" : "저장"}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PreferredStyleRegistrationPage;
