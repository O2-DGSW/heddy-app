// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, expect, test, vi } from "vitest";

import PullToRefresh from ".";

afterEach(cleanup);

const touch = (target: Element, type: string, x: number, y: number, fingers = 1) => {
  const event = new Event(type, { bubbles: true, cancelable: true });
  Object.defineProperty(event, "touches", {
    value:
      type === "touchend" || type === "touchcancel"
        ? []
        : Array.from({ length: fingers }, () => ({ clientX: x, clientY: y })),
  });
  fireEvent(target, event);
  return event;
};

const pull = (target: Element, deltaY = 160) => {
  touch(target, "touchstart", 10, 10);
  const move = touch(target, "touchmove", 10, 10 + deltaY);
  touch(target, "touchend", 10, 10 + deltaY);
  return move;
};

test("상단에서 충분히 당기면 조회를 한 번 갱신하고 입력값을 유지한다", async () => {
  const refresh = vi.fn().mockResolvedValue(undefined);
  render(
    <PullToRefresh onRefresh={refresh} resetKey="home">
      <main>
        <p>본문</p>
        <input aria-label="메모" defaultValue="작성 중인 내용" />
      </main>
    </PullToRefresh>
  );

  const input = screen.getByLabelText("메모");
  if (!(input instanceof HTMLInputElement)) throw new Error("메모 입력창이 없습니다.");
  fireEvent.change(input, { target: { value: "수정 중인 메모" } });
  expect(pull(screen.getByText("본문")).defaultPrevented).toBe(true);
  await waitFor(() => expect(refresh).toHaveBeenCalledTimes(1));
  expect(input.value).toBe("수정 중인 메모");
  await waitFor(() => expect(screen.queryByRole("status")).toBeNull());
});

test("임계 거리 미만, 가로 이동, 취소된 당김은 새로고침하지 않는다", () => {
  const refresh = vi.fn();
  render(
    <PullToRefresh onRefresh={refresh} resetKey="home">
      <p>본문</p>
    </PullToRefresh>
  );
  const target = screen.getByText("본문");
  pull(target, 80);
  touch(target, "touchstart", 0, 0);
  touch(target, "touchmove", 200, 50);
  touch(target, "touchend", 200, 50);
  touch(target, "touchstart", 0, 0);
  touch(target, "touchmove", 0, 200);
  touch(target, "touchcancel", 0, 200);
  touch(target, "touchend", 0, 200);
  expect(refresh).not.toHaveBeenCalled();
});

test("내부 목록이 내려가 있으면 당김을 가로채지 않는다", () => {
  const refresh = vi.fn();
  render(
    <PullToRefresh onRefresh={refresh} resetKey="cuts">
      <section data-testid="scroll">
        <p>목록</p>
      </section>
    </PullToRefresh>
  );
  screen.getByTestId("scroll").scrollTop = 100;
  expect(pull(screen.getByText("목록")).defaultPrevented).toBe(false);
  expect(refresh).not.toHaveBeenCalled();
});

test("입력창·모달·하단 메뉴에서 당겨도 새로고침하지 않는다", () => {
  const refresh = vi.fn();
  render(
    <PullToRefresh onRefresh={refresh} resetKey="edit">
      <input aria-label="메모" />
      <div role="dialog">
        <p>모달</p>
      </div>
      <nav>
        <button type="button">홈</button>
      </nav>
    </PullToRefresh>
  );
  pull(screen.getByLabelText("메모"));
  pull(screen.getByText("모달"));
  pull(screen.getByRole("button", { name: "홈" }));
  expect(refresh).not.toHaveBeenCalled();
});

test("조회 중 다시 당겨도 중복 요청을 만들지 않는다", async () => {
  const complete = vi.fn<() => void>();
  const pending = new Promise<void>(resolve => complete.mockImplementation(resolve));
  const refresh = vi.fn().mockReturnValue(pending);
  render(
    <PullToRefresh onRefresh={refresh} resetKey="home">
      <p>본문</p>
    </PullToRefresh>
  );
  const target = screen.getByText("본문");
  pull(target);
  await waitFor(() => expect(refresh).toHaveBeenCalledTimes(1));
  pull(target);
  expect(refresh).toHaveBeenCalledTimes(1);
  expect(screen.getByRole("status").textContent).toContain("새로고침 중이에요");
  await act(async () => complete());
});

test("페이지가 바뀌면 이전 당김을 취소하고 새 페이지에서도 사용할 수 있다", async () => {
  const refresh = vi.fn().mockResolvedValue(undefined);
  const { rerender } = render(
    <PullToRefresh onRefresh={refresh} resetKey="home">
      <p>본문</p>
    </PullToRefresh>
  );
  const target = screen.getByText("본문");
  touch(target, "touchstart", 0, 0);
  touch(target, "touchmove", 0, 200);
  rerender(
    <PullToRefresh onRefresh={refresh} resetKey="profile">
      <p>본문</p>
    </PullToRefresh>
  );
  touch(target, "touchend", 0, 200);
  expect(refresh).not.toHaveBeenCalled();
  expect(screen.queryByRole("status")).toBeNull();
  pull(target);
  await waitFor(() => expect(refresh).toHaveBeenCalledTimes(1));
});

test("조회 실패를 안내하고 다음 당김에서 다시 시도할 수 있다", async () => {
  const refresh = vi.fn().mockRejectedValueOnce(new Error("offline")).mockResolvedValue(undefined);
  render(
    <PullToRefresh onRefresh={refresh} resetKey="home">
      <p>본문</p>
    </PullToRefresh>
  );
  const target = screen.getByText("본문");
  pull(target);
  await waitFor(() =>
    expect(screen.getByRole("status").textContent).toContain("불러오지 못했어요")
  );
  pull(target);
  await waitFor(() => expect(refresh).toHaveBeenCalledTimes(2));
  await waitFor(() => expect(screen.queryByRole("status")).toBeNull());
});

test("두 손가락으로 바뀐 당김은 새로고침하지 않는다", async () => {
  const refresh = vi.fn();
  render(
    <PullToRefresh onRefresh={refresh} resetKey="home">
      <p>본문</p>
    </PullToRefresh>
  );
  const target = screen.getByText("본문");
  touch(target, "touchstart", 0, 0);
  touch(target, "touchmove", 0, 200);
  touch(target, "touchstart", 0, 200, 2);
  touch(target, "touchend", 0, 200);
  await act(async () => undefined);
  expect(refresh).not.toHaveBeenCalled();
});
