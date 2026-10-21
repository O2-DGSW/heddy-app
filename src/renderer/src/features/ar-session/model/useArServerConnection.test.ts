// @vitest-environment jsdom
import { Capacitor } from "@capacitor/core";
import { act, cleanup, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { DEFAULT_GROOM_FIT_SETTINGS } from "@/entities/ar-groom";
import { ApiHttpError } from "@heddy/api";
import { configureVideoSender, waitForIceGatheringComplete } from "./peerConnection";
import { useArServerConnection } from "./useArServerConnection";

const mocks = vi.hoisted(() => ({
  openCamera: vi.fn(),
  portrait: vi.fn(),
  offer: vi.fn(),
  baseUrl: vi.fn(),
  syncGroomFit: vi.fn(),
  fitGroom: vi.fn(),
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
vi.mock("./peerConnection", async importOriginal => ({
  ...(await importOriginal<typeof import("./peerConnection")>()),
  openCamera: mocks.openCamera,
  configureVideoSender: vi.fn(),
  waitForIceGatheringComplete: vi.fn().mockResolvedValue(undefined),
}));
vi.mock("./portraitCameraStream", () => ({ createPortraitCameraStream: mocks.portrait }));
vi.mock("./useGroomFitControl", () => ({
  useGroomFitControl: (_channel: unknown, groom: string) => {
    mocks.fitGroom(groom);
    return {
      groomState: { status: "idle" },
      foreheadState: { status: "idle" },
      ...mocks,
    };
  },
}));

class Peer extends EventTarget {
  static instances: Peer[] = [];
  connectionState = "new";
  iceGatheringState: RTCIceGatheringState = "gathering";
  localDescription = { type: "offer", sdp: "offer" };
  channel = new EventTarget();
  constructor() {
    super();
    Peer.instances.push(this);
  }
  createDataChannel() {
    return this.channel;
  }
  createOffer = vi.fn(async () => this.localDescription);
  setLocalDescription = vi.fn(async (description: RTCSessionDescriptionInit) => {
    this.localDescription = { type: description.type, sdp: description.sdp ?? "" };
  });
  setRemoteDescription = vi.fn().mockResolvedValue(undefined);
  close() {
    this.changeState("closed");
  }
  changeState(state: string) {
    this.connectionState = state;
    this.dispatchEvent(new Event("connectionstatechange"));
  }
}
const track = {
  label: "",
  stop: vi.fn(),
  addEventListener: vi.fn(),
  getSettings: vi.fn<() => MediaTrackSettings>(),
};
const stream = { getTracks: () => [track], getVideoTracks: () => [track] };
const portraitTrack = { stop: vi.fn(), addEventListener: vi.fn() };
const portraitStream = { getTracks: () => [portraitTrack], getVideoTracks: () => [portraitTrack] };
const setup = () => {
  const preview = { current: null };
  return renderHook(() => useArServerConnection(preview, "", DEFAULT_GROOM_FIT_SETTINGS));
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
  vi.spyOn(Capacitor, "getPlatform").mockReturnValue("web");
  Peer.instances = [];
  vi.stubGlobal("RTCPeerConnection", Peer);
  Object.defineProperty(navigator, "mediaDevices", {
    configurable: true,
    value: { getUserMedia: vi.fn() },
  });
  Object.defineProperty(navigator, "onLine", { configurable: true, value: true });
  mocks.baseUrl.mockReturnValue("/ar-server");
  track.label = "";
  track.getSettings.mockReturnValue({});
  mocks.openCamera.mockResolvedValue(stream);
  mocks.portrait.mockResolvedValue(portraitStream);
  mocks.offer.mockResolvedValue({ type: "answer", sdp: "answer" });
});
afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

test.each(["ios", "android", "web"])(
  "%s에서 준비한 SDP를 localDescription과 서버 offer 요청에 동일하게 사용한다",
  async platform => {
    const originalSdp = "v=0\r\na=extmap:4 urn:3gpp:video-orientation\r\na=ice-ufrag:camera\r\n";
    const expectedSdp = platform === "ios" ? "v=0\r\na=ice-ufrag:camera\r\n" : originalSdp;
    class OrientationPeer extends Peer {
      localDescription = { type: "offer", sdp: originalSdp };
    }
    vi.mocked(Capacitor.getPlatform).mockReturnValue(platform);
    vi.stubGlobal("RTCPeerConnection", OrientationPeer);

    setup();
    await advance(0);

    expect(Peer.instances[0].setLocalDescription).toHaveBeenCalledWith({
      type: "offer",
      sdp: expectedSdp,
    });
    expect(mocks.offer).toHaveBeenCalledExactlyOnceWith(
      "/ar-server",
      { type: "offer", sdp: expectedSdp },
      expect.any(AbortSignal),
      { groom: "", groom_color: "" }
    );
  }
);

describe("ICE 후보 수집과 offer 전송", () => {
  beforeEach(async () => {
    const actual = await vi.importActual<typeof import("./peerConnection")>("./peerConnection");
    vi.mocked(waitForIceGatheringComplete).mockImplementationOnce(
      actual.waitForIceGatheringComplete
    );
  });

  test("3초가 지나면 재시도 없이 그때까지 수집한 localDescription을 전송한다", async () => {
    const hook = setup();
    await advance(0);
    const peer = Peer.instances[0];
    await advance(2999);
    expect(mocks.offer).not.toHaveBeenCalled();
    peer.localDescription = { type: "offer", sdp: "offer-with-collected-candidates" };

    await advance(1);
    expect(mocks.offer).toHaveBeenCalledExactlyOnceWith(
      "/ar-server",
      peer.localDescription,
      expect.any(AbortSignal),
      { groom: "", groom_color: "" }
    );
    expect(peer.setRemoteDescription).toHaveBeenCalledWith({ type: "answer", sdp: "answer" });
    expect(hook.result.current.connectionFeedback).toBe("connecting");

    await advance(10_000);
    expect(mocks.openCamera).toHaveBeenCalledTimes(1);
    expect(Peer.instances).toHaveLength(1);
    expect(track.stop).not.toHaveBeenCalled();
    expect(mocks.offer).toHaveBeenCalledTimes(1);
  });

  test("ICE 수집이 먼저 완료되면 3초를 기다리지 않고 한 번만 전송한다", async () => {
    setup();
    await advance(1000);
    const peer = Peer.instances[0];
    expect(mocks.offer).not.toHaveBeenCalled();

    peer.iceGatheringState = "complete";
    act(() => peer.dispatchEvent(new Event("icegatheringstatechange")));
    await advance(0);
    expect(mocks.offer).toHaveBeenCalledTimes(1);

    await advance(3000);
    expect(mocks.offer).toHaveBeenCalledTimes(1);
    expect(mocks.openCamera).toHaveBeenCalledTimes(1);
  });

  test("ICE 수집 중 페이지를 나가면 제한 시간이 지나도 offer를 전송하지 않는다", async () => {
    const hook = setup();
    await advance(1000);
    act(() => hook.result.current.handlePageLeave());

    await advance(3000);
    expect(mocks.offer).not.toHaveBeenCalled();
    expect(track.stop).toHaveBeenCalledTimes(1);
    expect(hook.result.current.connectionStatus).toBe("idle");
    expect(mocks.openCamera).toHaveBeenCalledTimes(1);
  });
});

describe("AR 연결 상태와 복구", () => {
  test.each([502, 503])(
    "서버 %s 응답은 카메라 재시도를 멈추고 수동 재시도로 복구한다",
    async status => {
      mocks.offer.mockRejectedValueOnce(
        new Error("server", { cause: new ApiHttpError(status, null) })
      );
      const hook = setup();
      await advance();
      expect(hook.result.current.connectionStatus).toBe("error");
      expect(hook.result.current.connectionFeedback).toBe("unavailable");
      expect(track.stop).toHaveBeenCalledTimes(1);
      act(() => Peer.instances[0].changeState("connected"));
      await advance(60_000);
      expect(hook.result.current.connectionStatus).toBe("error");
      expect(mocks.openCamera).toHaveBeenCalledTimes(1);
      expect(mocks.offer).toHaveBeenCalledTimes(1);
      act(() => hook.result.current.handleReconnect());
      await advance();
      act(() => Peer.instances[1].changeState("connected"));
      expect(hook.result.current.connectionStatus).toBe("connected");
      expect(mocks.openCamera).toHaveBeenCalledTimes(2);
    }
  );
  test.each([
    ["user", "", true],
    ["environment", "", false],
    [undefined, "FaceTime HD Camera (Built-in)", true],
    [undefined, "MacBook Pro Camera", true],
    [undefined, "iPhone Camera", false],
    [undefined, "알 수 없는 카메라", false],
  ])("로컬 방향 %s / 장치 %s의 반전 여부를 결정한다", async (facingMode, label, mirrored) => {
    track.label = label;
    track.getSettings.mockReturnValue({ facingMode });
    const hook = setup();
    await advance();
    expect(hook.result.current.isPreviewMirrored).toBe(mirrored);
  });
  test("최초에 후면이 열렸으면 다음 전환은 전면을 요청한다", async () => {
    track.getSettings.mockReturnValue({ facingMode: "environment" });
    const hook = setup();
    await advance();
    expect(hook.result.current.isPreviewMirrored).toBe(false);
    track.getSettings.mockReturnValue({ facingMode: "user" });
    act(() => hook.result.current.handleCameraSwitch());
    await advance();
    expect(mocks.openCamera).toHaveBeenLastCalledWith("user", true);
    expect(hook.result.current.isPreviewMirrored).toBe(true);
  });
  test.each(["user", "environment"])(
    "서버 영상으로 교체되어도 로컬 %s 방향을 유지한다",
    async facingMode => {
      track.getSettings.mockReturnValue({ facingMode });
      const preview = document.createElement("video");
      vi.spyOn(preview, "play").mockResolvedValue(undefined);
      const previewRef = { current: preview };
      const hook = renderHook(() =>
        useArServerConnection(previewRef, "", DEFAULT_GROOM_FIT_SETTINGS)
      );
      await advance();
      const remoteStream = { getVideoTracks: () => [{ getSettings: () => ({}) }] };
      const event = new Event("track");
      Object.defineProperties(event, {
        track: { value: { kind: "video" } },
        streams: { value: [remoteStream] },
      });
      act(() => Peer.instances[0].dispatchEvent(event));
      expect(preview.srcObject).toBe(remoteStream);
      expect(hook.result.current.isPreviewMirrored).toBe(facingMode === "user");
    }
  );
  test("방향 정보가 없는 카메라는 기본적으로 반전하지 않고 수동 전환 방향을 적용한다", async () => {
    const hook = setup();
    await advance();
    expect(hook.result.current.isPreviewMirrored).toBe(false);
    act(() => hook.result.current.handleCameraSwitch());
    await advance();
    expect(mocks.openCamera).toHaveBeenLastCalledWith("environment", true);
    expect(hook.result.current.isPreviewMirrored).toBe(false);
    act(() => hook.result.current.handleCameraSwitch());
    await advance();
    expect(hook.result.current.isPreviewMirrored).toBe(true);
  });
  test("후면 카메라 전환에 실패하면 재시도한 전면 카메라를 반전한다", async () => {
    const hook = setup();
    await advance();
    mocks.openCamera.mockRejectedValueOnce(new DOMException("camera", "OverconstrainedError"));
    act(() => hook.result.current.handleCameraSwitch());
    await advance();
    track.getSettings.mockReturnValue({ facingMode: "user" });
    act(() => hook.result.current.handleReconnect());
    await advance();
    expect(mocks.openCamera).toHaveBeenLastCalledWith("user", false);
    expect(hook.result.current.isPreviewMirrored).toBe(true);
  });
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
  test("일시적인 연결 흔들림이 복구되면 미리보기를 숨기거나 카메라를 다시 열지 않는다", async () => {
    const hook = setup();
    await advance();
    const peer = Peer.instances[0];
    act(() => peer.changeState("connected"));
    act(() => peer.changeState("disconnected"));
    expect(hook.result.current.connectionStatus).toBe("connected");
    await advance(1500);
    act(() => peer.changeState("connected"));
    await advance(3000);
    expect(hook.result.current.connectionStatus).toBe("connected");
    expect(mocks.openCamera).toHaveBeenCalledTimes(1);
    expect(track.stop).not.toHaveBeenCalled();
  });
  test("연결 흔들림이 2초 넘게 지속되면 카메라를 정리하고 재연결한다", async () => {
    const hook = setup();
    await advance();
    act(() => Peer.instances[0].changeState("connected"));
    act(() => Peer.instances[0].changeState("disconnected"));
    await advance(2001);
    expect(hook.result.current.connectionStatus).toBe("connecting");
    expect(hook.result.current.connectionFeedback).toBe("reconnecting");
    expect(track.stop).toHaveBeenCalledTimes(1);
    await advance(1001);
    await advance();
    expect(mocks.openCamera).toHaveBeenCalledTimes(2);
  });
  test("서버 설정 오류는 인터넷 장애로 표시하지 않는다", async () => {
    mocks.baseUrl.mockReturnValue("");
    const hook = setup();
    await advance(60_000);
    expect(hook.result.current.connectionFeedback).toBe("unavailable");
    expect(mocks.openCamera).not.toHaveBeenCalled();
  });
});

describe("네이티브 세로 송신 연결", () => {
  test.each(["ios", "android", "web"])(
    "%s에서 네이티브만 가공된 트랙을 전송하고 원본 방향 판별을 유지한다",
    async platform => {
      vi.mocked(Capacitor.getPlatform).mockReturnValue(platform);
      track.getSettings.mockReturnValue({ facingMode: "user" });
      const preview = document.createElement("video");
      vi.spyOn(preview, "play").mockResolvedValue(undefined);
      const previewRef = { current: preview };
      const hook = renderHook(() =>
        useArServerConnection(previewRef, "", DEFAULT_GROOM_FIT_SETTINGS)
      );
      await advance();
      const native = platform !== "web";
      expect(configureVideoSender).toHaveBeenCalledExactlyOnceWith(
        Peer.instances[0],
        native ? portraitTrack : track
      );
      expect(preview.srcObject).toBe(native ? portraitStream : stream);
      expect(hook.result.current.isPreviewMirrored).toBe(true);
      expect(mocks.portrait).toHaveBeenCalledTimes(native ? 1 : 0);
      if (native) {
        expect(mocks.portrait).toHaveBeenCalledWith(
          stream,
          expect.any(AbortSignal),
          expect.any(Function)
        );
      }
      hook.unmount();
      expect(track.stop).toHaveBeenCalledOnce();
      if (native) expect(mocks.portrait.mock.calls[0][1].aborted).toBe(true);
    }
  );

  test("가공 중 화면을 나가면 원본 카메라를 닫고 늦은 결과로 연결하지 않는다", async () => {
    vi.mocked(Capacitor.getPlatform).mockReturnValue("ios");
    let complete: (value: typeof portraitStream) => void = () => undefined;
    mocks.portrait.mockReturnValueOnce(
      new Promise(resolve => {
        complete = resolve;
      })
    );
    const hook = setup();
    await advance(0);
    act(() => hook.result.current.handlePageLeave());
    expect(track.stop).toHaveBeenCalledOnce();
    expect(mocks.portrait.mock.calls[0][1].aborted).toBe(true);
    await act(async () => complete(portraitStream));
    expect(Peer.instances).toHaveLength(0);
    expect(mocks.offer).not.toHaveBeenCalled();
    expect(hook.result.current.connectionStatus).toBe("idle");
  });

  test("세로 출력이 지원되지 않으면 원본을 송신하지 않고 카메라를 정리한다", async () => {
    vi.mocked(Capacitor.getPlatform).mockReturnValue("android");
    mocks.portrait.mockRejectedValueOnce(new DOMException("Unsupported", "NotSupportedError"));
    const hook = setup();
    await advance();
    expect(track.stop).toHaveBeenCalledOnce();
    expect(mocks.offer).not.toHaveBeenCalled();
    expect(configureVideoSender).not.toHaveBeenCalled();
    expect(hook.result.current.connectionStatus).toBe("error");
  });

  test("송신 중 프레임 처리가 실패하면 기존 재연결 경로로 복구한다", async () => {
    vi.mocked(Capacitor.getPlatform).mockReturnValue("ios");
    const hook = setup();
    await advance();
    act(() => Peer.instances[0].changeState("connected"));
    act(() => mocks.portrait.mock.calls[0][2]());
    expect(hook.result.current.connectionFeedback).toBe("reconnecting");
    expect(track.stop).toHaveBeenCalledOnce();
    expect(mocks.portrait.mock.calls[0][1].aborted).toBe(true);
    await advance(1001);
    await advance();
    expect(mocks.portrait).toHaveBeenCalledTimes(2);
  });
});

test("offer 준비 중 바뀐 최신 스타일과 색상을 보내고 실제 적용 groom을 보존한다", async () => {
  let ready: () => void = () => {};
  const iceReady = new Promise<void>(resolve => {
    ready = resolve;
  });
  vi.mocked(waitForIceGatheringComplete).mockReturnValueOnce(iceReady);
  mocks.offer.mockResolvedValue({ type: "answer", sdp: "answer", groom: "crop-cut" });
  const preview = { current: null };
  const hook = renderHook(
    ({ groom, color }) =>
      useArServerConnection(preview, groom, { ...DEFAULT_GROOM_FIT_SETTINGS, groom_color: color }),
    { initialProps: { groom: "", color: "" } }
  );
  await advance();
  hook.rerender({ groom: "크롭컷", color: "#123456" });
  await act(async () => ready());
  expect(mocks.offer).toHaveBeenCalledWith(
    "/ar-server",
    { type: "offer", sdp: "offer" },
    expect.any(AbortSignal),
    { groom: "크롭컷", groom_color: "#123456" }
  );
  expect(hook.result.current.offerGroom).toEqual({ requested: "크롭컷", applied: "crop-cut" });
  expect(Peer.instances[0].setRemoteDescription).toHaveBeenCalledWith({
    type: "answer",
    sdp: "answer",
  });
  expect(mocks.openCamera).toHaveBeenCalledTimes(1);
});

test("groom null 응답이어도 연결을 실패 처리하지 않는다", async () => {
  mocks.offer.mockResolvedValue({ type: "answer", sdp: "answer", groom: null });
  const hook = setup();
  await advance();
  act(() => Peer.instances[0].changeState("connected"));
  expect(hook.result.current.connectionStatus).toBe("connected");
  expect(hook.result.current.offerGroom).toEqual({ requested: "", applied: null });
});

test.each(["crop-cut", null])("서버의 실제 groom %s를 초기 fit 제어에 반영한다", async applied => {
  mocks.offer.mockResolvedValue({ type: "answer", sdp: "answer", groom: applied });
  const preview = { current: null };
  renderHook(() => useArServerConnection(preview, "크롭컷", DEFAULT_GROOM_FIT_SETTINGS));
  await advance();
  expect(mocks.fitGroom).toHaveBeenLastCalledWith(applied ?? "");
});
