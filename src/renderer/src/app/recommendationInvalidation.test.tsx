// @vitest-environment jsdom
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, test, vi } from "vitest";

import { createRecommendationMutationCache } from "./recommendationInvalidation";
import { usePutStylePreferences } from "@/entities/style";
import { recommendationQueryKeys } from "@/entities/recommendation";

const savePreferences = vi.hoisted(() => vi.fn());
vi.mock("@/entities/style/api/styleApi", () => ({ putStylePreferencesApi: savePreferences }));

const createClient = (): QueryClient => {
  const client: QueryClient = new QueryClient({
    mutationCache: createRecommendationMutationCache(() => client),
    defaultOptions: { queries: { retry: false, staleTime: Infinity }, mutations: { retry: false } },
  });
  return client;
};

describe("recommendation input invalidation", () => {
  test("saving preferred/excluded tags clears even a fresh cached recommendation", async () => {
    const client = createClient();
    client.setQueryData(recommendationQueryKeys.latest(), {
      recommendation_run_id: "old",
      items: [],
    });
    const body = { preferred_tag_ids: ["preferred"], excluded_tag_ids: ["excluded"] };
    savePreferences.mockResolvedValue(body);
    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    );
    const { result } = renderHook(() => usePutStylePreferences(), { wrapper });
    await act(async () => {
      await result.current.mutateAsync(body);
    });
    expect(savePreferences).toHaveBeenCalledWith(body);
    expect(client.getQueryData(recommendationQueryKeys.latest())).toBeUndefined();
    client.clear();
  });

  test("failed preference save preserves the previous recommendation", async () => {
    const client = createClient();
    const previous = { recommendation_run_id: "old" };
    client.setQueryData(recommendationQueryKeys.latest(), previous);
    savePreferences.mockRejectedValue(new Error("save failed"));
    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    );
    const { result } = renderHook(() => usePutStylePreferences(), { wrapper });
    await act(async () => {
      await expect(
        result.current.mutateAsync({ preferred_tag_ids: [], excluded_tag_ids: [] })
      ).rejects.toThrow("save failed");
    });
    expect(client.getQueryData(recommendationQueryKeys.latest())).toEqual(previous);
    client.clear();
  });

  test("a partially successful photo upload also invalidates recommendations", async () => {
    const client = createClient();
    client.setQueryData(recommendationQueryKeys.latest(), { recommendation_run_id: "old" });
    const mutation = client.getMutationCache().build(client, {
      meta: { affectsRecommendations: true, mayPartiallySucceed: true },
      mutationFn: async () => {
        throw new Error("one photo failed");
      },
    });
    await expect(mutation.execute(undefined)).rejects.toThrow("one photo failed");
    expect(client.getQueryData(recommendationQueryKeys.latest())).toBeUndefined();
    client.clear();
  });
});
