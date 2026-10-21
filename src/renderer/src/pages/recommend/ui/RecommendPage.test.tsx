// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, expect, test, vi } from "vitest";

import { RecommendPage } from "./RecommendPage";

const recommendation = vi.hoisted(() => vi.fn());
vi.mock("@/features/recommend/model/hooks/useRecommendation", () => ({
  useRecommendation: recommendation,
}));

const ready = {
  items: [
    {
      id: "style-1",
      styleName: "크롭컷",
      thumbnailUrl: "",
      arGroomName: "crop-cut",
      reasonType: null,
      riskLevel: null,
      reasonDescriptions: [],
      referenceRecordLabel: "",
    },
  ],
  basisRows: [{ label: "시술 이력", value: "1건" }],
  isPending: false,
  isEmpty: false,
  isError: false,
  isRefetching: false,
  isGenerating: false,
  generateError: null,
  refetch: vi.fn(),
  generate: vi.fn(),
};
const page = () => (
  <MemoryRouter>
    <RecommendPage />
  </MemoryRouter>
);
afterEach(cleanup);

test("추천 조회 전에는 AR 버튼을 노출하지 않고 완료되면 결과와 근거를 표시한다", () => {
  recommendation.mockReturnValue({ ...ready, items: [], basisRows: [], isPending: true });
  const { rerender } = render(page());
  expect(screen.getByRole("status", { name: "추천을 불러오는 중" })).toBeTruthy();
  expect(screen.getByRole("heading", { name: "스타일 추천" })).toBeTruthy();
  expect(screen.queryByRole("button", { name: /AR/ })).toBeNull();

  recommendation.mockReturnValue(ready);
  rerender(page());
  expect(screen.queryByRole("status")).toBeNull();
  expect(screen.getByText("크롭컷")).toBeTruthy();
  expect(screen.getByRole("heading", { name: "추천 근거 데이터" })).toBeTruthy();
});

test("기존 추천을 다시 조회하거나 생성할 때 카드 대신 스켈레톤을 표시하지 않는다", () => {
  recommendation.mockReturnValue({ ...ready, isRefetching: true, isGenerating: true });
  render(page());
  expect(screen.queryByRole("status")).toBeNull();
  expect(screen.getByRole("button", { name: "AR로 체험" })).toBeTruthy();
});

test("초기 조회 실패는 스켈레톤과 함께 표시되지 않는다", () => {
  recommendation.mockReturnValue({ ...ready, items: [], basisRows: [], isError: true });
  render(page());
  expect(screen.queryByRole("status")).toBeNull();
  expect(screen.getByRole("button", { name: "다시 시도" })).toBeTruthy();
});
