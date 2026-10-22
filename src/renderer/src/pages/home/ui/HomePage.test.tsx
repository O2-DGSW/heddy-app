// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { afterEach, beforeEach, expect, test, vi } from "vitest";

import type { RecentRecordType } from "@/features/home";
import HomePage from "./HomePage";

const mocks = vi.hoisted(() => ({ home: vi.fn(), refetch: vi.fn() }));
vi.mock("../model/useHomeData", () => ({ useHomeData: () => mocks.home() }));

const record: RecentRecordType = {
  id: "record-1",
  date: "2026-10-21",
  procedureName: "커트",
  salonName: "미용실",
  designerName: "디자이너",
  rating: 4,
  thumbnailUrl: "",
};

interface SetupOptions {
  data?: RecentRecordType | null;
  isError?: boolean;
  isLoading?: boolean;
}

const Destination = () => <output aria-label="이동 경로">{useLocation().pathname}</output>;
const setup = ({ data = record, isError = false, isLoading = false }: SetupOptions = {}) => {
  mocks.home.mockReturnValue({
    profileName: "heddy",
    recentRecord: { data, isError, isLoading, refetch: mocks.refetch },
    arStyles: { data: [], isLoading: false, isError: false, refetch: mocks.refetch },
    recommendations: {
      data: [],
      isLoading: false,
      isRefreshing: false,
      isGenerating: false,
      isError: false,
      refetch: mocks.refetch,
    },
  });
  return render(
    <MemoryRouter initialEntries={["/home"]}>
      <Destination />
      <Routes>
        <Route path="/home" element={<HomePage />} />
        <Route path="/cuts" element={<p>기록 목록</p>} />
        <Route path="/cuts/add" element={<p>기록 추가</p>} />
        <Route path="/cuts/:id" element={<p>기록 상세</p>} />
      </Routes>
    </MemoryRouter>
  );
};

beforeEach(() => vi.clearAllMocks());
afterEach(cleanup);

test("최근 기록 카드 안의 내용을 누르면 해당 ID의 기록 상세로 이동한다", () => {
  setup();
  const button = screen.getByRole("button", { name: "2026-10-21 커트 기록 상세보기" });
  expect(button.getAttribute("type")).toBe("button");
  fireEvent.click(screen.getByText("커트"));
  expect(screen.getByLabelText("이동 경로").textContent).toBe("/cuts/record-1");
  expect(screen.getByText("기록 상세")).toBeTruthy();
  expect(mocks.refetch).not.toHaveBeenCalled();
});

test("전체보기는 최근 기록이 있어도 상세 대신 기록 목록으로 이동한다", () => {
  setup();
  fireEvent.click(screen.getByRole("button", { name: "시술 기록 전체보기" }));
  expect(screen.getByLabelText("이동 경로").textContent).toBe("/cuts");
  expect(screen.getByText("기록 목록")).toBeTruthy();
});

test("기록이 없는 경우 첫 기록 버튼은 추가 화면으로 이동한다", () => {
  setup({ data: null });
  fireEvent.click(screen.getByRole("button", { name: /오늘의 스타일을 남겨보세요/ }));
  expect(screen.getByLabelText("이동 경로").textContent).toBe("/cuts/add");
});

test("첫 조회 중에는 기록 추가 또는 상세 이동 버튼을 노출하지 않는다", () => {
  setup({ data: null, isLoading: true });
  expect(
    screen.queryByRole("button", { name: /기록 상세보기|오늘의 스타일을 남겨보세요/ })
  ).toBeNull();
  expect(
    within(screen.getByRole("region", { name: "나의 헤어 기록" })).getByRole("status").textContent
  ).toContain("헤어 기록을 불러오고 있어요");
});

test("첫 조회 오류의 다시 시도는 이동 없이 기록을 재조회한다", () => {
  setup({ data: null, isError: true });
  fireEvent.click(screen.getByRole("button", { name: "다시 시도" }));
  expect(mocks.refetch).toHaveBeenCalledOnce();
  expect(screen.getByLabelText("이동 경로").textContent).toBe("/home");
});

test("갱신 오류가 있어도 보이는 기존 기록을 누르면 상세로 이동한다", () => {
  setup({ isError: true });
  fireEvent.click(screen.getByRole("button", { name: "2026-10-21 커트 기록 상세보기" }));
  expect(screen.getByLabelText("이동 경로").textContent).toBe("/cuts/record-1");
  expect(mocks.refetch).not.toHaveBeenCalled();
});
