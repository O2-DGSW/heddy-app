import { font, lightTheme } from "@heddy/design-tokens";
import { useEffect, useId, useRef, useState } from "react";
import type { FormEvent, KeyboardEvent } from "react";

import { HeddyLogo } from "@/features/home";
import { cn, ModalShell } from "@/shared";

interface MaintenancePageProps {
  isAccessEnded: boolean;
  scheduleLabel: string;
  onUnlock: (code: string) => Promise<void>;
}

const REQUIRED_TAPS = 7;
const MAX_TAP_GAP_MS = 700;

const MaintenancePage = ({ isAccessEnded, scheduleLabel, onUnlock }: MaintenancePageProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [isPending, setIsPending] = useState(false);
  const tapsRef = useRef({ count: 0, lastTappedAt: 0 });
  const warningRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const titleId = useId();
  const inputId = useId();
  const errorId = useId();

  const handleWarningClick = () => {
    const now = Date.now();
    const count =
      now - tapsRef.current.lastTappedAt <= MAX_TAP_GAP_MS ? tapsRef.current.count + 1 : 1;
    tapsRef.current = { count, lastTappedAt: now };
    if (count >= REQUIRED_TAPS) {
      tapsRef.current.count = 0;
      setIsDialogOpen(true);
    }
  };

  const handleClose = () => {
    if (isPending) return;
    setIsDialogOpen(false);
    setCode("");
    setError("");
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isPending || code.length === 0) return;
    setIsPending(true);
    setError("");
    try {
      await onUnlock(code);
    } catch {
      setError("앱 진입을 처리하지 못했습니다. 다시 시도해 주세요.");
    } finally {
      setIsPending(false);
    }
  };

  const handleDialogKeyDown = (event: KeyboardEvent<HTMLFormElement>) => {
    if (event.key === "Escape") {
      event.preventDefault();
      handleClose();
    }
    if (event.key !== "Tab") return;
    const controls = event.currentTarget.querySelectorAll<HTMLElement>(
      "input:not(:disabled), button:not(:disabled)"
    );
    const first = controls[0];
    const last = controls[controls.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last?.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first?.focus();
    }
  };

  useEffect(() => {
    if (!isDialogOpen) return;
    inputRef.current?.focus();
    const warningButton = warningRef.current;
    return () => warningButton?.focus();
  }, [isDialogOpen]);

  if (isAccessEnded) {
    return (
      <section
        role="status"
        className="flex h-full flex-col items-center justify-center gap-4 px-6 text-center"
      >
        <h1 className={font.title2.bold} style={{ color: lightTheme.label.normal }}>
          앱 이용이 종료되었습니다
        </h1>
        <p className={font.body.regular} style={{ color: lightTheme.label.alternative }}>
          비밀번호가 일치하지 않습니다.
          <br />
          앱이나 창을 닫은 뒤 다시 실행해 주세요.
        </p>
      </section>
    );
  }

  return (
    <div
      className="h-full overflow-y-auto"
      style={{ backgroundColor: lightTheme.background.normal }}
    >
      <section
        aria-label="서비스 점검"
        className="mx-auto flex min-h-full w-full max-w-[430px] flex-col items-center justify-center px-6 py-12 text-center"
        inert={isDialogOpen}
      >
        <div className="flex size-24 items-center justify-center">
          <button
            ref={warningRef}
            type="button"
            aria-label="점검 안내"
            onClick={handleWarningClick}
            className={cn(
              "flex size-full touch-manipulation items-center justify-center rounded-full",
              font.display1.bold
            )}
          >
            <span aria-hidden="true" className="scale-200">
              ⚠️
            </span>
          </button>
        </div>
        <div className="mt-8">
          <HeddyLogo />
        </div>
        <h1 className={cn("mt-3", font.title1.bold)} style={{ color: lightTheme.label.normal }}>
          서비스 점검 중입니다
        </h1>
        <p
          className={cn("mt-4", font.body.regular)}
          style={{ color: lightTheme.label.alternative }}
        >
          더 나은 서비스를 위해 잠시 쉬어가고 있어요.
          <br />
          점검이 끝나면 다시 만나요!
        </p>
        <section
          aria-label="점검 일정"
          className="mt-8 w-full rounded-2xl px-4 py-5"
          style={{ backgroundColor: lightTheme.fill.normal }}
        >
          <h2 className={font.label.bold} style={{ color: lightTheme.label.neutral }}>
            점검 예정 시간
          </h2>
          <p
            className={cn("mt-2", font.label.medium)}
            style={{ color: lightTheme.label.alternative }}
          >
            {scheduleLabel}
          </p>
        </section>
        <p className={cn("mt-6", font.label.regular)} style={{ color: lightTheme.label.assistive }}>
          이용에 불편을 드려 죄송합니다.
        </p>
      </section>
      {isDialogOpen && (
        <ModalShell labelledBy={titleId} placement="center">
          <form
            onSubmit={handleSubmit}
            onKeyDown={handleDialogKeyDown}
            aria-busy={isPending}
            className="max-h-[80dvh] w-full overflow-y-auto rounded-2xl p-6"
            style={{ backgroundColor: lightTheme.background.normal }}
          >
            <h2
              id={titleId}
              className={font.headline1.bold}
              style={{ color: lightTheme.label.normal }}
            >
              점검 중 앱 사용
            </h2>
            <label
              htmlFor={inputId}
              className={cn("mt-4 block", font.label.regular)}
              style={{ color: lightTheme.label.alternative }}
            >
              비밀번호를 입력해 주세요.
            </label>
            <input
              ref={inputRef}
              id={inputId}
              type="password"
              inputMode="numeric"
              autoComplete="off"
              required
              value={code}
              disabled={isPending}
              aria-invalid={Boolean(error)}
              aria-describedby={error ? errorId : undefined}
              onChange={event => {
                setCode(event.target.value.replace(/\D/g, ""));
                setError("");
              }}
              className={cn(
                "mt-3 h-12 w-full rounded-xl border px-4 text-center",
                font.headline1.medium
              )}
              style={{ borderColor: lightTheme.line.normal, color: lightTheme.label.normal }}
            />
            {error && (
              <p
                id={errorId}
                role="alert"
                className={cn("mt-3", font.label.regular)}
                style={{ color: lightTheme.status.error }}
              >
                {error}
              </p>
            )}
            <div className="mt-6 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleClose}
                disabled={isPending}
                className={cn("h-12 rounded-xl disabled:opacity-50", font.body.semiBold)}
                style={{
                  backgroundColor: lightTheme.fill.normal,
                  color: lightTheme.label.alternative,
                }}
              >
                취소
              </button>
              <button
                type="submit"
                disabled={isPending || code.length === 0}
                className={cn("h-12 rounded-xl disabled:opacity-50", font.body.semiBold)}
                style={{
                  backgroundColor: lightTheme.primary.normal,
                  color: lightTheme.label.buttonText,
                }}
              >
                {isPending ? "확인 중…" : "확인"}
              </button>
            </div>
          </form>
        </ModalShell>
      )}
    </div>
  );
};

export default MaintenancePage;
