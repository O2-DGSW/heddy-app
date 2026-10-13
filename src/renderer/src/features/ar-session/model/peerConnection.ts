/** AR 서버와의 WebRTC 연결에 쓰는 헬퍼. React 상태와 무관하다 */

const ICE_GATHERING_TIMEOUT_MS = 10000;

export const waitForIceGatheringComplete = async (
  peerConnection: RTCPeerConnection,
  signal: AbortSignal
): Promise<void> => {
  signal.throwIfAborted();
  if (peerConnection.iceGatheringState === "complete") {
    return;
  }

  await new Promise<void>((resolve, reject) => {
    const timeout = window.setTimeout(() => {
      cleanup();
      reject(new Error("ICE candidate 수집 시간이 초과되었습니다."));
    }, ICE_GATHERING_TIMEOUT_MS);

    const handleIceGatheringStateChange = () => {
      if (peerConnection.iceGatheringState !== "complete") {
        return;
      }

      cleanup();
      resolve();
    };

    const handleAbort = () => {
      cleanup();
      reject(signal.reason);
    };

    const cleanup = () => {
      signal.removeEventListener("abort", handleAbort);
      window.clearTimeout(timeout);
      peerConnection.removeEventListener("icegatheringstatechange", handleIceGatheringStateChange);
    };

    signal.addEventListener("abort", handleAbort, { once: true });
    peerConnection.addEventListener("icegatheringstatechange", handleIceGatheringStateChange);
  });
};

export const configureVideoSender = (
  peerConnection: RTCPeerConnection,
  track: MediaStreamTrack
): void => {
  // 합성 영상 수신과 카메라 송출을 같은 transceiver에서 협상한다.
  const transceiver = peerConnection.addTransceiver(track, { direction: "sendrecv" });
  const vp8Codecs = RTCRtpSender.getCapabilities("video")?.codecs.filter(codec =>
    codec.mimeType.toLowerCase().includes("video/vp8")
  );

  if (vp8Codecs?.length) {
    transceiver.setCodecPreferences(vp8Codecs);
  }

  const parameters = transceiver.sender.getParameters();
  const encoding = parameters.encodings?.[0] ?? {};
  parameters.degradationPreference = "maintain-resolution";
  parameters.encodings = [
    { ...encoding, maxBitrate: 8_000_000, maxFramerate: 30, scaleResolutionDownBy: 1 },
  ];
  void transceiver.sender.setParameters(parameters).catch(() => undefined);
};

/** 전면 카메라를 연다. 카메라를 쓸 수 없는 환경이면 이유를 담아 던진다 */
export const openFrontCamera = (): Promise<MediaStream> => {
  if (!navigator.mediaDevices?.getUserMedia) {
    throw new Error("카메라를 사용할 수 없습니다. HTTPS 또는 localhost에서 다시 시도해 주세요.");
  }

  return navigator.mediaDevices.getUserMedia({
    audio: false,
    video: {
      facingMode: { ideal: "user" },
      frameRate: { ideal: 30, max: 30 },
      width: { ideal: 640, max: 640 },
      height: { ideal: 480, max: 480 },
    },
  });
};

export const getArConnectionErrorMessage = (error: unknown): string => {
  if (error instanceof DOMException) {
    if (error.name === "NotAllowedError") {
      return "카메라 권한이 필요합니다. 브라우저 또는 기기 설정에서 Heddy의 카메라 접근을 허용해 주세요.";
    }

    if (error.name === "NotFoundError") {
      return "사용 가능한 카메라를 찾지 못했습니다. 연결 상태를 확인해 주세요.";
    }

    if (error.name === "NotReadableError") {
      return "카메라가 다른 앱에서 사용 중입니다. 카메라를 사용하는 앱을 종료한 뒤 다시 시도해 주세요.";
    }

    if (error.name === "SecurityError") {
      return "보안 정책으로 카메라에 접근할 수 없습니다. HTTPS 또는 기기 앱에서 다시 시도해 주세요.";
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "AR 서버에 연결하지 못했습니다. 네트워크와 카메라 권한을 확인해 주세요.";
};
