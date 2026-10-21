import { Capacitor } from "@capacitor/core";
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import {
  configureVideoSender,
  openCamera,
  prepareArServerOffer,
  resolveCameraFacingMode,
} from "./peerConnection";

vi.mock("./cameraPermission", () => ({ requestNativeCameraPermission: vi.fn() }));

beforeEach(() => {
  vi.spyOn(Capacitor, "getPlatform").mockReturnValue("web");
});
afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

const orientationOffer = {
  type: "offer",
  sdp: [
    "v=0",
    "m=video 9 UDP/TLS/RTP/SAVPF 96",
    "a=extmap:1 urn:ietf:params:rtp-hdrext:sdes:mid",
    "a=extmap:2 urn:3gpp:video-orientation",
    "a=extmap:3/sendrecv urn:3GPP:video-orientation:6",
    "a=extmap:4 urn:ietf:params:rtp-hdrext:encrypt urn:3gpp:video-orientation",
    "a=extmap:5 http://www.ietf.org/id/draft-holmer-rmcat-transport-wide-cc-extensions-01",
    "a=extmap:6 urn:3gpp:video-orientation-other",
    "a=rtpmap:96 VP8/90000",
    "a=ice-ufrag:camera",
    "a=candidate:1 1 UDP 1 192.0.2.1 5000 typ host",
    "",
  ].join("\r\n"),
} satisfies RTCSessionDescriptionInit;

test.each(["\r\n", "\n"])(
  "iOS offer는 회전 확장만 제외하고 코덱·ICE·다른 확장과 줄바꿈(%j)을 보존한다",
  newline => {
    const offer = { ...orientationOffer, sdp: orientationOffer.sdp.replaceAll("\r\n", newline) };
    const prepared = prepareArServerOffer(offer, "ios");
    expect(prepared.type).toBe("offer");
    expect(prepared.sdp).toBe(
      [
        "v=0",
        "m=video 9 UDP/TLS/RTP/SAVPF 96",
        "a=extmap:1 urn:ietf:params:rtp-hdrext:sdes:mid",
        "a=extmap:5 http://www.ietf.org/id/draft-holmer-rmcat-transport-wide-cc-extensions-01",
        "a=extmap:6 urn:3gpp:video-orientation-other",
        "a=rtpmap:96 VP8/90000",
        "a=ice-ufrag:camera",
        "a=candidate:1 1 UDP 1 192.0.2.1 5000 typ host",
        "",
      ].join(newline)
    );
    expect(offer.sdp).toContain("urn:3gpp:video-orientation");
    expect(prepareArServerOffer(prepared, "ios")).toEqual(prepared);
  }
);

test.each(["android", "web"])("%s의 offer는 회전 확장까지 그대로 유지한다", platform => {
  expect(prepareArServerOffer(orientationOffer, platform)).toBe(orientationOffer);
});

test("iOS에서도 SDP가 없거나 offer가 아닌 설명은 변경하지 않는다", () => {
  const empty: RTCSessionDescriptionInit = { type: "offer" };
  const answer: RTCSessionDescriptionInit = { ...orientationOffer, type: "answer" };
  expect(prepareArServerOffer(empty, "ios")).toBe(empty);
  expect(prepareArServerOffer(answer, "ios")).toBe(answer);
});

const setupSender = (rejectPreference = false, codecs: RTCRtpCodec[] = []) => {
  const parameters: RTCRtpSendParameters = {
    transactionId: "camera",
    codecs: [],
    headerExtensions: [],
    rtcp: {},
    encodings: [{ active: true }],
  };
  const setParameters = vi.fn(async () => {
    if (rejectPreference) throw new DOMException("Unsupported preference", "NotSupportedError");
  });
  const setCodecPreferences = vi.fn();
  const addTransceiver = vi.fn(() => ({
    sender: { getParameters: () => parameters, setParameters },
    setCodecPreferences,
  }));
  vi.stubGlobal("RTCRtpSender", { getCapabilities: () => ({ codecs }) });
  vi.stubGlobal(
    "RTCPeerConnection",
    class {
      addTransceiver = addTransceiver;
    }
  );
  vi.stubGlobal(
    "MediaStreamTrack",
    class {
      contentHint = "";
    }
  );
  const track = new MediaStreamTrack();
  configureVideoSender(new RTCPeerConnection(), track);
  return { track, parameters, addTransceiver, setParameters, setCodecPreferences };
};

