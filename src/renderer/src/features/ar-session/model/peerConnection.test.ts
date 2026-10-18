import { afterEach, expect, test, vi } from "vitest";
import { configureVideoSender } from "./peerConnection";

vi.mock("./cameraPermission", () => ({ requestNativeCameraPermission: vi.fn() }));

afterEach(() => vi.unstubAllGlobals());

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
