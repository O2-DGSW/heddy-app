// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, expect, test, vi } from "vitest";

import PreferredStyleRegistrationPage from ".";

const mocks = vi.hoisted(() => ({ tags: vi.fn(), preferences: vi.fn() }));
vi.mock("@/entities/style", () => ({
  useGetStyleTags: mocks.tags,
  useGetStylePreferences: mocks.preferences,
  usePutStylePreferences: () => ({ mutateAsync: vi.fn(), isPending: false }),
}));
afterEach(cleanup);

test("태그만 먼저 도착해도 선택 정보를 기다리고, 기존 데이터 재조회에는 선택을 유지한다", () => {
  const pending = { isFetching: true, refetch: vi.fn() };
  const tags = { items: [{ style_tag_id: "crop-cut", tag_name: "크롭컷" }] };
  const preferences = { preferred_tag_ids: ["crop-cut"], excluded_tag_ids: [] };
  mocks.tags.mockReturnValue(pending);
  mocks.preferences.mockReturnValue(pending);
  const page = () => (
    <MemoryRouter>
      <PreferredStyleRegistrationPage />
    </MemoryRouter>
  );
  const { rerender } = render(page());
  expect(screen.getByRole("status", { name: "스타일 태그를 불러오는 중" })).toBeTruthy();

  mocks.tags.mockReturnValue({ ...pending, data: tags, isFetching: false });
  rerender(page());
  expect(screen.getByRole("status", { name: "선택한 스타일을 불러오는 중" })).toBeTruthy();
  expect(screen.queryByRole("button", { name: "#크롭컷" })).toBeNull();

  mocks.preferences.mockReturnValue({ ...pending, data: preferences, isFetching: false });
  rerender(page());
  expect(screen.queryByRole("status")).toBeNull();
  expect(screen.getByRole("button", { name: "#크롭컷" }).getAttribute("aria-pressed")).toBe("true");

  mocks.tags.mockReturnValue({ ...pending, data: tags });
  mocks.preferences.mockReturnValue({ ...pending, data: preferences });
  rerender(page());
  expect(screen.queryByRole("status")).toBeNull();
  expect(screen.getByRole("button", { name: "#크롭컷" }).getAttribute("aria-pressed")).toBe("true");
});
