// @vitest-environment jsdom
import { Capacitor } from "@capacitor/core";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import type { AppState } from "@capacitor/app";

const { removeListener, addListener } = vi.hoisted(() => ({
  removeListener: vi.fn().mockResolvedValue(undefined),
  addListener: vi.fn(),
}));

vi.mock("@capacitor/app", () => ({ App: { addListener } }));

vi.mock("./maintenance", async importOriginal => ({
  ...(await importOriginal<typeof import("./maintenance")>()),
  // 해시 검증은 Node 환경의 maintenance.test.ts에서 실제 Web Crypto로 검증한다.
  verifyMaintenanceCode: vi.fn(),
}));

import MaintenanceGate from ".";
import { verifyMaintenanceCode } from "./maintenance";

let handleAppStateChange: (state: AppState) => void;
const renderGate = () =>
  render(
    <MaintenanceGate>
      <p>정상 앱</p>
    </MaintenanceGate>
  );
const tapWarning = (count = 7) => {
  const warning = screen.getByRole("button", { name: "점검 안내" });
  for (let index = 0; index < count; index += 1) fireEvent.click(warning);
};
const submitCode = async (code: string) => {
  fireEvent.change(screen.getByLabelText("6자리 비밀번호를 입력해 주세요."), {
    target: { value: code },
  });
  await act(async () => {
    fireEvent.click(screen.getByRole("button", { name: "확인" }));
  });
};

beforeEach(() => {
  vi.useFakeTimers({ toFake: ["Date", "setTimeout", "clearTimeout"] });
  vi.setSystemTime(new Date("2026-10-21T12:00:00+09:00"));
  vi.mocked(verifyMaintenanceCode).mockImplementation(async code => code === "020202");
  vi.spyOn(Capacitor, "isNativePlatform").mockReturnValue(true);
  addListener.mockImplementation((_event: string, listener: typeof handleAppStateChange) => {
    handleAppStateChange = listener;
    return Promise.resolve({ remove: removeListener });
  });
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.clearAllMocks();
});

