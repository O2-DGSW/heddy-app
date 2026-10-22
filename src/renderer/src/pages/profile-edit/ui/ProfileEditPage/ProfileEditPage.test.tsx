// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, expect, test, vi } from "vitest";

import ProfileEditPage from ".";

const mocks = vi.hoisted(() => ({ profileEdit: vi.fn(), back: vi.fn(), retry: vi.fn() }));
vi.mock("../../model/useProfileEdit", () => ({ useProfileEdit: mocks.profileEdit }));

const ready = {
  formValues: { nickname: "테스트", password: "", phone: "", email: "" },
  handleBack: mocks.back,
  handleRetry: mocks.retry,
  handleChange: vi.fn(),
  handleSave: vi.fn(),
  handleStyleSelect: vi.fn(),
  isLoading: false,
  hasLoadError: false,
  isSaving: false,
  profileName: "테스트",
};

beforeEach(() => mocks.profileEdit.mockReturnValue(ready));
afterEach(cleanup);

test("처음 불러올 때 빈 입력과 저장 버튼을 노출하지 않고 뒤로가기는 유지한다", () => {
  mocks.profileEdit.mockReturnValue({ ...ready, isLoading: true });
  const { rerender } = render(<ProfileEditPage />);
  expect(screen.getByRole("status", { name: "회원정보를 불러오는 중" })).toBeTruthy();
  expect(screen.queryByRole("textbox")).toBeNull();
  expect(screen.queryByRole("button", { name: "저장" })).toBeNull();
  fireEvent.click(screen.getByRole("button", { name: "프로필로 돌아가기" }));
  expect(mocks.back).toHaveBeenCalledOnce();

  mocks.profileEdit.mockReturnValue(ready);
  rerender(<ProfileEditPage />);
  expect(screen.queryByRole("status")).toBeNull();
  expect(screen.getByRole("textbox", { name: "이름 또는 닉네임" }).getAttribute("value")).toBe(
    "테스트"
  );
  expect(screen.getByRole("button", { name: "저장" })).toBeTruthy();
});

test("초기 조회 실패는 빈 폼으로 전환하지 않고 재시도를 제공한다", () => {
  mocks.profileEdit.mockReturnValue({ ...ready, hasLoadError: true });
  render(<ProfileEditPage />);
  expect(screen.getByRole("alert").textContent).toContain("회원정보를 불러오지 못했습니다");
  expect(screen.queryByRole("textbox")).toBeNull();
  fireEvent.click(screen.getByRole("button", { name: "다시 시도" }));
  expect(mocks.retry).toHaveBeenCalledOnce();
});

test("저장 중에는 스켈레톤으로 돌아가지 않고 입력 폼을 유지한다", () => {
  mocks.profileEdit.mockReturnValue({ ...ready, isSaving: true });
  render(<ProfileEditPage />);
  expect(screen.queryByRole("status")).toBeNull();
  expect(screen.getByRole("textbox", { name: "이름 또는 닉네임" })).toBeTruthy();
  expect(screen.getByRole("button", { name: "저장 중" }).hasAttribute("disabled")).toBe(true);
});
