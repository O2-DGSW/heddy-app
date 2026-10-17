// @vitest-environment jsdom
import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { DEFAULT_GROOM_FIT_SETTINGS } from "@/entities/ar-groom";

import { useGroomFitControl } from "./useGroomFitControl";

const createChannel = () => ({ readyState: "open", send: vi.fn() });

const sentMessages = (channel: ReturnType<typeof createChannel>) =>
  channel.send.mock.calls.map(
    ([message]) => JSON.parse(String(message)) as Record<string, unknown>
  );

const setup = (groom = "short-swept") => {
  const channel = createChannel();
  const channelRef = { current: channel as unknown as RTCDataChannel };
  const hook = renderHook(
    ({ groom: currentGroom }) =>
      useGroomFitControl(channelRef, currentGroom, DEFAULT_GROOM_FIT_SETTINGS),
    { initialProps: { groom } }
  );

  // 선택을 바꾼 뒤 잠깐 기다렸다가 보낸다
  act(() => {
    vi.advanceTimersByTime(80);
  });

  return { channel, hook };
};

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("useGroomFitControl", () => {
  test("스타일을 고르면 fit 명령을 보내고 응답이 오면 적용 완료가 된다", () => {
    const { channel, hook } = setup();

    expect(sentMessages(channel)[0]).toMatchObject({ type: "fit", groom: "short-swept" });
    expect(hook.result.current.groomState).toEqual({ groom: "short-swept", status: "loading" });

    act(() => hook.result.current.handleControlEvent({ type: "groom", status: "ok" }));

    expect(hook.result.current.groomState).toMatchObject({ groom: "short-swept", status: "ok" });
  });

  test("스타일 응답을 기다리는 중 바꾼 최신 선택을 바로 보낸다", () => {
    const { channel, hook } = setup();

    hook.rerender({ groom: "long-wave" });
    act(() => {
      vi.advanceTimersByTime(80);
    });
    expect(sentMessages(channel)).toHaveLength(2);
    expect(sentMessages(channel)[1]).toMatchObject({ groom: "long-wave" });
    expect(hook.result.current.groomState).toEqual({ groom: "long-wave", status: "loading" });

    act(() =>
      hook.result.current.handleControlEvent({
        type: "groom",
        status: "ok",
        groom: "short-swept",
      })
    );

    expect(sentMessages(channel)).toHaveLength(2);
    expect(hook.result.current.groomState).toEqual({ groom: "long-wave", status: "loading" });
  });

  test("최신 적용 뒤 오래된 스타일 응답이 오면 최신 스타일을 다시 보낸다", () => {
    const { channel, hook } = setup();

    hook.rerender({ groom: "long-wave" });
    act(() => {
      vi.advanceTimersByTime(80);
    });
    act(() =>
      hook.result.current.handleControlEvent({ type: "groom", status: "ok", groom: "long-wave" })
    );
    act(() =>
      hook.result.current.handleControlEvent({
        type: "groom",
        status: "ok",
        groom: "short-swept",
      })
    );

    expect(sentMessages(channel)).toHaveLength(3);
    expect(sentMessages(channel)[2]).toMatchObject({ groom: "long-wave" });
    expect(hook.result.current.groomState).toEqual({ groom: "long-wave", status: "loading" });
  });

  test("이전 요청일 수 있는 이름 없는 오류는 최신 요청의 실패로 처리하지 않는다", () => {
    const { hook } = setup();

    hook.rerender({ groom: "long-wave" });
    act(() => {
      vi.advanceTimersByTime(80);
    });
    act(() => hook.result.current.handleControlEvent({ type: "error", message: "old error" }));

    expect(hook.result.current.groomState).toEqual({ groom: "long-wave", status: "loading" });
  });

  test("15초 동안 응답이 없으면 오류가 되고, 늦게 온 성공 응답은 반영한다", () => {
    const { hook } = setup();

    act(() => {
      vi.advanceTimersByTime(15000);
    });
    expect(hook.result.current.groomState.status).toBe("error");

    act(() =>
      hook.result.current.handleControlEvent({ type: "groom", status: "ok", groom: "short-swept" })
    );

    expect(hook.result.current.groomState).toEqual({ groom: "short-swept", status: "ok" });
  });

  test("이마 재생성 요청은 60초 안에 응답이 없으면 오류가 된다", () => {
    const { channel, hook } = setup();
    act(() => hook.result.current.handleControlEvent({ type: "groom", status: "ok" }));

    act(() => hook.result.current.handleForeheadRefresh());
    expect(sentMessages(channel).at(-1)).toEqual({ type: "fit", forehead: "refresh" });
    expect(hook.result.current.foreheadState.status).toBe("loading");

    act(() => {
      vi.advanceTimersByTime(60000);
    });
    expect(hook.result.current.foreheadState.status).toBe("error");
  });

  test("연결이 끊겨 초기화하면 상태와 대기 중인 요청을 모두 비운다", () => {
    const { hook } = setup();

    act(() => hook.result.current.reset());

    expect(hook.result.current.groomState).toEqual({ status: "idle" });
    expect(hook.result.current.foreheadState).toEqual({ status: "idle" });
  });
});
