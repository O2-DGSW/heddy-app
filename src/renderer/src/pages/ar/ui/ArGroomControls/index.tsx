import { font, lightTheme } from "@heddy/design-tokens";
import { useId, useState } from "react";

import { GROOM_FIT_RANGES } from "../../model/arGroomFit";
import type { ArGroomFitSettings, ArGroomState } from "../../model/types";
import { cn } from "@/shared";

interface ArGroomControlsProps {
  isExpanded: boolean;
  enabled: boolean;
  hasGroom: boolean;
  groomState: ArGroomState;
  foreheadState: ArGroomState;
  settings: ArGroomFitSettings;
  onChange: (patch: Partial<ArGroomFitSettings>) => void;
  onForeheadRefresh: () => void;
  onRetry: () => void;
}

const FIT_KEYS = ["dyn", "scale", "offset", "groom_fwd"] as const;

const ArGroomControls = ({
  isExpanded,
  enabled,
  hasGroom,
  groomState,
  foreheadState,
  settings,
  onChange,
  onForeheadRefresh,
  onRetry,
}: ArGroomControlsProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const panelId = useId();
  const isForeheadLoading = foreheadState.status === "loading";
  const canAdjust = enabled && hasGroom && groomState.status === "ok" && !isForeheadLoading;
  const groomMessage =
    groomState.status === "loading"
      ? "스타일을 적용하고 있어요"
      : groomState.status === "error"
        ? groomState.message
        : groomState.status === "ok"
          ? null
          : "AR 연결을 기다리고 있어요";
  const foreheadMessage = isForeheadLoading
    ? "이마를 만들고 있어요. 처음에는 몇 초 걸릴 수 있어요."
    : foreheadState.status === "error"
      ? foreheadState.message
      : null;
  const hasStatusMessage = Boolean(groomMessage || foreheadMessage);

  const handleToggle = () => setIsOpen(previous => !previous);

  if (!hasGroom) return null;

  return (
    <section
      aria-label="3D 헤어스타일 조정"
      className={cn(
        "absolute right-4 top-[max(64px,calc(env(safe-area-inset-top)+48px))] max-w-[calc(100%-88px)] overflow-y-auto border shadow-lg backdrop-blur-xl",
        isOpen || hasStatusMessage ? "w-[250px] rounded-2xl" : "rounded-full",
        isExpanded
          ? "max-h-[calc(100%-280px-env(safe-area-inset-top)-env(safe-area-inset-bottom))]"
          : "max-h-[calc(100%-220px)]"
      )}
      style={{
        backgroundColor: `color-mix(in srgb, ${lightTheme.label.normal} 68%, transparent)`,
        borderColor: `color-mix(in srgb, ${lightTheme.background.normal} 20%, transparent)`,
        color: lightTheme.label.buttonText,
      }}
    >
      <button
        aria-controls={panelId}
        aria-expanded={isOpen}
        aria-label={isOpen ? "스타일 조정 닫기" : "스타일 조정 열기"}
        className={cn(
          "flex min-h-11 w-full items-center justify-between gap-4 rounded-[inherit] px-4 py-2 focus-visible:outline-2 focus-visible:-outline-offset-4",
          font.caption.medium
        )}
        onClick={handleToggle}
        type="button"
      >
        <span>스타일 조정</span>
        <span aria-hidden="true" className="opacity-70">
          {isOpen ? "접기" : "+"}
        </span>
      </button>
      <div
        aria-live="polite"
        className={cn("px-4", hasStatusMessage && "pb-3", font.caption.medium)}
        role="status"
      >
        {!hasStatusMessage && groomState.status === "ok" && (
          <p className="sr-only">
            선택한 스타일을 적용했어요.
            {foreheadState.status === "ok" && " 이마 생성이 완료됐어요."}
          </p>
        )}
        {groomMessage && <p>{groomMessage}</p>}
        {foreheadMessage && <p className={cn(groomMessage && "mt-1")}>{foreheadMessage}</p>}
        {groomState.status === "error" && (
          <button
            className={cn(
              "mt-1 min-h-9 underline underline-offset-4 disabled:opacity-45",
              font.caption.medium
            )}
            disabled={!enabled}
            onClick={onRetry}
            type="button"
          >
            스타일 적용 다시 시도
          </button>
        )}
      </div>
      <div className="px-4 pb-4" hidden={!isOpen} id={panelId}>
        <fieldset className="flex min-w-0 flex-col gap-3 disabled:opacity-45" disabled={!canAdjust}>
          <legend className="sr-only">스타일 크기와 위치, 흔들림 조정</legend>
          {FIT_KEYS.map(key => {
            const range = GROOM_FIT_RANGES[key];
            const id = `${panelId}-${key}`;
            return (
              <div key={key}>
                <label
                  className={cn("flex justify-between gap-2", font.caption.medium)}
                  htmlFor={id}
                >
                  <span>{range.label}</span>
                  <span className="tabular-nums opacity-75">
                    {settings[key]}
                    {range.unit}
                  </span>
                </label>
                <input
                  className="h-8 w-full cursor-pointer disabled:cursor-default"
                  style={{ accentColor: lightTheme.primary.normal }}
                  id={id}
                  max={range.max}
                  min={range.min}
                  onChange={event => onChange({ [key]: event.currentTarget.valueAsNumber })}
                  step={range.step}
                  type="range"
                  value={settings[key]}
                />
              </div>
            );
          })}
        </fieldset>
        <button
          className={cn(
            "mt-3 min-h-11 w-full rounded-xl px-2 disabled:opacity-45",
            font.caption.medium
          )}
          disabled={!canAdjust}
          onClick={onForeheadRefresh}
          style={{
            backgroundColor: lightTheme.primary.normal,
            color: lightTheme.label.buttonText,
          }}
          type="button"
        >
          이마 다시 만들기
        </button>
        <p className={cn("mt-2 text-center opacity-75", font.caption.medium)}>
          정면을 보고 눌러 주세요
        </p>
      </div>
    </section>
  );
};

export default ArGroomControls;
