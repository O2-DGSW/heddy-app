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
  const transceiver = peerConnection.addTransceiver(track, { direction: "sendonly" });
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

export const useArServerConnection = (
  previewVideoRef: RefObject<HTMLVideoElement | null>,
  livebankReferenceId: string | null
): UseArServerConnectionResult => {
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const statsChannelRef = useRef<RTCDataChannel | null>(null);
  const livebankReferenceIdRef = useRef(livebankReferenceId);
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

    if (
      statsChannel?.readyState !== "open" ||
      !nextLivebankReferenceId ||
      isLivebankStartedRef.current
    ) {
      return;
    }

    statsChannel.send(
      JSON.stringify({ type: "livebank", on: true, reference: nextLivebankReferenceId })
    );
    isLivebankStartedRef.current = true;
    setLivebankProgress(null);
  }, []);

  const stopConnection = useCallback(
    (shouldStopCamera = true) => {
      peerConnectionRef.current?.close();
      peerConnectionRef.current = null;
      statsChannelRef.current = null;
      isLivebankStartedRef.current = false;
      setLivebankProgress(null);

      if (shouldStopCamera) {
        localStreamRef.current?.getTracks().forEach(track => track.stop());
        localStreamRef.current = null;

        if (previewVideoRef.current) {
          previewVideoRef.current.srcObject = null;
        }
      }
    },
    [previewVideoRef]
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
          width: { ideal: 1920, max: 1920 },
          height: { ideal: 1080, max: 1080 },
        },
      });
      localStreamRef.current = localStream;

      if (previewVideoRef.current) {
        previewVideoRef.current.srcObject = localStream;
        void previewVideoRef.current.play().catch(() => undefined);
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
      setErrorMessage(
        error instanceof DOMException && error.name === "NotAllowedError"
          ? "카메라 권한이 필요합니다. 기기 설정에서 Heddy의 카메라 접근을 허용해 주세요."
          : "AR 서버에 연결하지 못했습니다. 네트워크와 카메라 권한을 확인해 주세요."
      );
    }
  }, [previewVideoRef, startLivebank, stopConnection]);

  useEffect(() => {
    livebankReferenceIdRef.current = livebankReferenceId;
    startLivebank(livebankReferenceId);
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
