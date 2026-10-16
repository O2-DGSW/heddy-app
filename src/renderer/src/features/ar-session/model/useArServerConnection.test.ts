// @vitest-environment jsdom
import { act, cleanup, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { DEFAULT_GROOM_FIT_SETTINGS } from "@/entities/ar-groom";
import { useArServerConnection } from "./useArServerConnection";

const mocks = vi.hoisted(() => ({
  openCamera: vi.fn(),
  offer: vi.fn(),
  baseUrl: vi.fn(),
  syncGroomFit: vi.fn(),
  handleGroomRetry: vi.fn(),
  handleForeheadRefresh: vi.fn(),
  handleControlEvent: vi.fn(),
  reset: vi.fn(),
}));
vi.mock("@/entities/ar-groom", async importOriginal => ({
  ...(await importOriginal<typeof import("@/entities/ar-groom")>()),
  getArServerBaseUrl: mocks.baseUrl,
  requestArServerOffer: mocks.offer,
}));
vi.mock("./peerConnection", () => ({
  openCamera: mocks.openCamera,
  configureVideoSender: vi.fn(),
  waitForIceGatheringComplete: vi.fn().mockResolvedValue(undefined),
}));
vi.mock("./useGroomFitControl", () => ({
  useGroomFitControl: () => ({
    groomState: { status: "idle" },
    foreheadState: { status: "idle" },
    ...mocks,
  }),
}));

class Peer extends EventTarget {
  static instances: Peer[] = [];
  connectionState = "new";
  localDescription = { type: "offer", sdp: "offer" };
  channel = new EventTarget();
  constructor() {
    super();
    Peer.instances.push(this);
  }
  createDataChannel() {
    return this.channel;
  }
  createOffer = vi.fn().mockResolvedValue(this.localDescription);
  setLocalDescription = vi.fn().mockResolvedValue(undefined);
  setRemoteDescription = vi.fn().mockResolvedValue(undefined);
  close() {
    this.changeState("closed");
  }
  changeState(state: string) {
    this.connectionState = state;
    this.dispatchEvent(new Event("connectionstatechange"));
  }
}
const track = { stop: vi.fn(), addEventListener: vi.fn() };
const stream = { getTracks: () => [track], getVideoTracks: () => [track] };
const setup = () => {
  const preview = { current: null };
  const tracking = { current: null };
  return renderHook(() => useArServerConnection(preview, tracking, "", DEFAULT_GROOM_FIT_SETTINGS));
};
const advance = async (ms = 1) => {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(ms);
  });
};
const setOnline = (online: boolean) => {
  Object.defineProperty(navigator, "onLine", { configurable: true, value: online });
  act(() => window.dispatchEvent(new Event(online ? "online" : "offline")));
};

