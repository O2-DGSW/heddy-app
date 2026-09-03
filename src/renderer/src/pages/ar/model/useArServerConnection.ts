import { useCallback, useEffect, useMemo, useRef, useState, type RefObject } from "react";

import { getArServerBaseUrl, requestArServerOffer } from "./arServerApi";
import {
  isCapturedLivebankBucket,
  mergeLivebankProgress,
  parseArServerEvent,
  parseDataChannelPayload,
  type ArLivebankProgress,
  type ArStats,
} from "./arServerEvent";

export type { ArLivebankProgress, ArStats } from "./arServerEvent";

export type ArConnectionStatusType = "connecting" | "connected" | "error" | "idle";

interface UseArServerConnectionResult {
  connectionStatus: ArConnectionStatusType;
  errorMessage: string | null;
  capturedYawTargets: number[];
  livebankProgress: ArLivebankProgress | null;
  stats: ArStats | null;
}

const waitForIceGatheringComplete = async (peerConnection: RTCPeerConnection): Promise<void> => {
  if (peerConnection.iceGatheringState === "complete") {
    return;
  }

  await new Promise<void>((resolve, reject) => {
    const timeout = window.setTimeout(() => {
      cleanup();
      reject(new Error("ICE candidate 수집 시간이 초과되었습니다."));
    }, 10000);

    const handleIceGatheringStateChange = () => {
      if (peerConnection.iceGatheringState !== "complete") {
        return;
      }

      cleanup();
      resolve();
    };

    const cleanup = () => {
      window.clearTimeout(timeout);
      peerConnection.removeEventListener("icegatheringstatechange", handleIceGatheringStateChange);
    };

    peerConnection.addEventListener("icegatheringstatechange", handleIceGatheringStateChange);
  });
};

const configureVideoSender = (peerConnection: RTCPeerConnection, track: MediaStreamTrack): void => {
  // 서버는 응답 비디오 트랙을 전송하는 시점에 입력 프레임을 소비한다.
  // sendonly로 협상하면 서버 출력 트랙이 SDP에 포함되지 않아 서버의 recv()가
  // 호출되지 않고, 결과적으로 yaw·LiveBank 수집이 진행되지 않는다.
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
  void transceiver.sender.setParameters(parameters);
};

