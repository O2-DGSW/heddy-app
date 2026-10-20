// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider, useQuery } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, expect, test, vi } from "vitest";

import { recommendationQueryKeys, useGetLatestRecommendation } from "@/entities/recommendation";
import type { RecommendationApiData } from "@/entities/recommendation";
import { AppRoutes } from "./routes";

const mocks = vi.hoisted(() => ({
  token: vi.fn(),
  restore: vi.fn(),
  generate: vi.fn(),
  latest: vi.fn(),
  records: vi.fn(),
}));

vi.mock("@/entities/auth", () => ({
  getAccessToken: mocks.token,
  restoreAuthSession: mocks.restore,
}));
vi.mock("@/entities/recommendation/api/recommendationApi", () => ({
  generateRecommendationApi: mocks.generate,
  getLatestRecommendationApi: mocks.latest,
}));
vi.mock("./layouts", async () => {
  const { Outlet } = await import("react-router-dom");
  return { MobileLayout: Outlet, MainTransitionOutlet: Outlet, AuthTransitionOutlet: Outlet };
});
vi.mock("@/shared", async () => {
  const { default: PullToRefresh } = await import("../shared/ui/pull-to-refresh/PullToRefresh");
  return { PullToRefresh, PageLoading: () => <p>로딩 중</p> };
});
vi.mock("@/pages/home", () => ({ HomePage: () => <HomeQueries /> }));
vi.mock("@/pages/recommend", () => ({ RecommendPage: () => <HomeQueries /> }));
vi.mock("@/pages/auth/welcome", () => ({ WelcomePage: () => <p>환영 화면</p> }));
vi.mock("@/pages/auth/login", () => ({ LoginPage: () => <p>로그인 화면</p> }));
vi.mock("@/pages/not-found", () => ({ NotFoundPage: () => <p>없는 화면</p> }));
vi.mock("@/pages/public-share", () => ({ PublicSharePage: () => <p>공유 화면</p> }));

const oldRecommendation: RecommendationApiData = { recommendation_run_id: "old", items: [] };
const newRecommendation: RecommendationApiData = { recommendation_run_id: "new", items: [] };
const clients: QueryClient[] = [];

const HomeQueries = () => {
  const recommendation = useGetLatestRecommendation();
  useQuery({ queryKey: ["test-records"], queryFn: mocks.records });
  return (
    <main>
      <p>본문</p>
      <p>{recommendation.data?.recommendation_run_id}</p>
    </main>
  );
};

const setup = async (path = "/home") => {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, staleTime: 60_000 } },
  });
  clients.push(client);
  client.setQueryData(recommendationQueryKeys.latest(), oldRecommendation);
  client.setQueryData(["test-records"], []);
  render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={[path]}>
        <AppRoutes />
      </MemoryRouter>
    </QueryClientProvider>
  );
  await screen.findByText(
    path.startsWith("/s/") ? "공유 화면" : path === "/welcome" ? "환영 화면" : "본문"
  );
  return client;
};

const pull = (text = "본문") => {
  const target = screen.getByText(text);
  for (const [type, y] of [
    ["touchstart", 0],
    ["touchmove", 160],
    ["touchend", 160],
  ] as const) {
    const event = new Event(type, { bubbles: true, cancelable: true });
    Object.defineProperty(event, "touches", {
      value: type === "touchend" ? [] : [{ clientX: 10, clientY: y }],
    });
    fireEvent(target, event);
  }
};

beforeEach(() => {
  vi.resetAllMocks();
  mocks.token.mockResolvedValue("access-token");
  mocks.restore.mockResolvedValue(true);
  mocks.generate.mockResolvedValue(newRecommendation);
  mocks.latest.mockResolvedValue(oldRecommendation);
  mocks.records.mockResolvedValue([]);
});

afterEach(() => {
  cleanup();
  clients.splice(0).forEach(client => client.clear());
});

