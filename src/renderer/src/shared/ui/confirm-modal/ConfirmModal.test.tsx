// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, test, vi } from "vitest";

import { ConfirmModal } from "./ConfirmModal";

describe("ConfirmModal", () => {
  afterEach(cleanup);

  test("제목으로 대화상자 이름을 정하고 확인·취소를 각각 부른다", () => {
    const onConfirm = vi.fn();
    const onCancel = vi.fn();

    render(
      <ConfirmModal
        confirmLabel="삭제"
        onCancel={onCancel}
        onConfirm={onConfirm}
        title="삭제할까요?"
        tone="danger"
      />
    );

    expect(screen.getByRole("dialog", { name: "삭제할까요?" })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "삭제" }));
    fireEvent.click(screen.getAllByRole("button", { name: "취소" })[1]);
    expect(onConfirm).toHaveBeenCalledOnce();
    expect(onCancel).toHaveBeenCalledOnce();
  });

  test("처리 중에는 버튼과 바깥 닫기를 막는다", () => {
    const onCancel = vi.fn();

    render(
      <ConfirmModal
        confirmLabel="삭제 중"
        isPending
        onCancel={onCancel}
        onConfirm={vi.fn()}
        title="삭제할까요?"
      />
    );

    expect(screen.getByRole("button", { name: "삭제 중" }).hasAttribute("disabled")).toBe(true);
    // 처리 중에는 바깥 닫기 버튼 자체를 그리지 않아 취소 버튼 하나만 남는다
    expect(screen.getAllByRole("button", { name: "취소" })).toHaveLength(1);
  });
});
