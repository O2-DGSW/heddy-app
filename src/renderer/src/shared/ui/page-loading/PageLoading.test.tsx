// @vitest-environment jsdom
import { act, cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, test, vi } from "vitest";

import { PageLoading } from "./PageLoading";

describe("PageLoading", () => {
  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  test("지연 시간이 지나기 전에는 그리지 않아 금방 끝나는 확인에서 깜빡이지 않는다", () => {
    vi.useFakeTimers();
    render(<PageLoading delayMs={300} />);

    expect(screen.queryByRole("status")).toBeNull();

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(screen.getByRole("status").textContent).toContain("불러오는 중");
  });
});
