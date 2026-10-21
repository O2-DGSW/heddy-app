// @vitest-environment jsdom
import { afterEach, beforeEach, expect, test, vi } from "vitest";

import { createPortraitCameraStream } from "./portraitCameraStream";

class CameraTrack {
  stop = vi.fn();
}
class CameraStream {
  track = new CameraTrack();
  getTracks = () => [this.track];
  getVideoTracks = () => [this.track];
}

let video: HTMLVideoElement;
let width = 1280;
let height = 720;
let ready = 2;
let nextFrame: VideoFrameRequestCallback;
const drawImage = vi.fn();
const capture = vi.fn();
const cancelFrame = vi.fn();
const play = vi.fn();
const pause = vi.fn();
const frameError = vi.fn();
let controller: AbortController;

beforeEach(() => {
  vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
  vi.clearAllMocks();
  width = 1280;
  height = 720;
  ready = 2;
  controller = new AbortController();
  vi.stubGlobal("MediaStream", CameraStream);
  vi.spyOn(HTMLVideoElement.prototype, "videoWidth", "get").mockImplementation(() => width);
  vi.spyOn(HTMLVideoElement.prototype, "videoHeight", "get").mockImplementation(() => height);
  vi.spyOn(HTMLMediaElement.prototype, "readyState", "get").mockImplementation(() => ready);
  play.mockResolvedValue(undefined);
  vi.spyOn(HTMLMediaElement.prototype, "play").mockImplementation(function (
    this: HTMLVideoElement
  ) {
    video = this;
    return play();
  });
  vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(pause);
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue({
    drawImage,
  } as unknown as CanvasRenderingContext2D);
  capture.mockImplementation(() => new MediaStream());
  Object.defineProperty(HTMLCanvasElement.prototype, "captureStream", {
    configurable: true,
    value: capture,
  });
  Object.defineProperty(HTMLVideoElement.prototype, "requestVideoFrameCallback", {
    configurable: true,
    value: vi.fn((callback: VideoFrameRequestCallback) => {
      nextFrame = callback;
      return 1;
    }),
  });
  Object.defineProperty(HTMLVideoElement.prototype, "cancelVideoFrameCallback", {
    configurable: true,
    value: cancelFrame,
  });
});

afterEach(() => {
  controller.abort();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  vi.useRealTimers();
  Reflect.deleteProperty(HTMLCanvasElement.prototype, "captureStream");
  Reflect.deleteProperty(HTMLVideoElement.prototype, "requestVideoFrameCallback");
  Reflect.deleteProperty(HTMLVideoElement.prototype, "cancelVideoFrameCallback");
});

test.each([
  [1280, 720],
  [720, 1280],
])(
  "%sx%s 입력을 회전·왜곡 없이 가운데를 잘라 800x1298로 출력한다",
  async (inputWidth, inputHeight) => {
    width = inputWidth;
    height = inputHeight;
    const source = new MediaStream();
    const output = await createPortraitCameraStream(source, controller.signal, frameError);
    const canvas = capture.mock.instances[0];
    if (!(canvas instanceof HTMLCanvasElement)) throw new Error("캡처 canvas가 없습니다.");
    expect(canvas.width).toBe(800);
    expect(canvas.height).toBe(1298);
    expect(capture).toHaveBeenCalledExactlyOnceWith(30);
    expect(output).not.toBe(source);
    const scale = Math.max(800 / width, 1298 / height);
    expect(drawImage).toHaveBeenLastCalledWith(
      video,
      (width - 800 / scale) / 2,
      (height - 1298 / scale) / 2,
      800 / scale,
      1298 / scale,
      0,
      0,
      800,
      1298
    );
    expect(video.muted).toBe(true);
    expect(video.playsInline).toBe(true);
  }
);

test("실행 중 입력 방향이 바뀌어도 다음 프레임부터 새 비율로 자른다", async () => {
  await createPortraitCameraStream(new MediaStream(), controller.signal, frameError);
  width = 720;
  height = 1280;
  nextFrame(40, {} as VideoFrameCallbackMetadata);
  const args = drawImage.mock.lastCall;
  expect(args?.[1]).toBeCloseTo(0);
  expect(args?.[2]).toBeCloseTo((1280 - (1298 * 720) / 800) / 2);
  expect(args?.slice(5)).toEqual([0, 0, 800, 1298]);
  expect(drawImage).toHaveBeenCalledTimes(2);
});

test("첫 프레임이 준비되기 전에는 출력 트랙을 만들지 않는다", async () => {
  ready = 0;
  const pending = createPortraitCameraStream(new MediaStream(), controller.signal, frameError);
  await Promise.resolve();
  expect(capture).not.toHaveBeenCalled();
  ready = 2;
  video.dispatchEvent(new Event("loadeddata"));
  await pending;
  expect(capture).toHaveBeenCalledOnce();
});