test.each(["/home", "/recommend"])(
  "%s에서 새로고침할 때마다 캐시 유효기간과 관계없이 새 추천을 생성한다",
  async path => {
    const client = await setup(path);
    expect(mocks.generate).not.toHaveBeenCalled();

    for (let count = 1; count <= 2; count++) {
      pull();
      await waitFor(() => expect(screen.queryByRole("status")).toBeNull());
      expect(mocks.generate).toHaveBeenCalledTimes(count);
      expect(mocks.generate.mock.calls.at(-1)?.[0]).toEqual({ force_refresh: true });
      expect(mocks.records).toHaveBeenCalledTimes(count);
      expect(client.getQueryData(recommendationQueryKeys.latest())).toEqual(newRecommendation);
      expect(screen.getByText("new")).toBeTruthy();
    }
    expect(mocks.latest).not.toHaveBeenCalled();

    // 일반 추천 재조회는 생성 API로 바뀌지 않는다.
    await act(async () => {
      await client.refetchQueries({ queryKey: recommendationQueryKeys.latest() });
    });
    expect(mocks.latest).toHaveBeenCalledTimes(1);
    expect(mocks.generate).toHaveBeenCalledTimes(2);
  }
);

test("진행 중인 이전 추천 조회가 새 생성 결과를 덮어쓰지 않는다", async () => {
  const client = await setup();
  const complete = vi.fn<(value: RecommendationApiData) => void>();
  mocks.latest.mockReturnValue(
    new Promise<RecommendationApiData>(resolve => complete.mockImplementation(resolve))
  );
  let previousQuery: Promise<void> | undefined;
  act(() => {
    previousQuery = client.refetchQueries({ queryKey: recommendationQueryKeys.latest() });
  });
  pull();
  await screen.findByText("new");
  await act(async () => {
    complete(oldRecommendation);
    await previousQuery;
  });
  expect(client.getQueryData(recommendationQueryKeys.latest())).toEqual(newRecommendation);
});

test("생성 실패 시 기존 추천을 보존하고 자동 재시도하지 않는다", async () => {
  mocks.generate.mockRejectedValue(new Error("생성 실패"));
  const client = await setup();
  pull();
  await waitFor(() =>
    expect(screen.getByRole("status").textContent).toContain("불러오지 못했어요")
  );
  expect(client.getQueryData(recommendationQueryKeys.latest())).toEqual(oldRecommendation);
  expect(mocks.generate).toHaveBeenCalledTimes(1);
  expect(mocks.records).toHaveBeenCalledTimes(1);
  expect(mocks.latest).not.toHaveBeenCalled();
});

test("다른 조회가 실패해도 추천 생성이 끝날 때까지 새로고침 상태를 유지한다", async () => {
  mocks.records.mockRejectedValue(new Error("조회 실패"));
  const complete = vi.fn<(value: RecommendationApiData) => void>();
  mocks.generate.mockReturnValue(
    new Promise<RecommendationApiData>(resolve => complete.mockImplementation(resolve))
  );
  const client = await setup();
  pull();
  await waitFor(() => expect(mocks.generate).toHaveBeenCalledTimes(1));
  await waitFor(() => expect(client.getQueryState(["test-records"])?.status).toBe("error"));
  expect(screen.getByRole("status").textContent).toContain("새로고침 중이에요");
  pull();
  expect(mocks.generate).toHaveBeenCalledTimes(1);
  await act(async () => complete(newRecommendation));
  await waitFor(() =>
    expect(screen.getByRole("status").textContent).toContain("불러오지 못했어요")
  );
  expect(client.getQueryData(recommendationQueryKeys.latest())).toEqual(newRecommendation);
});

test.each([null, "different-account-token"])(
  "생성 중 인증 토큰이 %s로 바뀌면 이전 계정의 추천을 캐시에 넣지 않는다",
  async nextToken => {
    const complete = vi.fn<(value: RecommendationApiData) => void>();
    mocks.generate.mockReturnValue(
      new Promise<RecommendationApiData>(resolve => complete.mockImplementation(resolve))
    );
    const client = await setup();
    pull();
    await waitFor(() => expect(mocks.generate).toHaveBeenCalledTimes(1));
    mocks.token.mockResolvedValue(nextToken);
    await act(async () => complete(newRecommendation));
    await waitFor(() => expect(screen.queryByRole("status")).toBeNull());
    expect(client.getQueryData(recommendationQueryKeys.latest())).toEqual(oldRecommendation);
  }
);

test.each(["/s/shared-record", "/welcome"])(
  "%s에서는 새로고침해도 개인 추천을 생성하지 않는다",
  async path => {
    if (path === "/welcome") {
      mocks.token.mockResolvedValue(null);
      mocks.restore.mockResolvedValue(false);
    }
    await setup(path);
    pull(path.startsWith("/s/") ? "공유 화면" : "환영 화면");
    await waitFor(() => expect(screen.queryByRole("status")).toBeNull());
    expect(mocks.generate).not.toHaveBeenCalled();
  }
);
