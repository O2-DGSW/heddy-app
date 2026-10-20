// @vitest-environment jsdom
import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider, useMutation } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { afterEach, beforeEach, expect, test, vi } from "vitest";

import { recommendationQueryKeys } from "@/entities/recommendation";
import type { RecommendationApiData } from "@/entities/recommendation";
import { useHomeData } from "./useHomeData";

const mocks = vi.hoisted(() => ({ latest: vi.fn(), generate: vi.fn(), refetch: vi.fn() }));
vi.mock("@/entities/profile", () => ({
  useGetMyProfile: () => ({ data: { nickname: "heddy" } }),
}));
vi.mock("@/entities/record", () => ({
  useGetTreatmentRecords: () => ({
    data: { items: [] },
    isPending: false,
    isError: false,
    refetch: mocks.refetch,
  }),
}));
vi.mock("@/entities/saved-style", () => ({
  useGetSavedStyles: () => ({
    data: { items: [] },
    isPending: false,
    isError: false,
    refetch: mocks.refetch,
  }),
}));
vi.mock("@/entities/recommendation/api/recommendationApi", () => ({
  getLatestRecommendationApi: mocks.latest,
  generateRecommendationApi: mocks.generate,
}));

interface WrapperProps {
  children: ReactNode;
}

const clients: QueryClient[] = [];
const existing: RecommendationApiData = {
  recommendation_run_id: "old",
  items: [{ rank: 1, hairstyle: { hairstyle_id: "style", style_name: "기존 추천" } }],
};

const setup = (initialData?: RecommendationApiData) => {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, staleTime: 60_000 } },
  });
  clients.push(client);
  if (initialData) client.setQueryData(recommendationQueryKeys.latest(), initialData);
  const wrapper = ({ children }: WrapperProps) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
  const hook = renderHook(
    () => ({
      home: useHomeData(),
      mutation: useMutation({
        mutationKey: recommendationQueryKeys.all,
        mutationFn: mocks.generate,
        retry: false,
      }),
    }),
    { wrapper }
  );
  return { client, ...hook };
};

beforeEach(() => {
  vi.resetAllMocks();
  mocks.latest.mockResolvedValue(existing);
});
afterEach(() => {
  cleanup();
  clients.splice(0).forEach(client => client.clear());
});

test("처음 불러올 때만 로딩하고 기존 추천 재조회는 카드 데이터를 유지한다", async () => {
  const complete = vi.fn<(value: RecommendationApiData) => void>();
  mocks.latest.mockReturnValue(
    new Promise<RecommendationApiData>(resolve => complete.mockImplementation(resolve))
  );
  const { result, client } = setup();
  expect(result.current.home.recommendations.isLoading).toBe(true);
  await act(async () => complete(existing));
  await waitFor(() => expect(result.current.home.recommendations.isLoading).toBe(false));
  mocks.latest.mockReturnValue(
    new Promise<RecommendationApiData>(resolve => complete.mockImplementation(resolve))
  );
  act(() => {
    void client.refetchQueries({ queryKey: recommendationQueryKeys.latest() });
  });
  await waitFor(() => expect(result.current.home.recommendations.isRefreshing).toBe(true));
  expect(result.current.home.recommendations.isLoading).toBe(false);
  expect(result.current.home.recommendations.data[0]?.title).toBe("기존 추천");
  await act(async () => complete(existing));
  await waitFor(() => expect(result.current.home.recommendations.isRefreshing).toBe(false));
});

test.each([existing, { recommendation_run_id: "empty", items: null }])(
  "추천 생성 중 목록 유무에 맞게 초기 로딩과 갱신 상태를 구분한다",
  async initialData => {
    const complete = vi.fn<(value: RecommendationApiData) => void>();
    mocks.generate.mockReturnValue(
      new Promise<RecommendationApiData>(resolve => complete.mockImplementation(resolve))
    );
    const { result } = setup(initialData);
    let generation: Promise<unknown> | undefined;
    act(() => {
      generation = result.current.mutation.mutateAsync(undefined);
    });
    await waitFor(() => expect(result.current.home.recommendations.isGenerating).toBe(true));
    expect(result.current.home.recommendations.isRefreshing).toBe(true);
    expect(result.current.home.recommendations.isLoading).toBe(!initialData.items?.length);
    await act(async () => {
      complete(existing);
      await generation;
    });
    await waitFor(() => expect(result.current.home.recommendations.isGenerating).toBe(false));
    expect(result.current.home.recommendations.isRefreshing).toBe(false);
    expect(result.current.home.recommendations.isLoading).toBe(false);
  }
);

test("추천 생성 실패 후 갱신 표시를 해제하고 기존 추천을 보존한다", async () => {
  mocks.generate.mockRejectedValue(new Error("생성 실패"));
  const { result } = setup(existing);
  await act(async () => {
    await result.current.mutation.mutateAsync(undefined).catch(() => undefined);
  });
  await waitFor(() => expect(result.current.mutation.isError).toBe(true));
  expect(result.current.home.recommendations.isLoading).toBe(false);
  expect(result.current.home.recommendations.isRefreshing).toBe(false);
  expect(result.current.home.recommendations.isGenerating).toBe(false);
  expect(result.current.home.recommendations.data[0]?.title).toBe("기존 추천");
});