beforeEach(() => {
  vi.useFakeTimers();
  vi.clearAllMocks();
  Peer.instances = [];
  vi.stubGlobal("RTCPeerConnection", Peer);
  Object.defineProperty(navigator, "mediaDevices", {
    configurable: true,
    value: { getUserMedia: vi.fn() },
  });
  Object.defineProperty(navigator, "onLine", { configurable: true, value: true });
  mocks.baseUrl.mockReturnValue("/ar-server");
  mocks.openCamera.mockResolvedValue(stream);
  mocks.offer.mockResolvedValue({ type: "answer", sdp: "answer" });
});
afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe("AR 연결 상태와 복구", () => {
  test.each([
    ["NotAllowedError", "permission"],
    ["NotFoundError", "camera-missing"],
    ["OverconstrainedError", "camera-missing"],
    ["NotReadableError", "camera-busy"],
    ["SecurityError", "unsupported"],
    ["UnknownError", "camera-error"],
  ])("%s는 정확한 안내를 표시하고 자동 요청을 반복하지 않는다", async (name, feedback) => {
    mocks.openCamera.mockRejectedValue(new DOMException("camera", name));
    const hook = setup();
    await advance();
    expect(hook.result.current.connectionStatus).toBe("error");
    expect(hook.result.current.connectionFeedback).toBe(feedback);
    await advance(60_000);
    expect(mocks.openCamera).toHaveBeenCalledTimes(1);
    act(() => hook.result.current.handleReconnect());
    await advance();
    expect(mocks.openCamera).toHaveBeenCalledTimes(2);
  });
  test("오프라인에서는 카메라 요청을 보류하고 온라인 복귀 시 자동 연결한다", async () => {
    setOnline(false);
    const hook = setup();
    await advance(60_000);
    expect(hook.result.current.connectionFeedback).toBe("offline");
    expect(mocks.openCamera).not.toHaveBeenCalled();
    setOnline(true);
    await advance();
    expect(mocks.openCamera).toHaveBeenCalledTimes(1);
    expect(hook.result.current.connectionFeedback).toBe("connecting");
  });
  test("접속 중 오프라인이 되면 스트림과 시도를 종료하며 이전 peer 이벤트를 무시한다", async () => {
    const hook = setup();
    await advance();
    const peer = Peer.instances[0];
    act(() => peer.changeState("connected"));
    setOnline(false);
    expect(track.stop).toHaveBeenCalledTimes(1);
    act(() => peer.changeState("connected"));
    expect(hook.result.current.connectionFeedback).toBe("offline");
    expect(hook.result.current.connectionStatus).toBe("connecting");
    await advance(60_000);
    expect(mocks.openCamera).toHaveBeenCalledTimes(1);
    setOnline(true);
    await advance();
    expect(mocks.openCamera).toHaveBeenCalledTimes(2);
  });
  test("응답이 없는 연결은 30초 후 정리하고 재연결한다", async () => {
    mocks.offer.mockImplementation(() => new Promise(() => undefined));
    const hook = setup();
    await advance(30_001);
    expect(hook.result.current.connectionFeedback).toBe("retrying");
    expect(track.stop).toHaveBeenCalledTimes(1);
    expect(mocks.offer.mock.calls[0][2].aborted).toBe(true);
    await advance(1001);
    await advance();
    expect(mocks.openCamera).toHaveBeenCalledTimes(2);
  });
  test("권한 응답 대기는 연결 제한 시간으로 취소하지 않는다", async () => {
    mocks.openCamera.mockImplementation(() => new Promise(() => undefined));
    const hook = setup();
    await advance(60_000);
    expect(hook.result.current.connectionFeedback).toBe("camera");
    expect(mocks.openCamera).toHaveBeenCalledTimes(1);
    expect(mocks.offer).not.toHaveBeenCalled();
  });
  test("페이지를 나가면 재시도와 온라인 복귀로 카메라가 켜지지 않는다", async () => {
    mocks.offer.mockRejectedValue(new Error("server"));
    const hook = setup();
    await advance();
    act(() => hook.result.current.handlePageLeave());
    setOnline(false);
    setOnline(true);
    await advance(60_000);
    expect(mocks.openCamera).toHaveBeenCalledTimes(1);
    expect(hook.result.current.connectionStatus).toBe("idle");
    act(() => hook.result.current.handlePageEnter());
    await advance();
    expect(mocks.openCamera).toHaveBeenCalledTimes(2);
  });
  test("연결이 완료되면 제한 시간이 지나도 다시 연결하지 않는다", async () => {
    const hook = setup();
    await advance();
    act(() => Peer.instances[0].changeState("connected"));
    await advance(60_000);
    expect(hook.result.current.connectionStatus).toBe("connected");
    expect(mocks.openCamera).toHaveBeenCalledTimes(1);
  });
  test("연결 후 끊기면 복구 안내를 표시하고 새 peer로 연결한다", async () => {
    const hook = setup();
    await advance();
    act(() => Peer.instances[0].changeState("connected"));
    act(() => Peer.instances[0].changeState("failed"));
    expect(hook.result.current.connectionFeedback).toBe("reconnecting");
    await advance(1001);
    await advance();
    expect(Peer.instances).toHaveLength(2);
    act(() => Peer.instances[1].changeState("connected"));
    expect(hook.result.current.connectionStatus).toBe("connected");
  });
  test("서버 설정 오류는 인터넷 장애로 표시하지 않는다", async () => {
    mocks.baseUrl.mockReturnValue("");
    const hook = setup();
    await advance(60_000);
    expect(hook.result.current.connectionFeedback).toBe("unavailable");
    expect(mocks.openCamera).not.toHaveBeenCalled();
  });
});
