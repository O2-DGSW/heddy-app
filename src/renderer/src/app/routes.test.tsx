// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider, useQuery } from "@tanstack/react-query";
import { Fragment, StrictMode } from "react";
import { MemoryRouter, useNavigate } from "react-router-dom";
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
  navigation: vi.fn(),
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
const navigationDescriptor = Object.getOwnPropertyDescriptor(performance, "getEntriesByType");

const HomeQueries = () => {
  const recommendation = useGetLatestRecommendation();
  const navigate = useNavigate();
  useQuery({ queryKey: ["test-records"], queryFn: mocks.records });
  return (
    <main>
      <p>본문</p>
      <p>{recommendation.data?.recommendation_run_id}</p>
      <button type="button" onClick={() => navigate("/recommend")}>
        추천 화면으로
      </button>
      <button type="button" onClick={() => navigate("/home")}>
        홈 화면으로
      </button>
    </main>
  );
};

interface SetupOptions {
  strict?: boolean;
  cached?: boolean;
}

const setup = async (path = "/home", { strict = false, cached = true }: SetupOptions = {}) => {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, staleTime: 60_000 } },
  });
  clients.push(client);
  if (cached) client.setQueryData(recommendationQueryKeys.latest(), oldRecommendation);
  client.setQueryData(["test-records"], []);
  const Root = strict ? StrictMode : Fragment;
  render(
    <Root>
      <QueryClientProvider client={client}>
        <MemoryRouter initialEntries={[path]}>
          <AppRoutes />
        </MemoryRouter>
      </QueryClientProvider>
    </Root>
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
  mocks.navigation.mockReturnValue([]);
  Object.defineProperty(performance, "getEntriesByType", {
    configurable: true,
    value: mocks.navigation,
  });
});

afterEach(() => {
  cleanup();
  clients.splice(0).forEach(client => client.clear());
  if (navigationDescriptor) {
    Object.defineProperty(performance, "getEntriesByType", navigationDescriptor);
  } else {
    Reflect.deleteProperty(performance, "getEntriesByType");
  }
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
  "생성 중 로그아웃·계정 변경(%s)으로 캐시를 비우면 이전 추천을 다시 넣지 않는다",
  async nextToken => {
    const complete = vi.fn<(value: RecommendationApiData) => void>();
    mocks.generate.mockReturnValue(
      new Promise<RecommendationApiData>(resolve => complete.mockImplementation(resolve))
    );
    const client = await setup();
    pull();
    await waitFor(() => expect(mocks.generate).toHaveBeenCalledTimes(1));
    mocks.token.mockResolvedValue(nextToken);
    client.clear();
    const nextRecommendation = nextToken
      ? { recommendation_run_id: "other", items: [] }
      : undefined;
    if (nextRecommendation) {
      client.setQueryData(recommendationQueryKeys.latest(), nextRecommendation);
    } else {
      // 실제 로그아웃처럼 기존 계정 화면의 조회 observer도 해제한다.
      cleanup();
    }
    await act(async () => complete(newRecommendation));
    await waitFor(() => expect(screen.queryByRole("status")).toBeNull());
    expect(client.getQueryData(recommendationQueryKeys.latest())).toEqual(nextRecommendation);
  }
);

test("요청 도중 같은 계정의 토큰이 자동 갱신되어도 새 추천을 반영한다", async () => {
  const complete = vi.fn<(value: RecommendationApiData) => void>();
  mocks.generate.mockReturnValue(
    new Promise<RecommendationApiData>(resolve => complete.mockImplementation(resolve))
  );
  const client = await setup();
  pull();
  await waitFor(() => expect(mocks.generate).toHaveBeenCalledTimes(1));
  mocks.token.mockResolvedValue("renewed-access-token");
  await act(async () => complete(newRecommendation));
  await screen.findByText("new");
  expect(client.getQueryData(recommendationQueryKeys.latest())).toEqual(newRecommendation);
});

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

test.each(["/home", "/recommend"])(
  "%s 브라우저 새로고침은 StrictMode에서도 한 번 생성하고 이후 탭 이동에는 재생성하지 않는다",
  async path => {
    mocks.navigation.mockReturnValue([{ entryType: "navigation", type: "reload" }]);
    const complete = vi.fn<(value: RecommendationApiData) => void>();
    mocks.generate.mockReturnValue(
      new Promise<RecommendationApiData>(resolve => complete.mockImplementation(resolve))
    );
    const client = await setup(path, { strict: true, cached: false });
    await waitFor(() => expect(mocks.generate).toHaveBeenCalledTimes(1));
    expect(mocks.generate.mock.calls[0]?.[0]).toEqual({ force_refresh: true });
    expect(mocks.latest).not.toHaveBeenCalled();
    expect(client.getQueryState(recommendationQueryKeys.latest())?.fetchStatus).toBe("fetching");

    await act(async () => complete(newRecommendation));
    await screen.findByText("new");
    fireEvent.click(screen.getByRole("button", { name: "추천 화면으로" }));
    await screen.findByText("new");
    fireEvent.click(screen.getByRole("button", { name: "홈 화면으로" }));
    await screen.findByText("new");
    expect(client.getQueryData(recommendationQueryKeys.latest())).toEqual(newRecommendation);
    expect(mocks.generate).toHaveBeenCalledTimes(1);
    expect(mocks.latest).not.toHaveBeenCalled();
  }
);

test.each(["navigate", "back_forward"])("%s 진입은 새 추천을 생성하지 않는다", async type => {
  mocks.navigation.mockReturnValue([{ entryType: "navigation", type }]);
  await setup("/home", { strict: true, cached: false });
  await screen.findByText("old");
  expect(mocks.generate).not.toHaveBeenCalled();
  expect(mocks.latest).toHaveBeenCalledTimes(1);
});

test.each(["/s/shared-record", "/welcome"])(
  "%s 브라우저 새로고침에서는 개인 추천을 생성하지 않는다",
  async path => {
    mocks.navigation.mockReturnValue([{ entryType: "navigation", type: "reload" }]);
    if (path === "/welcome") {
      mocks.restore.mockResolvedValue(false);
      mocks.token.mockResolvedValue(null);
    }
    await setup(path, { strict: true, cached: false });
    expect(mocks.generate).not.toHaveBeenCalled();
  }
);

test("브라우저 새로고침의 생성 실패는 자동 재시도하지 않는다", async () => {
  mocks.navigation.mockReturnValue([{ entryType: "navigation", type: "reload" }]);
  mocks.generate.mockRejectedValue(new Error("생성 실패"));
  await setup("/home", { strict: true });
  await screen.findByText("old");
  expect(mocks.generate).toHaveBeenCalledTimes(1);
});

test("브라우저 재추천 중 로그아웃으로 캐시를 비우면 늦은 결과를 넣지 않는다", async () => {
  mocks.navigation.mockReturnValue([{ entryType: "navigation", type: "reload" }]);
  const complete = vi.fn<(value: RecommendationApiData) => void>();
  mocks.generate.mockReturnValue(
    new Promise<RecommendationApiData>(resolve => complete.mockImplementation(resolve))
  );
  const client = await setup("/home", { strict: true, cached: false });
  await waitFor(() => expect(mocks.generate).toHaveBeenCalledTimes(1));
  cleanup();
  client.clear();
  await act(async () => complete(newRecommendation));
  expect(client.getQueryData(recommendationQueryKeys.latest())).toBeUndefined();
});
