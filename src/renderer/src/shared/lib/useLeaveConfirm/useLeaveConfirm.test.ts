// @vitest-environment jsdom
import { act, renderHook } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";

import { useLeaveConfirm } from ".";

const createContainer = () => {
  const outlet = document.createElement("cap-router-outlet");
  const page = document.createElement("section");
  outlet.appendChild(page);
  document.body.appendChild(outlet);

  return { outlet, containerRef: { current: page } };
};

describe("useLeaveConfirm", () => {
  test("입력이 없으면 확인 없이 바로 떠난다", () => {
    const onLeave = vi.fn();
    const { containerRef } = createContainer();
    const { result } = renderHook(() => useLeaveConfirm({ isDirty: false, containerRef, onLeave }));

    act(() => result.current.requestLeave());

    expect(onLeave).toHaveBeenCalledOnce();
    expect(result.current.isLeaveConfirmOpen).toBe(false);
  });

  test("입력이 있으면 확인 창을 열고, 확인해야 떠난다", () => {
    const onLeave = vi.fn();
    const { containerRef } = createContainer();
    const { result } = renderHook(() => useLeaveConfirm({ isDirty: true, containerRef, onLeave }));

    act(() => result.current.requestLeave());
    expect(result.current.isLeaveConfirmOpen).toBe(true);
    expect(onLeave).not.toHaveBeenCalled();

    act(() => result.current.cancelLeave());
    expect(result.current.isLeaveConfirmOpen).toBe(false);

    act(() => result.current.requestLeave());
    act(() => result.current.confirmLeave());
    expect(onLeave).toHaveBeenCalledOnce();
  });

  test("입력이 있는 동안만 스와이프 뒤로가기를 끄고, 끝나면 원래대로 돌린다", () => {
    const { outlet, containerRef } = createContainer();
    const { rerender, unmount } = renderHook(
      ({ isDirty }) => useLeaveConfirm({ isDirty, containerRef, onLeave: vi.fn() }),
      { initialProps: { isDirty: false } }
    );

    expect(outlet.hasAttribute("swipe-gesture")).toBe(false);

    rerender({ isDirty: true });
    expect(outlet.getAttribute("swipe-gesture")).toBe("false");

    rerender({ isDirty: false });
    expect(outlet.hasAttribute("swipe-gesture")).toBe(false);

    rerender({ isDirty: true });
    unmount();
    expect(outlet.hasAttribute("swipe-gesture")).toBe(false);
  });
});
