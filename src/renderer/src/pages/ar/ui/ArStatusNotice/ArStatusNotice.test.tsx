// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, test, vi } from "vitest";

import ArStatusNotice from ".";

import type { ComponentProps } from "react";

type ArStatusNoticeProps = ComponentProps<typeof ArStatusNotice>;

const renderNotice = (props: Partial<ArStatusNoticeProps> = {}) => {
  const handlers = {
    onReconnect: vi.fn(),
    onGroomRetry: vi.fn(),
    onForeheadRefresh: vi.fn(),
  };

  render(
    <ArStatusNotice
      connectionErrorMessage={null}
      connectionStatus="connected"
      foreheadState={{ status: "idle" }}
      groomState={{ status: "ok" }}
      {...handlers}
      {...props}
    />
  );

  return handlers;
};

describe("ArStatusNotice", () => {
  afterEach(cleanup);

  test("문제가 없으면 아무것도 그리지 않는다", () => {
    renderNotice();

    expect(screen.queryByRole("status")).toBeNull();
  });

  test("연결 오류는 스타일 오류보다 먼저 보이고 다시 연결할 수 있다", () => {
    const { onReconnect, onGroomRetry } = renderNotice({
      connectionStatus: "error",
      connectionErrorMessage: "AR 연결이 끊어졌습니다. 다시 연결해 주세요.",
      groomState: { status: "error", message: "스타일 오류" },
    });

    expect(screen.getByText("AR 연결이 끊어졌습니다. 다시 연결해 주세요.")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "다시 연결" }));
    expect(onReconnect).toHaveBeenCalledOnce();
    expect(onGroomRetry).not.toHaveBeenCalled();
  });

  test("스타일 적용 실패는 다시 시도 버튼을 보여 준다", () => {
    const { onGroomRetry } = renderNotice({
      groomState: { status: "error", message: "스타일을 적용하지 못했습니다. 다시 시도해 주세요." },
    });

    fireEvent.click(screen.getByRole("button", { name: "다시 시도" }));
    expect(onGroomRetry).toHaveBeenCalledOnce();
  });

  test("이마를 만드는 중이면 버튼 없이 기다리라는 안내만 보인다", () => {
    renderNotice({ foreheadState: { status: "loading" } });

    expect(screen.getByRole("status").textContent).toContain("이마를 만드는 중입니다");
    expect(screen.queryByRole("button")).toBeNull();
  });
});