describe("점검 진입 차단", () => {
  test("현재도 앱 대신 점검 화면을 표시한다", () => {
    renderGate();
    expect(screen.getByRole("heading", { name: "서비스 점검 중입니다" })).toBeTruthy();
    expect(screen.queryByText("정상 앱")).toBeNull();
  });

  test("네이티브에서 7번 연타한 뒤에만 입력창이 열린다", () => {
    renderGate();
    tapWarning(6);
    expect(screen.queryByRole("dialog")).toBeNull();
    tapWarning(1);
    expect(screen.getByRole("dialog")).toBeTruthy();
    expect(document.activeElement).toBe(screen.getByLabelText("6자리 비밀번호를 입력해 주세요."));
  });

  test("연타 간격이 지나면 횟수를 초기화한다", () => {
    renderGate();
    tapWarning(6);
    act(() => vi.advanceTimersByTime(701));
    tapWarning(1);
    expect(screen.queryByRole("dialog")).toBeNull();
    tapWarning(6);
    expect(screen.getByRole("dialog")).toBeTruthy();
  });

  test("웹에서는 경고 이모지를 연타해도 입력창이 열리지 않는다", () => {
    vi.mocked(Capacitor.isNativePlatform).mockReturnValue(false);
    renderGate();
    for (let index = 0; index < 10; index += 1)
      fireEvent.click(screen.getByRole("img", { name: "점검 안내" }));
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(screen.queryByText("정상 앱")).toBeNull();
  });

  test("잘못된 코드는 차단하고 올바른 코드를 입력하면 앱을 표시한다", async () => {
    renderGate();
    tapWarning();
    await submitCode("123456");
    expect(screen.getByRole("alert").textContent).toBe("비밀번호가 일치하지 않습니다.");
    expect(screen.queryByText("정상 앱")).toBeNull();
    await submitCode("020202");
    expect(screen.getByText("정상 앱")).toBeTruthy();
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  test("앱을 새로 실행하면 허용 상태를 유지하지 않는다", async () => {
    const view = renderGate();
    tapWarning();
    await submitCode("020202");
    expect(screen.getByText("정상 앱")).toBeTruthy();
    view.unmount();
    renderGate();
    expect(screen.queryByText("정상 앱")).toBeNull();
  });

  test("코드 검증에 실패하면 앱을 열지 않고 재시도를 허용한다", async () => {
    vi.mocked(verifyMaintenanceCode).mockRejectedValueOnce(new Error("검증 실패"));
    renderGate();
    tapWarning();
    await submitCode("020202");
    expect(screen.getByRole("alert").textContent).toContain("다시 시도해 주세요.");
    expect(screen.queryByText("정상 앱")).toBeNull();
    await submitCode("020202");
    expect(screen.getByText("정상 앱")).toBeTruthy();
  });

  test("숫자 6자리가 되기 전에는 확인할 수 없다", () => {
    renderGate();
    tapWarning();
    const input = screen.getByLabelText<HTMLInputElement>("6자리 비밀번호를 입력해 주세요.");
    fireEvent.change(input, { target: { value: "01a234" } });
    expect(input.value).toBe("01234");
    expect(screen.getByRole<HTMLButtonElement>("button", { name: "확인" }).disabled).toBe(true);
    fireEvent.change(input, { target: { value: "0123456789" } });
    expect(input.value).toBe("012345");
    expect(screen.getByRole<HTMLButtonElement>("button", { name: "확인" }).disabled).toBe(false);
  });

  test("취소하면 입력을 지우고 경고 버튼으로 포커스를 돌린다", () => {
    renderGate();
    tapWarning();
    fireEvent.change(screen.getByLabelText("6자리 비밀번호를 입력해 주세요."), {
      target: { value: "123" },
    });
    fireEvent.click(screen.getByRole("button", { name: "취소" }));
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "점검 안내" }));
    tapWarning();
    expect(screen.getByLabelText<HTMLInputElement>("6자리 비밀번호를 입력해 주세요.").value).toBe(
      ""
    );
  });

  test("정식 점검 종료 시각에 열려 있는 화면도 자동 해제한다", () => {
    vi.setSystemTime(new Date("2026-10-22T20:59:59.500+09:00"));
    renderGate();
    act(() => vi.advanceTimersByTime(499));
    expect(screen.queryByText("정상 앱")).toBeNull();
    act(() => vi.advanceTimersByTime(1));
    expect(screen.getByText("정상 앱")).toBeTruthy();
    // 종료 이후 타이머가 매 밀리초 실행되는 회귀를 막는다.
    expect(vi.getTimerCount()).toBe(1);
    act(() => vi.advanceTimersByTime(60_000));
    expect(screen.getByText("정상 앱")).toBeTruthy();
  });

  test("사전 점검 시작 시 이미 열린 앱도 차단한다", () => {
    vi.setSystemTime(new Date("2026-10-20T23:59:59.999+09:00"));
    renderGate();
    expect(screen.getByText("정상 앱")).toBeTruthy();
    act(() => vi.advanceTimersByTime(1));
    expect(screen.queryByText("정상 앱")).toBeNull();
  });

  test("종료 후 네이티브 앱으로 복귀하면 즉시 해제한다", () => {
    renderGate();
    vi.setSystemTime(new Date("2026-10-22T21:00:00+09:00"));
    act(() => handleAppStateChange({ isActive: true }));
    expect(screen.getByText("정상 앱")).toBeTruthy();
  });

  test("점검 종료 후 새로 실행하면 바로 앱을 표시한다", () => {
    vi.setSystemTime(new Date("2026-10-22T21:00:00+09:00"));
    renderGate();
    expect(screen.getByText("정상 앱")).toBeTruthy();
  });
});
