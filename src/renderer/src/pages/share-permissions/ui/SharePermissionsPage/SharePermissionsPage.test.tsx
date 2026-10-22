// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, expect, test, vi } from "vitest";

import SharePermissionsPage from ".";

const mocks = vi.hoisted(() => ({ consents: vi.fn(), shares: vi.fn() }));
vi.mock("@/entities/consent", () => ({
  useGetConsents: mocks.consents,
  usePutConsent: () => ({ mutateAsync: vi.fn(), isPending: false }),
}));
vi.mock("@/entities/share", () => ({
  useGetShares: mocks.shares,
  useDeleteShare: () => ({ mutateAsync: vi.fn(), isPending: false }),
}));
afterEach(cleanup);

test("동의와 공유 링크가 모두 준비된 뒤 토글을 표시하며 재조회에는 기존 상태를 유지한다", () => {
  const pending = { isFetching: true, refetch: vi.fn() };
  const consents = { items: [{ consent_type: "AI_TRAINING", granted: true }] };
  const shares = { items: [] };
  const page = () => (
    <MemoryRouter>
      <SharePermissionsPage />
    </MemoryRouter>
  );
  mocks.consents.mockReturnValue(pending);
  mocks.shares.mockReturnValue(pending);
  const { rerender } = render(page());
  expect(screen.getByRole("status", { name: "공유 권한 정보를 불러오는 중" })).toBeTruthy();

  mocks.consents.mockReturnValue({ ...pending, data: consents, isFetching: false });
  rerender(page());
  expect(screen.getByRole("status", { name: "공유 권한 정보를 불러오는 중" })).toBeTruthy();
  expect(screen.queryByRole("button", { name: /AI 학습/ })).toBeNull();

  mocks.shares.mockReturnValue({ ...pending, data: shares, isFetching: false });
  rerender(page());
  expect(screen.queryByRole("status")).toBeNull();
  expect(
    screen.getByRole("button", { name: "AI 학습 활용 동의 끄기" }).getAttribute("aria-pressed")
  ).toBe("true");

  mocks.consents.mockReturnValue({ ...pending, data: consents });
  mocks.shares.mockReturnValue({ ...pending, data: shares });
  rerender(page());
  expect(screen.queryByRole("status")).toBeNull();
  expect(
    screen.getByRole("button", { name: "AI 학습 활용 동의 끄기" }).getAttribute("aria-pressed")
  ).toBe("true");
});
