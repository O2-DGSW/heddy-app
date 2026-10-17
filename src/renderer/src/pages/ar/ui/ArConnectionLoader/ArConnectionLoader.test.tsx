// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import ArConnectionLoader from ".";

beforeEach(() => {
  vi.useFakeTimers();
  vi.stubGlobal(
    "matchMedia",
    vi.fn(() => ({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() }))
  );
});
afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

test("최초 연결은 움직이는 점 영역과 준비 문구를 보여준다", () => {
  render(<ArConnectionLoader feedback="connecting" onRetry={vi.fn()} />);
  expect(
    screen.getByText("AR을 생성하고 있어요").querySelector('[aria-hidden="true"]')?.textContent
  ).toBe("...");
  expect(screen.queryByRole("button")).toBeNull();
});
test("장시간 대기는 인터넷 장애로 단정하지 않으며 단계별 안내를 표시한다", () => {
  render(<ArConnectionLoader feedback="connecting" onRetry={vi.fn()} />);
  act(() => vi.advanceTimersByTime(12_000));
  expect(screen.getByText("연결이 조금 늦어지고 있어요")).toBeTruthy();
  act(() => vi.advanceTimersByTime(18_000));
  expect(screen.getByText("인터넷이나 AR 서버 응답이 늦어지고 있어요")).toBeTruthy();
  expect(screen.queryByText("인터넷 연결이 끊겼어요")).toBeNull();
});
test("오프라인은 즉시 네트워크 안내를 표시하고 자동 복귀를 알린다", () => {
  render(<ArConnectionLoader feedback="offline" onRetry={vi.fn()} />);
  expect(screen.getByText("인터넷 연결이 끊겼어요")).toBeTruthy();
  expect(screen.getByText("Wi-Fi나 데이터를 켜면 자동으로 연결돼요")).toBeTruthy();
  expect(screen.queryByRole("button")).toBeNull();
});
test("권한 거부는 조치 안내와 실제 재시도 동작을 제공한다", () => {
  const retry = vi.fn();
  render(<ArConnectionLoader feedback="permission" onRetry={retry} />);
  act(() => vi.advanceTimersByTime(60_000));
  expect(screen.getByText("카메라 권한이 필요해요")).toBeTruthy();
  fireEvent.click(screen.getByRole("button", { name: "다시 시도" }));
  expect(retry).toHaveBeenCalledTimes(1);
});
test("카메라 권한 대기는 네트워크 안내로 바뀌지 않는다", () => {
  render(<ArConnectionLoader feedback="camera" onRetry={vi.fn()} />);
  act(() => vi.advanceTimersByTime(60_000));
  expect(screen.getByText("카메라 권한 요청이 보이면 허용해 주세요")).toBeTruthy();
  expect(screen.queryByText(/인터넷/)).toBeNull();
});
