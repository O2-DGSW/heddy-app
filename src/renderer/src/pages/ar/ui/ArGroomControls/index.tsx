import { font, lightTheme } from "@heddy/design-tokens";

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
  const isForeheadLoading = foreheadState.status === "loading";
  const canAdjust = enabled && hasGroom && groomState.status === "ok" && !isForeheadLoading;
  const groomMessage =
    groomState.status === "loading"
      ? "스타일을 적용하고 있어요"
      : groomState.status === "error"
        ? groomState.message
        : !hasGroom
          ? "헤어스타일을 선택해 주세요"
          : groomState.status === "ok"
            ? "선택한 스타일을 적용했어요"
            : "AR 연결을 기다리고 있어요";
  const foreheadMessage = isForeheadLoading
    ? "이마를 만들고 있어요. 처음에는 몇 초 걸릴 수 있어요."
    : foreheadState.status === "error"
      ? foreheadState.message
      : foreheadState.status === "ok"
        ? "이마 생성이 완료됐어요"
        : null;

  return (
    <section
      aria-label="3D 헤어스타일 조정"
      className={cn(
        "absolute right-4 top-[max(64px,calc(env(safe-area-inset-top)+48px))] w-[min(250px,calc(100%-88px))] overflow-y-auto rounded-xl p-3 shadow-lg [scrollbar-gutter:stable]",
        isExpanded
          ? "max-h-[calc(100%-280px-env(safe-area-inset-top)-env(safe-area-inset-bottom))]"
          : "max-h-[calc(100%-220px)]"
      )}
      style={{ backgroundColor: lightTheme.background.normal, color: lightTheme.label.normal }}
    >
      <div aria-live="polite" className={cn("mb-2", font.caption.medium)} role="status">
        <p>{groomMessage}</p>
        {foreheadMessage && <p className="mt-1">{foreheadMessage}</p>}
      </div>
      {groomState.status === "error" && (
        <button
          className={cn("mb-2 min-h-9 underline", font.caption.medium)}
          disabled={!enabled}
          onClick={onRetry}
          type="button"
        >
          스타일 적용 다시 시도
        </button>
      )}
      {hasGroom && (
        <>
          <button
            className={cn(
              "min-h-10 w-full rounded-lg px-2 disabled:opacity-45",
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
          <p className={cn("mt-1", font.caption.medium)}>정면을 보고 누르세요</p>
          <details className="mt-2">
            <summary className={cn("cursor-pointer py-2", font.caption.medium)}>
              스타일 미세조정
            </summary>
            <fieldset
              className="flex min-w-0 flex-col gap-3 disabled:opacity-45"
              disabled={!canAdjust}
            >
              <legend className="sr-only">스타일 크기와 위치, 흔들림 조정</legend>
              {FIT_KEYS.map(key => {
                const range = GROOM_FIT_RANGES[key];
                const id = `ar-fit-${key}`;
                return (
                  <div key={key}>
                    <label
                      className={cn("flex justify-between gap-2", font.caption.medium)}
                      htmlFor={id}
                    >
                      <span>{range.label}</span>
                      <span>
                        {settings[key]}
                        {range.unit}
                      </span>
                    </label>
                    <input
                      className="h-8 w-full"
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
          </details>
        </>
      )}
    </section>
  );
};

export default ArGroomControls;
