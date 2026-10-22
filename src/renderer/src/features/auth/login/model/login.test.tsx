// @vitest-environment jsdom
import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { afterEach, beforeEach, expect, test, vi } from "vitest";

import { recommendationQueryKeys, useGetLatestRecommendation } from "@/entities/recommendation";
import type { RecommendationApiData } from "@/entities/recommendation";
import { useLoginForm } from "./login";

const mocks = vi.hoisted(() => ({
  login: vi.fn(),
  setTokens: vi.fn(),
  generate: vi.fn(),
  latest: vi.fn(),
  navigate: vi.fn(),
}));

vi.mock("@/entities/auth", () => ({
  loginApi: mocks.login,
  setAuthTokens: mocks.setTokens,
}));
vi.mock("@/entities/recommendation/api/recommendationApi", () => ({
  generateRecommendationApi: mocks.generate,
  getLatestRecommendationApi: mocks.latest,
}));
vi.mock("react-router-dom", async importOriginal => ({
  ...(await importOriginal<typeof import("react-router-dom")>()),
  useNavigate: () => mocks.navigate,
}));

interface WrapperProps {
  children: ReactNode;
}

const generated: RecommendationApiData = { recommendation_run_id: "new-run", items: [] };
const clients: QueryClient[] = [];

const createPendingRecommendation = () => {
  const resolve = vi.fn<(value: RecommendationApiData) => void>();
  const promise = new Promise<RecommendationApiData>(accept => {
    resolve.mockImplementation(accept);
  });
  return { promise, resolve };
};

const setup = () => {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, staleTime: 30_000 } },
  });
  clients.push(client);
  const wrapper = ({ children }: WrapperProps) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
  const hook = renderHook(useLoginForm, { wrapper });
  act(() => {
    hook.result.current.setEmail(" user@example.com ");
    hook.result.current.setPassword("password");
  });
  return { client, wrapper, hook };
};

beforeEach(() => {
  vi.resetAllMocks();
  mocks.login.mockResolvedValue({ accessToken: "access", refreshToken: "refresh" });
  mocks.setTokens.mockResolvedValue(undefined);
  mocks.latest.mockResolvedValue(null);
});
afterEach(() => {
  cleanup();
  clients.splice(0).forEach(client => client.clear());
});

test("로그인 성공 후 추천을 한 번 생성하고 홈 조회와 진행 중 요청을 공유한다", async () => {
  const { client, wrapper, hook } = setup();
  client.setQueryData(recommendationQueryKeys.latest(), { recommendation_run_id: "old-run" });
  const pending = createPendingRecommendation();
  mocks.generate.mockImplementation(() => {
    expect(mocks.setTokens).toHaveBeenCalledWith({
      accessToken: "access",
      refreshToken: "refresh",
    });
    expect(client.getQueryData(recommendationQueryKeys.latest())).toBeUndefined();
    return pending.promise;
  });

  await act(async () => hook.result.current.handleLogin());

  expect(mocks.login).toHaveBeenCalledWith({ email: "user@example.com", password: "password" });
  expect(mocks.generate).toHaveBeenCalledExactlyOnceWith({ force_refresh: true });
  expect(mocks.navigate).toHaveBeenCalledWith("/home", { replace: true });
  expect(hook.result.current.isLoading).toBe(false);
  const home = renderHook(useGetLatestRecommendation, { wrapper });
  expect(home.result.current.isPending).toBe(true);
  expect(mocks.latest).not.toHaveBeenCalled();

  await act(async () => pending.resolve(generated));
  await waitFor(() => expect(home.result.current.data).toEqual(generated));
  expect(mocks.generate).toHaveBeenCalledTimes(1);
  expect(mocks.latest).not.toHaveBeenCalled();
});

test("로그인 실패 시 추천 생성과 홈 이동을 실행하지 않는다", async () => {
  mocks.login.mockRejectedValue(new Error("로그인 실패"));
  const { hook } = setup();

  await act(async () => hook.result.current.handleLogin());

  expect(hook.result.current.error).toBe("로그인 실패");
  expect(mocks.setTokens).not.toHaveBeenCalled();
  expect(mocks.generate).not.toHaveBeenCalled();
  expect(mocks.navigate).not.toHaveBeenCalled();
});

test("추천 생성 실패가 로그인 성공을 막거나 생성을 자동 재시도하지 않는다", async () => {
  const error = new Error("추천 생성 실패");
  mocks.generate.mockRejectedValue(error);
  const { client, hook } = setup();

  await act(async () => hook.result.current.handleLogin());
  await waitFor(() =>
    expect(client.getQueryState(recommendationQueryKeys.latest())?.status).toBe("error")
  );

  expect(mocks.navigate).toHaveBeenCalledWith("/home", { replace: true });
  expect(hook.result.current.error).toBeNull();
  expect(hook.result.current.isLoading).toBe(false);
  expect(mocks.generate).toHaveBeenCalledTimes(1);
});

test("추천 생성 중 로그아웃처럼 캐시를 비우면 늦은 결과가 다시 채워지지 않는다", async () => {
  const pending = createPendingRecommendation();
  mocks.generate.mockReturnValue(pending.promise);
  const { client, hook } = setup();
  await act(async () => hook.result.current.handleLogin());

  client.clear();
  await act(async () => pending.resolve(generated));

  expect(client.getQueryData(recommendationQueryKeys.latest())).toBeUndefined();
});
