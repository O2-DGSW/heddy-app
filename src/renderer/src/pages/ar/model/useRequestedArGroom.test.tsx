// @vitest-environment jsdom
import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useRequestedArGroom } from "./useRequestedArGroom";

const state = vi.hoisted(() => ({
  location: { pathname: "/ar", search: "?groom=guile-cut", key: "first" },
  toast: vi.fn(),
}));
vi.mock("react-router-dom", () => ({ useLocation: () => state.location }));
vi.mock("@/shared", () => ({ showInfoToast: state.toast }));
const options = [
  { name: "guile-cut", label: "가일컷" },
  { name: "bob-cut", label: "보브컷" },
];

beforeEach(() => {
  state.location = { pathname: "/ar", search: "?groom=guile-cut", key: "first" };
  state.toast.mockClear();
});

describe("추천 스타일 AR 진입", () => {
  it("비동기 목록을 기다리고 선택 후 사용자의 변경을 덮어쓰지 않는다", () => {
    const select = vi.fn();
    const { rerender } = renderHook(
      ({ pending }) => useRequestedArGroom(pending ? [] : options, pending, select),
      {
        initialProps: { pending: true },
      }
    );
    expect(select).not.toHaveBeenCalled();
    rerender({ pending: false });
    expect(select).toHaveBeenCalledWith("guile-cut");
    rerender({ pending: false });
    expect(select).toHaveBeenCalledTimes(1);
  });

  it("캐시된 AR 페이지에 다른 추천으로 재진입하면 새 스타일을 적용한다", () => {
    const select = vi.fn();
    const { rerender } = renderHook(() => useRequestedArGroom(options, false, select));
    act(() => {
      state.location = { pathname: "/ar", search: "?groom=bob-cut", key: "second" };
    });
    rerender();
    expect(select.mock.calls).toEqual([["guile-cut"], ["bob-cut"]]);
  });

  it("존재하지 않는 스타일은 원본 화면으로 돌리고 안내한다", () => {
    state.location.search = "?groom=missing";
    const select = vi.fn();
    renderHook(() => useRequestedArGroom(options, false, select));
    expect(select).toHaveBeenCalledExactlyOnceWith("");
    expect(state.toast).toHaveBeenCalledTimes(1);
  });

  it("일반 AR 진입이나 다른 화면에서는 자동 선택하지 않는다", () => {
    state.location.search = "";
    const select = vi.fn();
    const { rerender } = renderHook(() => useRequestedArGroom(options, false, select));
    state.location = { pathname: "/recommend", search: "?groom=guile-cut", key: "other" };
    rerender();
    expect(select).not.toHaveBeenCalled();
  });
});