test("협상 시점부터 전송 한도를 설정하고 인코딩 목록을 교체하지 않는다", () => {
  const { track, parameters, addTransceiver } = setupSender();
  expect(track.contentHint).toBe("motion");
  expect(addTransceiver).toHaveBeenCalledWith(track, {
    direction: "sendrecv",
    sendEncodings: [{ maxBitrate: 8_000_000, maxFramerate: 30, scaleResolutionDownBy: 1 }],
  });
  expect(parameters.degradationPreference).toBe("maintain-framerate");
  expect(parameters.encodings).toEqual([{ active: true }]);
});

test("브라우저가 프레임 우선 설정을 거부해도 초기 전송 한도와 연결은 유지한다", async () => {
  const { addTransceiver, setParameters } = setupSender(true);
  await Promise.resolve();
  expect(addTransceiver).toHaveBeenCalledTimes(1);
  expect(setParameters).toHaveBeenCalledTimes(1);
});

test("VP8 우선 협상에서도 패킷 손실 복구 코덱과 대체 코덱을 보존한다", () => {
  const codecs = ["H264", "rtx", "VP8", "red", "ulpfec"].map(name => ({
    mimeType: `video/${name}`,
    clockRate: 90000,
  }));
  const { setCodecPreferences } = setupSender(false, codecs);
  expect(setCodecPreferences).toHaveBeenCalledWith([
    codecs[2],
    codecs[0],
    codecs[1],
    codecs[3],
    codecs[4],
  ]);
});

test("VP8이 없는 기기에서는 브라우저 기본 코덱 협상을 유지한다", () => {
  const { setCodecPreferences } = setupSender(false, [
    { mimeType: "video/H264", clockRate: 90000 },
  ]);
  expect(setCodecPreferences).not.toHaveBeenCalled();
});

test.each([
  ["user", "iPhone Camera", "environment", "user"],
  ["environment", "FaceTime HD Camera", "user", "environment"],
  [undefined, "FaceTime HD Camera (Built-in)", undefined, "user"],
  [undefined, "MacBook Pro Camera", undefined, "user"],
  [undefined, "iPhone Camera", "user", "environment"],
  [undefined, "연속성 카메라", undefined, "environment"],
  [undefined, "후면 카메라", undefined, "environment"],
  [undefined, "전면 카메라", undefined, "user"],
  [undefined, "USB camera", "user", "user"],
  [undefined, "USB camera", "environment", "environment"],
  [undefined, "USB camera", undefined, null],
] as const)(
  "방향=%s 장치=%s 명시 요청=%s인 로컬 카메라를 판별한다",
  (facingMode, label, exactMode, expected) => {
    vi.stubGlobal(
      "MediaStreamTrack",
      class {
        label = label;
        getSettings = () => ({ facingMode });
      }
    );
    expect(resolveCameraFacingMode(new MediaStreamTrack(), exactMode)).toBe(expected);
  }
);

test("카메라 트랙이 없으면 전면으로 추정하지 않는다", () => {
  expect(resolveCameraFacingMode(undefined, "user")).toBeNull();
});

test.each([false, true])(
  "고해상도를 선호값으로 요청하고 방향의 exact 여부(%s)를 보존한다",
  async exact => {
    const stream = {};
    const getUserMedia = vi.fn().mockResolvedValue(stream);
    vi.stubGlobal("navigator", { mediaDevices: { getUserMedia } });
    expect(await openCamera("environment", exact)).toBe(stream);
    expect(getUserMedia).toHaveBeenCalledWith({
      audio: false,
      video: {
        facingMode: exact ? { exact: "environment" } : { ideal: "environment" },
        width: { ideal: 800 },
        height: { ideal: 1298 },
        aspectRatio: { ideal: 800 / 1298 },
        frameRate: { ideal: 30, max: 30 },
        zoom: { ideal: 0.5 },
      },
    });
  }
);

test.each(["ios", "android"])(
  "%s는 기기 기본 방향 기준으로 카메라 비율을 요청하고 카메라 전환 조건을 유지한다",
  async platform => {
    vi.mocked(Capacitor.getPlatform).mockReturnValue(platform);
    const stream = {};
    const getUserMedia = vi.fn().mockResolvedValue(stream);
    vi.stubGlobal("navigator", { mediaDevices: { getUserMedia } });
    expect(await openCamera("user", true)).toBe(stream);
    expect(getUserMedia).toHaveBeenCalledWith({
      audio: false,
      video: {
        facingMode: { exact: "user" },
        width: { ideal: 1298 },
        height: { ideal: 800 },
        aspectRatio: { ideal: 1298 / 800 },
        resizeMode: "crop-and-scale",
        frameRate: { ideal: 30, max: 30 },
        zoom: { ideal: 0.5 },
      },
    });
  }
);