const getArConnectionErrorMessage = (error: unknown): string => {
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

export const useArServerConnection = (
  previewVideoRef: RefObject<HTMLVideoElement | null>,
  faceTrackingVideoRef: RefObject<HTMLVideoElement | null>,
  livebankReferenceId: string | null
): UseArServerConnectionResult => {
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const statsChannelRef = useRef<RTCDataChannel | null>(null);
  const livebankReferenceIdRef = useRef(livebankReferenceId);
  const activeLivebankReferenceIdRef = useRef<string | null>(null);
  const isLivebankStartedRef = useRef(false);
  const [stats, setStats] = useState<ArStats | null>(null);
  const [livebankProgress, setLivebankProgress] = useState<ArLivebankProgress | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<ArConnectionStatusType>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const capturedYawTargets = useMemo(
    () =>
      livebankProgress?.buckets
        .filter(bucket => isCapturedLivebankBucket(bucket.status))
        .map(bucket => bucket.yaw) ?? [],
    [livebankProgress]
  );

  const startLivebank = useCallback((nextLivebankReferenceId: string | null) => {
    const statsChannel = statsChannelRef.current;

    if (statsChannel?.readyState !== "open") {
      return;
    }

    if (
      isLivebankStartedRef.current &&
      activeLivebankReferenceIdRef.current === nextLivebankReferenceId
    ) {
      return;
    }

    if (isLivebankStartedRef.current) {
      statsChannel.send(JSON.stringify({ type: "livebank", on: false }));
      isLivebankStartedRef.current = false;
      activeLivebankReferenceIdRef.current = null;
    }

    if (!nextLivebankReferenceId) {
      statsChannel.send(JSON.stringify({ type: "mode", mode: "raw" }));
      setLivebankProgress(null);
      return;
    }

    // 새 reference를 수집하는 동안 이전 스타일이 남지 않도록 원본 모드로 되돌린다.
    statsChannel.send(JSON.stringify({ type: "mode", mode: "raw" }));
    statsChannel.send(
      JSON.stringify({ type: "livebank", on: true, reference: nextLivebankReferenceId })
    );
    isLivebankStartedRef.current = true;
    activeLivebankReferenceIdRef.current = nextLivebankReferenceId;
    setLivebankProgress(null);
  }, []);

  const stopConnection = useCallback(
    (shouldStopCamera = true) => {
      peerConnectionRef.current?.close();
      peerConnectionRef.current = null;
      statsChannelRef.current = null;
      isLivebankStartedRef.current = false;
      activeLivebankReferenceIdRef.current = null;
      setLivebankProgress(null);

      if (shouldStopCamera) {
        localStreamRef.current?.getTracks().forEach(track => track.stop());
        localStreamRef.current = null;

        if (previewVideoRef.current) {
          previewVideoRef.current.srcObject = null;
        }

        if (faceTrackingVideoRef.current) {
          faceTrackingVideoRef.current.srcObject = null;
        }
      }
    },
    [faceTrackingVideoRef, previewVideoRef]
  );

  const startConnection = useCallback(async () => {
    const serverBaseUrl = getArServerBaseUrl();

    if (!navigator.mediaDevices?.getUserMedia) {
      setConnectionStatus("error");
      setErrorMessage("이 기기에서는 카메라를 사용할 수 없습니다.");
      return;
    }

    setConnectionStatus("connecting");
    setErrorMessage(null);

    try {
      const localStream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
          facingMode: { ideal: "user" },
          frameRate: { ideal: 30, max: 30 },
          width: { ideal: 1280, max: 1280 },
          height: { ideal: 720, max: 720 },
        },
      });
      localStreamRef.current = localStream;

      if (previewVideoRef.current) {
        previewVideoRef.current.srcObject = localStream;
        void previewVideoRef.current.play().catch(() => undefined);
      }

      if (faceTrackingVideoRef.current) {
        faceTrackingVideoRef.current.srcObject = localStream;
        void faceTrackingVideoRef.current.play().catch(() => undefined);
      }

      if (!serverBaseUrl) {
        setConnectionStatus("error");
        setErrorMessage("AR 서버 주소가 설정되지 않았습니다.");
        return;
      }

      const peerConnection = new RTCPeerConnection();
      peerConnectionRef.current = peerConnection;
      const statsChannel = peerConnection.createDataChannel("stats");
      statsChannelRef.current = statsChannel;
      statsChannel.binaryType = "arraybuffer";
      statsChannel.addEventListener("open", () => {
        startLivebank(livebankReferenceIdRef.current);
      });
      statsChannel.addEventListener("message", event => {
        const handleServerEvent = async () => {
          try {
            const serverEvent = parseArServerEvent(await parseDataChannelPayload(event.data));

            if (!serverEvent) {
              return;
            }

            if (serverEvent.type === "stats") {
              setStats(serverEvent.data);
            } else {
              setLivebankProgress(previousProgress =>
                mergeLivebankProgress(previousProgress, serverEvent.data)
              );
            }
          } catch {
            // Ignore malformed diagnostic events so media playback remains uninterrupted.
          }
        };

        void handleServerEvent();
      });
      localStream.getVideoTracks().forEach(track => configureVideoSender(peerConnection, track));

      peerConnection.addEventListener("track", event => {
        if (event.track.kind !== "video" || !previewVideoRef.current) {
          return;
        }

        previewVideoRef.current.srcObject = event.streams[0];
        void previewVideoRef.current.play().catch(() => undefined);
      });
      peerConnection.addEventListener("connectionstatechange", () => {
        if (peerConnection.connectionState === "connected") {
          setConnectionStatus("connected");
          return;
        }

        if (peerConnection.connectionState === "failed") {
          setConnectionStatus("error");
          setErrorMessage("AR 서버 연결이 종료되었습니다.");
        }
      });

      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);
      await waitForIceGatheringComplete(peerConnection);
      const localDescription = peerConnection.localDescription;

      if (!localDescription) {
        throw new Error("AR 연결 offer를 생성하지 못했습니다.");
      }

      const answer = await requestArServerOffer(serverBaseUrl, localDescription);
      await peerConnection.setRemoteDescription(answer);
    } catch (error: unknown) {
      stopConnection(false);
      setConnectionStatus("error");
      setErrorMessage(getArConnectionErrorMessage(error));
    }
  }, [faceTrackingVideoRef, previewVideoRef, startLivebank, stopConnection]);

  useEffect(() => {
    livebankReferenceIdRef.current = livebankReferenceId;

    const startTimer = window.setTimeout(() => {
      startLivebank(livebankReferenceId);
    }, 0);

    return () => {
      window.clearTimeout(startTimer);
    };
  }, [livebankReferenceId, startLivebank]);

  useEffect(() => {
    const startTimer = window.setTimeout(() => {
      void startConnection();
    }, 0);

    return () => {
      window.clearTimeout(startTimer);
      stopConnection();
    };
  }, [startConnection, stopConnection]);

  return {
    capturedYawTargets,
    connectionStatus,
    errorMessage,
    livebankProgress,
    stats,
  };
};