test("첫 프레임을 기다리다 취소하면 재생 요소와 타이머를 정리한다", async () => {
  ready = 0;
  const source = new MediaStream();
  const pending = createPortraitCameraStream(source, controller.signal, frameError);
  const rejection = expect(pending).rejects.toMatchObject({ name: "AbortError" });
  controller.abort();
  await rejection;
  expect(video.srcObject).toBeNull();
  expect(pause).toHaveBeenCalledOnce();
  expect(vi.getTimerCount()).toBe(0);
  expect(capture).not.toHaveBeenCalled();
  expect(source.getVideoTracks()[0].stop).not.toHaveBeenCalled();
});

test("연결 종료는 생성한 트랙만 중지하고 원본 카메라 소유권을 유지한다", async () => {
  const source = new MediaStream();
  const output = await createPortraitCameraStream(source, controller.signal, frameError);
  controller.abort();
  controller.abort();
  expect(output.getVideoTracks()[0].stop).toHaveBeenCalledOnce();
  expect(source.getVideoTracks()[0].stop).not.toHaveBeenCalled();
  expect(cancelFrame).toHaveBeenCalledWith(1);
  expect(video.srcObject).toBeNull();
  nextFrame(40, {} as VideoFrameCallbackMetadata);
  expect(drawImage).toHaveBeenCalledOnce();
  expect(frameError).not.toHaveBeenCalled();
});

test("프레임 처리 실패 시 출력 리소스를 정리하고 기존 복구 경로를 호출한다", async () => {
  const output = await createPortraitCameraStream(new MediaStream(), controller.signal, frameError);
  drawImage.mockImplementationOnce(() => {
    throw new Error("frame failure");
  });
  nextFrame(40, {} as VideoFrameCallbackMetadata);
  expect(output.getVideoTracks()[0].stop).toHaveBeenCalledOnce();
  expect(frameError).toHaveBeenCalledOnce();
  expect(video.srcObject).toBeNull();
});

test("첫 프레임이 10초 동안 없으면 실패하고 대기 타이머를 남기지 않는다", async () => {
  ready = 0;
  const pending = createPortraitCameraStream(new MediaStream(), controller.signal, frameError);
  const rejection = expect(pending).rejects.toThrow("카메라 영상을 준비하지 못했습니다.");
  await vi.advanceTimersByTimeAsync(10_000);
  await rejection;
  expect(video.srcObject).toBeNull();
  expect(vi.getTimerCount()).toBe(0);
});

test("재생 실패는 원래 오류를 전달하고 출력 트랙을 만들지 않는다", async () => {
  play.mockRejectedValueOnce(new DOMException("Playback denied", "NotAllowedError"));
  await expect(
    createPortraitCameraStream(new MediaStream(), controller.signal, frameError)
  ).rejects.toMatchObject({ name: "NotAllowedError" });
  expect(capture).not.toHaveBeenCalled();
  expect(video.srcObject).toBeNull();
});

test("canvas 캡처를 지원하지 않으면 원본 가로 트랙을 대신 송신하지 않고 실패한다", async () => {
  Reflect.deleteProperty(HTMLCanvasElement.prototype, "captureStream");
  await expect(
    createPortraitCameraStream(new MediaStream(), controller.signal, frameError)
  ).rejects.toMatchObject({ name: "NotSupportedError" });
});

test("출력 트랙 생성 실패 시 캡처 리소스를 정리한다", async () => {
  capture.mockReturnValueOnce({ getTracks: () => [], getVideoTracks: () => [] });
  await expect(
    createPortraitCameraStream(new MediaStream(), controller.signal, frameError)
  ).rejects.toMatchObject({ name: "NotSupportedError" });
  expect(video.srcObject).toBeNull();
});

test("이미 취소된 연결에서는 카메라 재생을 시작하지 않는다", async () => {
  controller.abort();
  await expect(
    createPortraitCameraStream(new MediaStream(), controller.signal, frameError)
  ).rejects.toMatchObject({ name: "AbortError" });
  expect(play).not.toHaveBeenCalled();
});

test("video frame callback이 없는 환경에서는 animation frame을 취소한다", async () => {
  Reflect.deleteProperty(HTMLVideoElement.prototype, "requestVideoFrameCallback");
  const request = vi.fn().mockReturnValue(7);
  const cancel = vi.fn();
  vi.stubGlobal("requestAnimationFrame", request);
  vi.stubGlobal("cancelAnimationFrame", cancel);
  await createPortraitCameraStream(new MediaStream(), controller.signal, frameError);
  controller.abort();
  expect(request).toHaveBeenCalledOnce();
  expect(cancel).toHaveBeenCalledWith(7);
});
