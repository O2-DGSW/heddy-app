const PORTRAIT_WIDTH = 800;
const PORTRAIT_HEIGHT = 1298;
const FRAME_RATE = 30;
const FIRST_FRAME_TIMEOUT_MS = 10_000;

/**
 * video가 재생한 방향을 세로 픽셀로 고정한다. 원본 카메라의 소유권은 호출부에 두고,
 * 연결 취소 시 여기서 만든 트랙·재생 요소·프레임 콜백만 정리한다.
 */
export const createPortraitCameraStream = async (
  source: MediaStream,
  signal: AbortSignal,
  onFrameError: () => void
): Promise<MediaStream> => {
  signal.throwIfAborted();
  const video = document.createElement("video");
  video.muted = true;
  video.playsInline = true;
  const canvas = document.createElement("canvas");
  canvas.width = PORTRAIT_WIDTH;
  canvas.height = PORTRAIT_HEIGHT;
  const context = canvas.getContext("2d", { alpha: false });
  if (!context || typeof canvas.captureStream !== "function") {
    throw new DOMException("Portrait capture unavailable", "NotSupportedError");
  }

  let stream: MediaStream | undefined;
  let videoFrameId: number | undefined;
  let animationFrameId: number | undefined;
  let rejectFirstFrame: ((reason: unknown) => void) | undefined;
  let stopped = false;
  const stop = () => {
    if (stopped) return;
    stopped = true;
    signal.removeEventListener("abort", stop);
    rejectFirstFrame?.(signal.reason ?? new DOMException("Capture stopped", "AbortError"));
    if (videoFrameId !== undefined) video.cancelVideoFrameCallback(videoFrameId);
    if (animationFrameId !== undefined) cancelAnimationFrame(animationFrameId);
    stream?.getTracks().forEach(track => track.stop());
    video.pause();
    video.srcObject = null;
  };
  signal.addEventListener("abort", stop, { once: true });

  try {
    await new Promise<void>((resolve, reject) => {
      let settled = false;
      const finish = (error?: unknown) => {
        if (settled) return;
        settled = true;
        clearTimeout(timeout);
        video.removeEventListener("loadeddata", handleReady);
        video.removeEventListener("error", handleError);
        rejectFirstFrame = undefined;
        if (error !== undefined) reject(error);
        else resolve();
      };
      const handleReady = () => {
        if (
          video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA &&
          video.videoWidth > 0 &&
          video.videoHeight > 0
        )
          finish();
      };
      const handleError = () => finish(new Error("카메라 영상을 준비하지 못했습니다."));
      const timeout = setTimeout(handleError, FIRST_FRAME_TIMEOUT_MS);
      rejectFirstFrame = finish;
      video.addEventListener("loadeddata", handleReady);
      video.addEventListener("error", handleError);
      video.srcObject = source;
      void video.play().then(handleReady, finish);
    });
    signal.throwIfAborted();

    const draw = () => {
      const width = video.videoWidth;
      const height = video.videoHeight;
      if (!width || !height) return;
      // 화면 비율만 맞춘다. 가로 해상도라는 이유로 사람을 임의로 90도 회전하지 않는다.
      const scale = Math.max(PORTRAIT_WIDTH / width, PORTRAIT_HEIGHT / height);
      const cropWidth = PORTRAIT_WIDTH / scale;
      const cropHeight = PORTRAIT_HEIGHT / scale;
      context.drawImage(
        video,
        (width - cropWidth) / 2,
        (height - cropHeight) / 2,
        cropWidth,
        cropHeight,
        0,
        0,
        PORTRAIT_WIDTH,
        PORTRAIT_HEIGHT
      );
    };
    draw();
    stream = canvas.captureStream(FRAME_RATE);
    if (stream.getVideoTracks().length === 0) {
      throw new DOMException("Portrait track unavailable", "NotSupportedError");
    }

    const hasVideoFrameCallback = typeof video.requestVideoFrameCallback === "function";
    let lastDrawTime = 0;
    const handleFrame = (now: number) => {
      if (stopped) return;
      try {
        if (hasVideoFrameCallback || now - lastDrawTime >= 1000 / FRAME_RATE) {
          draw();
          lastDrawTime = now;
        }
        scheduleFrame();
      } catch {
        stop();
        onFrameError();
      }
    };
    const scheduleFrame = () => {
      if (hasVideoFrameCallback) videoFrameId = video.requestVideoFrameCallback(handleFrame);
      else animationFrameId = requestAnimationFrame(handleFrame);
    };
    scheduleFrame();
    return stream;
  } catch (error) {
    stop();
    throw error;
  }
};
