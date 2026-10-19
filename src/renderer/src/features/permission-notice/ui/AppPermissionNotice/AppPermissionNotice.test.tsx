// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

const platform = vi.hoisted(() => ({ isNative: true }));

vi.mock("@capacitor/core", async importOriginal => ({
  ...(await importOriginal<typeof import("@capacitor/core")>()),
  Capacitor: { isNativePlatform: () => platform.isNative, getPlatform: () => "android" },
}));

import AppPermissionNotice from ".";

describe("AppPermissionNotice", () => {
  beforeEach(() => {
    window.localStorage.clear();
    platform.isNative = true;
  });
  afterEach(cleanup);

  test("앱 첫 실행에 필수·선택 권한과 목적을 알리고, 확인하면 다시 띄우지 않는다", () => {
    const { unmount } = render(<AppPermissionNotice />);

    expect(screen.getByRole("dialog", { name: "앱 접근 권한 안내" })).toBeTruthy();
    expect(screen.getByText("필수 접근 권한")).toBeTruthy();
    expect(screen.getByText("선택 접근 권한")).toBeTruthy();
    expect(screen.getByText("카메라")).toBeTruthy();
    expect(
      screen.getByText(/허용하지 않아도 해당 기능 외의 서비스는 이용할 수 있어요/)
    ).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "확인" }));
    expect(screen.queryByRole("dialog")).toBeNull();

    unmount();
    render(<AppPermissionNotice />);
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  test("웹에서는 브라우저가 권한을 묻기 때문에 띄우지 않는다", () => {
    platform.isNative = false;
    render(<AppPermissionNotice />);

    expect(screen.queryByRole("dialog")).toBeNull();
  });
});
