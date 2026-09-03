import { font, lightTheme, palette } from "@heddy/design-tokens";

import { arrowIcon } from "@/entities/record";
import { cn } from "@/shared";

import { useSharePermissions } from "../../model/useSharePermissions";
import type { SharePermissionItem, SharePermissionSection } from "../../model/types";

interface PermissionToggleProps {
  checked: boolean;
  disabled?: boolean;
  label: string;
  onToggle: () => void;
}

interface PermissionRowProps {
  disabled?: boolean;
  item: SharePermissionItem;
  onToggle: (itemId: string) => void;
}

interface PermissionSectionProps {
  disabled?: boolean;
  section: SharePermissionSection;
  onToggle: (itemId: string) => void;
}

const PermissionToggle = ({
  checked,
  disabled = false,
  label,
  onToggle,
}: PermissionToggleProps) => {
  return (
    <button
      aria-label={`${label} ${checked ? "끄기" : "켜기"}`}
      aria-pressed={checked}
      className={cn(
        "relative h-[27px] w-[45px] shrink-0 rounded-[14px] border-0 p-0 transition-colors duration-200",
        disabled && "cursor-not-allowed"
      )}
      disabled={disabled}
      onClick={onToggle}
      style={{
        backgroundColor: checked ? lightTheme.primary.normal : lightTheme.line.neutral,
      }}
      type="button"
    >
      <span
        className={cn(
          "absolute top-1/2 h-[21px] w-[21px] -translate-y-1/2 rounded-full transition-[left] duration-200",
          checked ? "left-[21px]" : "left-[3px]"
        )}
        style={{ backgroundColor: palette.neutral[95] }}
      />
    </button>
  );
};

const PermissionRow = ({ disabled = false, item, onToggle }: PermissionRowProps) => {
  const handleToggle = () => {
    onToggle(item.id);
  };
  const canToggle = item.canToggle ?? true;

  return (
    <div className="flex w-full items-start justify-between gap-[clamp(12px,3.2vw,16px)]">
      <div className="min-w-0 flex-1 pt-[2px]">
        <p className={font.body.medium} style={{ color: lightTheme.label.alternative }}>
          {item.title}
        </p>
        <p className={font.label.regular} style={{ color: lightTheme.label.assistive }}>
          {item.description}
        </p>
      </div>

      {canToggle && (
        <PermissionToggle
          checked={item.enabled}
          disabled={disabled || item.disabled}
          label={item.title}
          onToggle={handleToggle}
        />
      )}
    </div>
  );
};

const PermissionSection = ({ disabled = false, section, onToggle }: PermissionSectionProps) => {
  return (
    <section
      aria-labelledby={`${section.id}-title`}
      className="flex flex-col gap-[clamp(24px,4.5dvh,36px)] px-[clamp(18px,5.8vw,25px)] py-[clamp(28px,5.2dvh,46px)]"
    >
      <h2
        className={font.headline1.semiBold}
        id={`${section.id}-title`}
        style={{ color: lightTheme.label.neutral }}
      >
        {section.title}
      </h2>

      <div className="flex flex-col gap-[clamp(24px,4.5dvh,36px)]">
        {section.items.map(item => (
          <PermissionRow disabled={disabled} item={item} key={item.id} onToggle={onToggle} />
        ))}
      </div>
    </section>
  );
};

const SharePermissionsPage = () => {
  const {
    actionErrorMessage,
    handleBack,
    handleClose,
    handleRetry,
    handleSave,
    handleToggle,
    isFetching,
    isSaveDisabled,
    isSaving,
    loadErrorMessage,
    sections,
  } = useSharePermissions();

  return (
    <section
      aria-labelledby="share-permissions-title"
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
          className={font.headline1.bold}
          id="share-permissions-title"
          style={{ color: lightTheme.label.neutral }}
        >
          공유 권한 관리
        </h1>
      </header>

      <div
        className="flex min-h-0 flex-1 flex-col"
        style={{ backgroundColor: lightTheme.fill.normal }}
      >
        <div className="min-h-0 flex-1 touch-pan-y overflow-y-auto overscroll-contain no-scrollbar [-webkit-overflow-scrolling:touch]">
          {isFetching && sections.length === 0 ? (
            <p
              className={`px-[clamp(18px,5.8vw,25px)] py-[clamp(28px,5.2dvh,46px)] text-center ${font.body.medium}`}
              style={{ color: lightTheme.label.assistive }}
            >
              공유 권한 정보를 불러오는 중입니다.
            </p>
          ) : (
            sections.map((section, index) => (
              <div
                className={cn(index < sections.length - 1 && "border-b")}
                key={section.id}
                style={{ borderColor: lightTheme.line.alternative }}
              >
                <PermissionSection
                  disabled={isFetching || isSaving}
                  section={section}
                  onToggle={handleToggle}
                />
              </div>
            ))
          )}

          {actionErrorMessage && (
            <div
              className="flex flex-col items-center gap-[8px] px-[clamp(18px,5.8vw,25px)] pb-[clamp(18px,3dvh,24px)]"
              role="alert"
            >
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
        </div>

        <div className="grid shrink-0 grid-cols-2 gap-[7px] px-[18px] pb-[clamp(18px,3.4dvh,28px)] pt-[clamp(10px,2dvh,16px)]">
          <button
            className={`h-[42px] rounded-[10px] border ${font.headline2.semiBold}`}
            onClick={handleClose}
            style={{
              backgroundColor: lightTheme.background.alternative,
              borderColor: lightTheme.fill.neutral,
              color: lightTheme.label.alternative,
            }}
            type="button"
          >
            닫기
          </button>
          <button
            className={cn(
              `h-[42px] rounded-[10px] border border-transparent ${font.headline2.semiBold}`,
              isSaveDisabled && "cursor-not-allowed"
            )}
            disabled={isSaveDisabled}
            onClick={handleSave}
            style={{
              backgroundColor: isSaveDisabled ? lightTheme.fill.neutral : lightTheme.primary.normal,
              color: isSaveDisabled ? lightTheme.label.assistive : lightTheme.label.buttonText,
            }}
            type="button"
          >
            {isSaving ? "저장 중" : "저장"}
          </button>
        </div>
      </div>
    </section>
  );
};

export default SharePermissionsPage;
