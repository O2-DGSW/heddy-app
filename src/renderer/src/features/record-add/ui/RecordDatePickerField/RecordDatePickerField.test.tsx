// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, test, vi } from "vitest";

import { BottomBarVisibilityProvider } from "@/shared";

import RecordDatePickerField from ".";

const renderField = (value: string, onChange = vi.fn()) => {
  render(
    <BottomBarVisibilityProvider>
      <RecordDatePickerField value={value} onChange={onChange} />
    </BottomBarVisibilityProvider>
  );

  return onChange;
};

afterEach(() => {
  cleanup();
});

describe("RecordDatePickerField", () => {
  test("날짜를 고르고 확인을 눌러야 폼 값이 바뀐다", () => {
    const onChange = renderField("2026-03-05");

    fireEvent.click(screen.getByRole("button", { name: "날짜 선택" }));
    expect(screen.getByRole("dialog")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "20일" }));
    expect(onChange).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: "확인" }));
    expect(onChange).toHaveBeenCalledWith("2026-03-20");
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  test("다음 달로 넘긴 뒤 고르면 그 달의 날짜가 된다", () => {
    const onChange = renderField("2026-03-05");

    fireEvent.click(screen.getByRole("button", { name: "날짜 선택" }));
    fireEvent.click(screen.getByRole("button", { name: "다음 달" }));
    expect(screen.getByText("2026. 4")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "10일" }));
    fireEvent.click(screen.getByRole("button", { name: "확인" }));

    expect(onChange).toHaveBeenCalledWith("2026-04-10");
  });

  test("닫으면 고른 날짜를 버리고 폼 값을 바꾸지 않는다", () => {
    const onChange = renderField("2026-03-05");

    fireEvent.click(screen.getByRole("button", { name: "날짜 선택" }));
    fireEvent.click(screen.getByRole("button", { name: "20일" }));
    fireEvent.keyDown(window, { key: "Escape" });

    expect(screen.queryByRole("dialog")).toBeNull();
    expect(onChange).not.toHaveBeenCalled();
  });
});
