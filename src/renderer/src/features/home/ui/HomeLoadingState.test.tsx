// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, expect, test, vi } from "vitest";

import RecommendationSection from "./RecommendationSection";
import RecentRecordCard from "./RecentRecordCard";
import ArStyleSection from "./ArStyleSection";
import type { RecommendationCardType } from "../model/home.types";

afterEach(cleanup);

const card: RecommendationCardType = {
  id: "style-1",
  rank: 1,
  title: "기존 추천 스타일",
  imageUrl: "",
  colorName: "",
  tags: [],
  matchRate: 85,
};
const actions = { onMoreClick: vi.fn(), onRecommendationClick: vi.fn() };

test("첫 추천을 불러올 때 스켈레톤을 표시하고 완료·오류 상태로 전환한다", () => {
  const { rerender } = render(
    <RecommendationSection {...actions} recommendations={[]} isLoading />
  );
  expect(screen.getByRole("status").textContent).toContain("나에게 어울리는 스타일을 찾고 있어요");
  expect(screen.queryByRole("button", { name: "나만의 추천 받기" })).toBeNull();

  rerender(<RecommendationSection {...actions} recommendations={[]} isError />);
  expect(screen.getByRole("status").textContent).toContain("정보를 불러오지 못했습니다");
  expect(screen.getByRole("button", { name: "다시 시도" })).toBeTruthy();

  rerender(<RecommendationSection {...actions} recommendations={[card]} />);
  expect(screen.queryByRole("status")).toBeNull();
  expect(screen.getByRole("button", { name: /기존 추천 스타일/ })).toBeTruthy();
});

test("재추천 도중에는 기존 카드를 유지하고 완료 후 새 카드로 교체한다", () => {
  const { rerender } = render(
    <RecommendationSection {...actions} recommendations={[card]} isRefreshing isGenerating />
  );
  expect(screen.getByRole("button", { name: /기존 추천 스타일/ })).toBeTruthy();
  expect(screen.getByRole("status").textContent).toBe("새 추천을 만들고 있어요");
  expect(screen.queryByText("나에게 어울리는 스타일을 찾고 있어요")).toBeNull();

  rerender(
    <RecommendationSection {...actions} recommendations={[{ ...card, title: "새 추천 스타일" }]} />
  );
  expect(screen.queryByRole("status")).toBeNull();
  expect(screen.queryByRole("button", { name: /기존 추천 스타일/ })).toBeNull();
  expect(screen.getByRole("button", { name: /새 추천 스타일/ })).toBeTruthy();
});

test("추천 갱신에 실패해도 기존 카드를 오류 화면으로 바꾸지 않는다", () => {
  render(<RecommendationSection {...actions} recommendations={[card]} isError />);
  expect(screen.getByRole("button", { name: /기존 추천 스타일/ })).toBeTruthy();
  expect(screen.queryByRole("button", { name: "다시 시도" })).toBeNull();
});

test("기록의 첫 조회는 스켈레톤을 표시하며 저장된 기록은 갱신 중에도 유지한다", () => {
  const handlers = { onClick: vi.fn(), onAddClick: vi.fn(), onRecordClick: vi.fn() };
  const { rerender } = render(<RecentRecordCard {...handlers} isLoading />);
  expect(screen.getByRole("status").textContent).toContain("헤어 기록을 불러오고 있어요");
  rerender(
    <RecentRecordCard
      {...handlers}
      isLoading
      record={{
        id: "record-1",
        date: "2026-10-21",
        procedureName: "커트",
        salonName: "미용실",
        designerName: "디자이너",
        rating: 5,
        thumbnailUrl: "",
      }}
    />
  );
  expect(screen.queryByRole("status")).toBeNull();
  expect(screen.getByText("커트")).toBeTruthy();
});

test("저장 스타일은 첫 조회에만 스켈레톤을 표시한다", () => {
  const handlers = { onRetry: vi.fn(), onArClick: vi.fn() };
  const { rerender } = render(
    <ArStyleSection {...handlers} styles={[]} isLoading isError={false} />
  );
  expect(screen.getByRole("status").textContent).toContain("저장한 스타일을 불러오고 있어요");
  rerender(
    <ArStyleSection
      {...handlers}
      styles={[{ id: "saved-1", name: "저장한 커트", imageUrl: "" }]}
      isLoading={false}
      isError
    />
  );
  expect(screen.queryByRole("status")).toBeNull();
  expect(screen.getByText("저장한 커트")).toBeTruthy();
});
