/** AR 서버와의 WebRTC 연결에 쓰는 헬퍼. React 상태와 무관하다 */
import { requestNativeCameraPermission } from "./cameraPermission";

const ICE_GATHERING_TIMEOUT_MS = 3000;
export type ArCameraFacingModeType = "user" | "environment";

export const resolveCameraFacingMode = (
  track: MediaStreamTrack | undefined,
  exactFacingMode?: ArCameraFacingModeType
): ArCameraFacingModeType | null => {
  if (!track) return null;
  const facingMode = track.getSettings().facingMode;
  if (facingMode === "user" || facingMode === "environment") return facingMode;

  // 데스크톱 카메라는 facingMode를 생략할 수 있다. 장치 이름은 표준이 아니므로
  // 알려진 내장/연속성 카메라만 보완하고, 식별 불가능한 장치는 전면으로 추정하지 않는다.
  const label = track.label ?? "";
  if (
    /\b(back|rear|environment|iphone|continuity|desk view)\b|후면|후방|아이폰|연속성|데스크뷰/i.test(
      label
    )
  ) {
    return "environment";
  }
  if (/\b(facetime|front|built[ -]?in|macbook)\b|전면|내장 카메라|맥북/i.test(label)) {
    return "user";
  }
  return exactFacingMode ?? null;
};

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
      // 늦은 후보 때문에 연결을 다시 시작하지 않고, 지금까지 모인 localDescription을 전송한다.
      resolve();
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
  track.contentHint = "motion";
  const transceiver = peerConnection.addTransceiver(track, {
    direction: "sendrecv",
    sendEncodings: [{ maxBitrate: 8_000_000, maxFramerate: 30, scaleResolutionDownBy: 1 }],
  });
  const codecs = RTCRtpSender.getCapabilities("video")?.codecs ?? [];
  const vp8Codecs = codecs.filter(codec => codec.mimeType.toLowerCase() === "video/vp8");

  if (vp8Codecs.length && typeof transceiver.setCodecPreferences === "function") {
    // VP8을 우선하되 재전송·오류 복구 코덱과 다른 지원 코덱을 협상에서 제외하지 않는다.
    transceiver.setCodecPreferences([
      ...vp8Codecs,
      ...codecs.filter(codec => codec.mimeType.toLowerCase() !== "video/vp8"),
    ]);
  }

  const parameters = transceiver.sender.getParameters();
  // 부하가 높을 때 해상도를 조절해 움직임을 유지한다. 인코딩 제한은 생성 시 설정해
  // 선택적인 degradationPreference 적용이 거부돼도 유지되도록 한다.
  parameters.degradationPreference = "maintain-framerate";
  void transceiver.sender.setParameters(parameters).catch(() => undefined);
};

export const prepareArServerOffer = (
  offer: RTCSessionDescriptionInit,
  platform: string
): RTCSessionDescriptionInit => {
  if (platform !== "ios" || offer.type !== "offer" || !offer.sdp) return offer;

  // AR 서버가 회전 메타데이터 대신 픽셀을 처리하므로 iOS가 전송 전에 방향을 적용하게 한다.
  // WebKit: https://bugs.webkit.org/show_bug.cgi?id=85851#c90
  const sdp = offer.sdp
    .split("\n")
    .filter(
      line =>
        !/^a=extmap:\d+(?:\/\S+)?[ \t]+(?:urn:ietf:params:rtp-hdrext:encrypt[ \t]+)?urn:3gpp:video-orientation(?::6)?(?:[ \t\r]|$)/i.test(
          line
        )
    )
    .join("\n");

  return { ...offer, sdp };
};

/** 요청한 방향의 카메라를 연다. 카메라를 쓸 수 없는 환경이면 이유를 담아 던진다 */
export const openCamera = async (
  facingMode: ArCameraFacingModeType = "user",
  requireExactFacingMode = false
): Promise<MediaStream> => {
  if (!navigator.mediaDevices?.getUserMedia) {
    throw new Error("이 환경에서는 카메라를 사용할 수 없습니다.");
  }

  await requestNativeCameraPermission();

  // 고밀도 화면에서 확대 표시되지 않도록 서버의 800×1298 출력에 입력을 맞춘다.
  // 선호 크기를 지원하지 않는 카메라는 브라우저가 가능한 크기로 조절한다.
  const video: MediaTrackConstraints & { zoom: ConstrainDouble } = {
    facingMode: requireExactFacingMode ? { exact: facingMode } : { ideal: facingMode },
    frameRate: { ideal: 30, max: 30 },
    width: { ideal: 800 },
    height: { ideal: 1298 },
    aspectRatio: { ideal: 800 / 1298 },
    zoom: { ideal: 0.5 },
  };
  return navigator.mediaDevices.getUserMedia({ audio: false, video });
};

export const getArConnectionErrorMessage = (error: unknown): string => {
  if (error instanceof DOMException) {
    if (error.name === "NotAllowedError") {
      return "카메라 권한이 필요합니다. 브라우저 또는 기기 설정에서 Heddy의 카메라 접근을 허용해 주세요.";
    }

    if (error.name === "NotFoundError") {
      return "사용 가능한 카메라를 찾지 못했습니다. 연결 상태를 확인해 주세요.";
    }

    if (error.name === "OverconstrainedError") {
      return "전환할 카메라를 사용할 수 없습니다. 현재 기기에서 사용 가능한 카메라를 확인해 주세요.";
    }

    if (error.name === "NotReadableError") {
      return "카메라가 다른 앱에서 사용 중입니다. 카메라를 사용하는 앱을 종료한 뒤 다시 시도해 주세요.";
    }

    if (error.name === "SecurityError") {
      return "보안 정책으로 카메라에 접근할 수 없습니다. HTTPS 또는 기기 앱에서 다시 시도해 주세요.";
    }
  }

  // 앱이 직접 만든 Error만 문구를 그대로 쓴다. TypeError·DOMException 등 브라우저 오류의 문구는
  // 기술 용어라 사용자에게 보여 주지 않는다.
  if (error instanceof Error && error.name === "Error" && error.message) {
    return error.message;
  }

  return "AR 서버에 연결하지 못했습니다. 네트워크를 확인하고 다시 연결해 주세요.";
};
