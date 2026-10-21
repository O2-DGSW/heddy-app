// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, expect, test, vi } from "vitest";

import ProfilePage from ".";

const mocks = vi.hoisted(() => ({ profile: vi.fn(), records: vi.fn(), shares: vi.fn() }));
vi.mock("@/entities/profile", () => ({ useGetMyProfile: mocks.profile }));
vi.mock("@/entities/record", () => ({ useGetTreatmentRecords: mocks.records }));
vi.mock("@/entities/share", () => ({ useGetShares: mocks.shares }));
vi.mock("@/features/auth/logout", () => ({
  useLogout: () => ({ handleLogout: vi.fn(), isPending: false }),
}));
vi.mock("@/features/auth/delete-account", () => ({ AccountDeletionModal: () => null }));

afterEach(cleanup);
const page = () => (
  <MemoryRouter>
    <ProfilePage />
  </MemoryRouter>
);

test("프로필 첫 조회에서도 고정 메뉴와 통계 항목명을 유지하고 완료 시 숫자를 표시한다", () => {
  mocks.profile.mockReturnValue({ isLoading: true });
  mocks.records.mockReturnValue({ isPending: true });
  mocks.shares.mockReturnValue({ isPending: true });
  const { rerender } = render(page());
  expect(screen.getByRole("status", { name: "프로필을 불러오는 중" })).toBeTruthy();
  expect(screen.getByRole("status", { name: "시술 기록과 공유 현황을 불러오는 중" })).toBeTruthy();
  expect(screen.getByRole("button", { name: "회원정보 수정" })).toBeTruthy();
  expect(screen.getByRole("button", { name: "선호 스타일 등록" })).toBeTruthy();
  expect(screen.getByRole("button", { name: "공유 권한 관리" })).toBeTruthy();
  expect(screen.getByText("시술 기록")).toBeTruthy();
  expect(screen.getByText("공유 중")).toBeTruthy();
  expect(screen.queryByText("0")).toBeNull();

  mocks.profile.mockReturnValue({ isLoading: false, data: { nickname: "테스트" } });
  mocks.records.mockReturnValue({ isPending: false, data: { page: { total_elements: 3 } } });
  mocks.shares.mockReturnValue({ isPending: false, data: { page: { total_elements: 1 } } });
  rerender(page());
  expect(screen.queryByRole("status")).toBeNull();
  expect(screen.getByRole("heading", { name: "테스트님" })).toBeTruthy();
  expect(screen.getByText("3")).toBeTruthy();
  expect(screen.getByText("1")).toBeTruthy();
});
