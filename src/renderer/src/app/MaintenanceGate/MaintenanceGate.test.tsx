// @vitest-environment jsdom
import { Capacitor } from "@capacitor/core";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import type { AppState } from "@capacitor/app";
import { MemoryRouter } from "react-router-dom";

const { removeListener, addListener, exitApp } = vi.hoisted(() => ({
  removeListener: vi.fn().mockResolvedValue(undefined),
  addListener: vi.fn(),
  exitApp: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@capacitor/app", () => ({ App: { addListener, exitApp } }));

vi.mock("./maintenance", async importOriginal => ({
  ...(await importOriginal<typeof import("./maintenance")>()),
  // 해시 검증은 Node 환경의 maintenance.test.ts에서 실제 Web Crypto로 검증한다.
  verifyMaintenanceCode: vi.fn(),
}));

import MaintenanceGate from ".";
import { verifyMaintenanceCode } from "./maintenance";

let handleAppStateChange: (state: AppState) => void;
const renderGate = (path = "/login") =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <MaintenanceGate>
        <p>정상 앱</p>
      </MaintenanceGate>
    </MemoryRouter>
  );
const tapWarning = (count = 7) => {
  const warning = screen.getByRole("button", { name: "점검 안내" });
  for (let index = 0; index < count; index += 1) fireEvent.click(warning);
};
const submitCode = async (code: string) => {
  fireEvent.change(screen.getByLabelText("비밀번호를 입력해 주세요."), {
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
  vi.spyOn(Capacitor, "getPlatform").mockReturnValue("ios");
  vi.spyOn(window, "close").mockImplementation(() => undefined);
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
    expect(document.activeElement).toBe(screen.getByLabelText("비밀번호를 입력해 주세요."));
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

  test("웹에서도 7번 연타한 뒤 올바른 비밀번호로 앱을 사용할 수 있다", async () => {
    vi.mocked(Capacitor.isNativePlatform).mockReturnValue(false);
    renderGate();
    tapWarning(6);
    expect(screen.queryByRole("dialog")).toBeNull();
    tapWarning(1);
    expect(screen.getByRole("dialog")).toBeTruthy();
    await submitCode("020202");
    expect(screen.getByText("정상 앱")).toBeTruthy();
    expect(addListener).not.toHaveBeenCalled();
  });

  test("넓은 웹 화면은 기존 목업을 표시하고 좁아지면 숨긴다", () => {
    vi.mocked(Capacitor.isNativePlatform).mockReturnValue(false);
    const originalWidth = window.innerWidth;
    vi.spyOn(window, "innerWidth", "get").mockReturnValue(1024);
    renderGate("/home");
    expect(screen.getByText("9:41")).toBeTruthy();
    expect(screen.queryByRole("navigation")).toBeNull();
    vi.spyOn(window, "innerWidth", "get").mockReturnValue(390);
    fireEvent(window, new Event("resize"));
    expect(screen.queryByText("9:41")).toBeNull();
    expect(screen.getByRole("button", { name: "점검 안내" })).toBeTruthy();
    vi.spyOn(window, "innerWidth", "get").mockReturnValue(originalWidth);
  });

  test("네이티브에서는 목업과 하단 메뉴 없이 점검 화면을 표시한다", () => {
    renderGate("/home");
    expect(screen.queryByText("9:41")).toBeNull();
    expect(screen.queryByRole("navigation")).toBeNull();
    expect(screen.getByRole("heading", { name: "서비스 점검 중입니다" })).toBeTruthy();
  });

  test("올바른 코드를 입력하면 앱을 표시한다", async () => {
    renderGate();
    tapWarning();
    await submitCode("020202");
    expect(screen.getByText("정상 앱")).toBeTruthy();
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  test.each(["1", "123456", "0202020"])(
    "Android에서 틀린 코드 %s를 입력하면 앱을 종료한다",
    async code => {
      vi.mocked(Capacitor.getPlatform).mockReturnValue("android");
      renderGate();
      tapWarning();
      await submitCode(code);
      expect(exitApp).toHaveBeenCalledTimes(1);
      expect(screen.getByRole("heading", { name: "앱 이용이 종료되었습니다" })).toBeTruthy();
      expect(screen.queryByRole("dialog")).toBeNull();
      expect(screen.queryByRole("button", { name: "점검 안내" })).toBeNull();
      expect(screen.queryByText("정상 앱")).toBeNull();
    }
  );

  test("Android 종료 API가 실패해도 재입력을 허용하지 않는다", async () => {
    vi.mocked(Capacitor.getPlatform).mockReturnValue("android");
    exitApp.mockRejectedValueOnce(new Error("종료 실패"));
    renderGate();
    tapWarning();
    await submitCode("1");
    expect(screen.getByRole("heading", { name: "앱 이용이 종료되었습니다" })).toBeTruthy();
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  test("웹은 탭 닫기를 요청하고 닫히지 않아도 이용을 종료한다", async () => {
    vi.mocked(Capacitor.isNativePlatform).mockReturnValue(false);
    vi.mocked(Capacitor.getPlatform).mockReturnValue("web");
    renderGate();
    tapWarning();
    await submitCode("1");
    expect(window.close).toHaveBeenCalledTimes(1);
    expect(exitApp).not.toHaveBeenCalled();
    expect(screen.getByRole("heading", { name: "앱 이용이 종료되었습니다" })).toBeTruthy();
    expect(screen.queryByText("정상 앱")).toBeNull();
  });

  test("iOS에서 오입력하면 종료 화면을 유지하고 재실행 시에만 다시 입력할 수 있다", async () => {
    const view = renderGate();
    tapWarning();
    await submitCode("1");
    expect(exitApp).not.toHaveBeenCalled();
    expect(window.close).not.toHaveBeenCalled();
    expect(screen.getByRole("heading", { name: "앱 이용이 종료되었습니다" })).toBeTruthy();
    view.unmount();
    renderGate();
    tapWarning();
    await submitCode("020202");
    expect(screen.getByText("정상 앱")).toBeTruthy();
  });

  test("오입력으로 종료된 화면은 점검 종료 시각이 지나도 앱으로 전환되지 않는다", async () => {
    renderGate();
    tapWarning();
    await submitCode("1");
    vi.setSystemTime(new Date("2026-10-22T21:00:00+09:00"));
    act(() => handleAppStateChange({ isActive: true }));
    expect(screen.getByRole("heading", { name: "앱 이용이 종료되었습니다" })).toBeTruthy();
    expect(screen.queryByText("정상 앱")).toBeNull();
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

  test("길이 안내 없이 한 자리부터 확인할 수 있고 입력 길이를 제한하지 않는다", () => {
    renderGate();
    tapWarning();
    const input = screen.getByLabelText<HTMLInputElement>("비밀번호를 입력해 주세요.");
    expect(screen.queryByText(/6자리/)).toBeNull();
    expect(screen.getByRole<HTMLButtonElement>("button", { name: "확인" }).disabled).toBe(true);
    fireEvent.change(input, { target: { value: "1" } });
    expect(screen.getByRole<HTMLButtonElement>("button", { name: "확인" }).disabled).toBe(false);
    fireEvent.change(input, { target: { value: "0123456789" } });
    expect(input.value).toBe("0123456789");
    expect(screen.getByRole<HTMLButtonElement>("button", { name: "확인" }).disabled).toBe(false);
  });

  test("배경을 눌러도 입력창이 닫히지 않는다", () => {
    renderGate();
    tapWarning();
    const dialog = screen.getByRole("dialog");
    const backdrop = dialog.querySelector('[aria-hidden="true"]');
    expect(backdrop).toBeTruthy();
    if (!backdrop) throw new Error("모달 배경이 없습니다.");
    fireEvent.click(backdrop);
    expect(screen.getByRole("dialog")).toBeTruthy();
    expect(screen.queryByRole("button", { name: "닫기" })).toBeNull();
  });

  test("취소하면 입력을 지우고 경고 버튼으로 포커스를 돌린다", () => {
    renderGate();
    tapWarning();
    fireEvent.change(screen.getByLabelText("비밀번호를 입력해 주세요."), {
      target: { value: "123" },
    });
    fireEvent.click(screen.getByRole("button", { name: "취소" }));
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "점검 안내" }));
    tapWarning();
    expect(screen.getByLabelText<HTMLInputElement>("비밀번호를 입력해 주세요.").value).toBe("");
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
