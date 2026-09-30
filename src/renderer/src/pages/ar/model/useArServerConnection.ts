import { useCallback, useEffect, useRef, useState } from "react";
import type { RefObject } from "react";

import { getArServerBaseUrl, requestArServerOffer } from "./arServerApi";
import { parseArServerEvent, parseDataChannelPayload } from "./arServerEvent";
import type { ArStats } from "./arServerEvent";
import { buildGroomFitCommand, isValidGroomFitSettings } from "./arGroomFit";
import type { ArGroomFitSettings, ArGroomState } from "./types";

export type ArConnectionStatusType = "connecting" | "connected" | "error" | "idle";

interface UseArServerConnectionResult {
  connectionStatus: ArConnectionStatusType;
  errorMessage: string | null;
  controlReady: boolean;
  groomState: ArGroomState;
  foreheadState: ArGroomState;
  stats: ArStats | null;
  handleGroomRetry: () => void;
  handleForeheadRefresh: () => void;
}

interface DesiredGroomFit {
  groom: string;
  settings: ArGroomFitSettings;
}

const GROOM_TIMEOUT_MS = 15000;
const FOREHEAD_TIMEOUT_MS = 60000;

const waitForIceGatheringComplete = async (
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
    }, 10000);

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

const configureVideoSender = (peerConnection: RTCPeerConnection, track: MediaStreamTrack): void => {
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
  groom: string,
  settings: ArGroomFitSettings
): UseArServerConnectionResult => {
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const statsChannelRef = useRef<RTCDataChannel | null>(null);
  const desiredFitRef = useRef<DesiredGroomFit>({ groom, settings });
  const lastSentFitRef = useRef<DesiredGroomFit | null>(null);
  const pendingGroomRef = useRef<string | null>(null);
  const groomTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const foreheadTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const [stats, setStats] = useState<ArStats | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<ArConnectionStatusType>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [controlReady, setControlReady] = useState(false);
  const [groomState, setGroomState] = useState<ArGroomState>({ status: "idle" });
  const [foreheadState, setForeheadState] = useState<ArGroomState>({ status: "idle" });

  const syncGroomFit = useCallback(() => {
    const channel = statsChannelRef.current;
    const desired = desiredFitRef.current;
    if (channel?.readyState !== "open" || pendingGroomRef.current !== null) return;
    if (!isValidGroomFitSettings(desired.settings)) {
      setGroomState({
        groom: desired.groom,
        status: "error",
        message: "스타일 조정 값이 허용 범위를 벗어났습니다.",
      });
      return;
    }
    const command = buildGroomFitCommand(desired.groom, desired.settings, lastSentFitRef.current);
    if (!command) return;
    try {
      channel.send(JSON.stringify(command));
      lastSentFitRef.current = desired;
      if (command.groom !== undefined) {
        clearTimeout(foreheadTimerRef.current);
        foreheadTimerRef.current = undefined;
        setForeheadState({ status: "idle" });
        // 서버는 groom 해제에 완료 알림을 보내지 않으므로 다음 스타일 요청을 막지 않는다.
        if (command.groom === "") {
          setGroomState({ groom: "", status: "idle" });
          return;
        }
        // 서버가 요청 ID를 제공하지 않으므로 스타일 요청은 하나씩 보내고 최신 선택을 대기시킨다.
        pendingGroomRef.current = desired.groom;
        setGroomState({ groom: desired.groom, status: "loading" });
        clearTimeout(groomTimerRef.current);
        groomTimerRef.current = setTimeout(() => {
          pendingGroomRef.current = null;
          lastSentFitRef.current = null;
          setGroomState({
            groom: desiredFitRef.current.groom,
            status: "error",
            message: "스타일 적용 응답이 없습니다. 다시 시도해 주세요.",
          });
        }, GROOM_TIMEOUT_MS);
      }
    } catch {
      lastSentFitRef.current = null;
      setGroomState({
        groom: desired.groom,
        status: "error",
        message: "스타일 변경 요청을 보내지 못했습니다.",
      });
    }
  }, []);

  const handleGroomRetry = useCallback(() => {
    if (pendingGroomRef.current !== null) return;
    lastSentFitRef.current = null;
    syncGroomFit();
  }, [syncGroomFit]);

  const startForeheadTimeout = useCallback(() => {
    clearTimeout(foreheadTimerRef.current);
    foreheadTimerRef.current = setTimeout(() => {
      foreheadTimerRef.current = undefined;
      setForeheadState({
        status: "error",
        message: "이마 생성 응답이 없습니다. 정면을 보고 다시 시도해 주세요.",
      });
    }, FOREHEAD_TIMEOUT_MS);
  }, []);

  const handleForeheadRefresh = useCallback(() => {
    const channel = statsChannelRef.current;
    if (
      channel?.readyState !== "open" ||
      !desiredFitRef.current.groom ||
      pendingGroomRef.current !== null ||
      foreheadTimerRef.current !== undefined
    )
      return;
    try {
      channel.send(JSON.stringify({ type: "fit", forehead: "refresh" }));
      setForeheadState({ status: "loading" });
      startForeheadTimeout();
    } catch {
      setForeheadState({ status: "error", message: "이마 재생성 요청을 보내지 못했습니다." });
    }
  }, [startForeheadTimeout]);

  const stopConnection = useCallback(() => {
    const peer = peerConnectionRef.current;
    peerConnectionRef.current = null;
    statsChannelRef.current = null;
    peer?.close();
    localStreamRef.current?.getTracks().forEach(track => track.stop());
    localStreamRef.current = null;
    if (previewVideoRef.current) previewVideoRef.current.srcObject = null;
    if (faceTrackingVideoRef.current) faceTrackingVideoRef.current.srcObject = null;
    clearTimeout(groomTimerRef.current);
    clearTimeout(foreheadTimerRef.current);
    foreheadTimerRef.current = undefined;
    pendingGroomRef.current = null;
    lastSentFitRef.current = null;
    setControlReady(false);
    setStats(null);
    setGroomState({ status: "idle" });
    setForeheadState({ status: "idle" });
  }, [faceTrackingVideoRef, previewVideoRef]);

  const startConnection = useCallback(
    async (signal: AbortSignal) => {
      setConnectionStatus("connecting");
      setErrorMessage(null);
      try {
        const baseUrl = getArServerBaseUrl();
        if (!baseUrl) throw new Error("AR 서버 주소가 설정되지 않았습니다.");
        if (!navigator.mediaDevices?.getUserMedia) {
          throw new Error(
            "카메라를 사용할 수 없습니다. HTTPS 또는 localhost에서 다시 시도해 주세요."
          );
        }
        const localStream = await navigator.mediaDevices.getUserMedia({
          audio: false,
          video: {
            facingMode: { ideal: "user" },
            frameRate: { ideal: 30, max: 30 },
            width: { ideal: 640, max: 640 },
            height: { ideal: 480, max: 480 },
          },
        });
        // 화면 이탈 중 카메라 권한 응답이 도착해도 스트림이 남지 않게 한다.
        if (signal.aborted) {
          localStream.getTracks().forEach(track => track.stop());
          return;
        }
        localStreamRef.current = localStream;
        if (previewVideoRef.current) {
          previewVideoRef.current.srcObject = localStream;
          void previewVideoRef.current.play().catch(() => undefined);
        }
        if (faceTrackingVideoRef.current) {
          faceTrackingVideoRef.current.srcObject = localStream;
          void faceTrackingVideoRef.current.play().catch(() => undefined);
        }
        const peer = new RTCPeerConnection();
        peerConnectionRef.current = peer;
        const channel = peer.createDataChannel("stats");
        statsChannelRef.current = channel;
        channel.binaryType = "arraybuffer";
        channel.addEventListener("open", () => {
          if (signal.aborted) return;
          setControlReady(true);
          syncGroomFit();
        });
        channel.addEventListener("close", () => {
          if (signal.aborted || peerConnectionRef.current !== peer) return;
          stopConnection();
          setConnectionStatus("error");
          setErrorMessage("AR 서버 제어 연결이 종료되었습니다. 화면에 다시 진입해 주세요.");
        });
        channel.addEventListener("message", event => {
          const handleServerEvent = async () => {
            try {
              const serverEvent = parseArServerEvent(await parseDataChannelPayload(event.data));
              if (signal.aborted || peerConnectionRef.current !== peer || !serverEvent) return;
              if (serverEvent.type === "stats") {
                setStats(serverEvent.data);
              } else if (serverEvent.type === "groom") {
                const pending = pendingGroomRef.current;
                if (
                  pending === null ||
                  (serverEvent.groom !== undefined && serverEvent.groom !== pending)
                )
                  return;
                clearTimeout(groomTimerRef.current);
                pendingGroomRef.current = null;
                setGroomState({
                  groom: pending,
                  status: serverEvent.status,
                  message:
                    serverEvent.message ??
                    (serverEvent.status === "error" ? "스타일을 적용하지 못했습니다." : undefined),
                });
                if (desiredFitRef.current.groom !== pending || serverEvent.status === "ok")
                  syncGroomFit();
              } else if (serverEvent.type === "forehead") {
                if (!desiredFitRef.current.groom) return;
                setForeheadState({
                  status: serverEvent.status,
                  message:
                    serverEvent.message ??
                    (serverEvent.status === "error"
                      ? "이마를 생성하지 못했습니다. 정면을 보고 다시 시도해 주세요."
                      : undefined),
                });
                if (serverEvent.status === "loading") startForeheadTimeout();
                else {
                  clearTimeout(foreheadTimerRef.current);
                  foreheadTimerRef.current = undefined;
                }
              } else {
                if (pendingGroomRef.current === null && foreheadTimerRef.current !== undefined) {
                  clearTimeout(foreheadTimerRef.current);
                  foreheadTimerRef.current = undefined;
                  setForeheadState({ status: "error", message: serverEvent.message });
                  return;
                }
                clearTimeout(groomTimerRef.current);
                pendingGroomRef.current = null;
                setGroomState({
                  groom: desiredFitRef.current.groom,
                  status: "error",
                  message: serverEvent.message,
                });
              }
            } catch {
              // 잘못된 진단 메시지가 합성 영상 재생을 중단하지 않도록 무시한다.
            }
          };
          void handleServerEvent();
        });
        localStream.getVideoTracks().forEach(track => configureVideoSender(peer, track));
        peer.addEventListener("track", event => {
          if (signal.aborted || event.track.kind !== "video" || !previewVideoRef.current) return;
          previewVideoRef.current.srcObject = event.streams[0] ?? new MediaStream([event.track]);
          void previewVideoRef.current.play().catch(() => undefined);
        });
        peer.addEventListener("connectionstatechange", () => {
          if (signal.aborted || peerConnectionRef.current !== peer) return;
          if (peer.connectionState === "connected") setConnectionStatus("connected");
          else if (peer.connectionState === "failed" || peer.connectionState === "closed") {
            stopConnection();
            setConnectionStatus("error");
            setErrorMessage("AR 서버 연결이 종료되었습니다. 화면에 다시 진입해 주세요.");
          }
        });
        const offer = await peer.createOffer();
        signal.throwIfAborted();
        await peer.setLocalDescription(offer);
        await waitForIceGatheringComplete(peer, signal);
        const localDescription = peer.localDescription;
        if (!localDescription) throw new Error("AR 연결 offer를 생성하지 못했습니다.");
        const answer = await requestArServerOffer(baseUrl, localDescription, signal);
        signal.throwIfAborted();
        await peer.setRemoteDescription(answer);
      } catch (error: unknown) {
        if (signal.aborted) return;
        stopConnection();
        setConnectionStatus("error");
        setErrorMessage(getArConnectionErrorMessage(error));
      }
    },
    [faceTrackingVideoRef, previewVideoRef, startForeheadTimeout, stopConnection, syncGroomFit]
  );

  useEffect(() => {
    desiredFitRef.current = { groom, settings };
    const timer = setTimeout(syncGroomFit, 80);
    return () => clearTimeout(timer);
  }, [groom, settings, syncGroomFit]);

  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(() => void startConnection(controller.signal), 0);
    return () => {
      clearTimeout(timer);
      controller.abort();
      stopConnection();
    };
  }, [startConnection, stopConnection]);

  return {
    connectionStatus,
    errorMessage,
    controlReady,
    groomState: controlReady && groomState.groom !== groom ? { status: "loading" } : groomState,
    foreheadState,
    stats,
    handleGroomRetry,
    handleForeheadRefresh,
  };
};
