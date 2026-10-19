import { useCallback, useEffect, useRef, useState } from "react";
import type { RefObject } from "react";
import { getHttpStatus } from "@heddy/api";

import { getArServerBaseUrl, requestArServerOffer } from "@/entities/ar-groom";
import type { ArGroomFitSettings, ArGroomState } from "@/entities/ar-groom";

import { parseArServerEvent, parseDataChannelPayload } from "./arServerEvent";
import {
  configureVideoSender,
  openCamera,
  resolveCameraFacingMode,
  waitForIceGatheringComplete,
} from "./peerConnection";
import type { ArCameraFacingModeType } from "./peerConnection";
import { useGroomFitControl } from "./useGroomFitControl";

export type ArConnectionFeedbackType =
  | "camera"
  | "connecting"
  | "retrying"
  | "reconnecting"
  | "offline"
  | "permission"
  | "camera-missing"
  | "camera-busy"
  | "camera-error"
  | "unsupported"
  | "unavailable";

export type ArConnectionStatusType = "connecting" | "connected" | "error" | "idle";

interface UseArServerConnectionResult {
  connectionStatus: ArConnectionStatusType;
  connectionFeedback: ArConnectionFeedbackType;
  reconnectMessage: string | null;
  controlReady: boolean;
  isPreviewMirrored: boolean;
  groomState: ArGroomState;
  foreheadState: ArGroomState;
  handleGroomRetry: () => void;
  handleForeheadRefresh: () => void;
  /** 캐시된 AR 페이지로 돌아왔을 때 새 연결을 시작한다 */
  handlePageEnter: () => void;
  /** AR 페이지를 벗어날 때 카메라와 WebRTC 연결을 정리한다 */
  handlePageLeave: () => void;
  /** 연결이 실패하거나 끊긴 뒤 처음부터 다시 연결한다 */
  handleReconnect: () => void;
  /** 전면·후면 카메라를 바꿔 새 연결을 시작한다 */
  handleCameraSwitch: () => void;
}

/** AR 서버와 WebRTC로 연결해 카메라 영상을 보내고 합성 영상·진단 정보를 받는다 */
export const useArServerConnection = (
  previewVideoRef: RefObject<HTMLVideoElement | null>,
  groom: string,
  settings: ArGroomFitSettings
): UseArServerConnectionResult => {
  const attemptControllerRef = useRef<AbortController | null>(null);
  const connectionDeadlineRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [connectionFeedback, setConnectionFeedback] = useState<ArConnectionFeedbackType>("camera");
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const statsChannelRef = useRef<RTCDataChannel | null>(null);
  const cameraFacingModeRef = useRef<ArCameraFacingModeType>("user");
  const requireExactFacingModeRef = useRef(false);
  const isPageActiveRef = useRef(true);
  const hasConnectedRef = useRef(false);
  const failedAttemptRef = useRef(false);
  const retryCountRef = useRef(0);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // 언마운트 때는 effect cleanup보다 ref 해제가 먼저라 video ref가 이미 null이다.
  // 스트림을 붙인 요소를 따로 기억해 두고 정리할 때 이 목록으로 해제한다.
  const attachedVideosRef = useRef(new Set<HTMLVideoElement>());
  const [connectionStatus, setConnectionStatus] = useState<ArConnectionStatusType>("idle");
  const [reconnectMessage, setReconnectMessage] = useState<string | null>(null);
  const [controlReady, setControlReady] = useState(false);
  const [isPreviewMirrored, setIsPreviewMirrored] = useState(false);
  const [isPageActive, setIsPageActive] = useState(true);
  // 값이 바뀌면 연결 effect가 재실행된다(재연결 또는 카메라 전환).
  const [connectionAttempt, setConnectionAttempt] = useState(0);
  const {
    groomState,
    foreheadState,
    syncGroomFit,
    handleGroomRetry,
    handleForeheadRefresh,
    handleControlEvent,
    reset: resetGroomFit,
  } = useGroomFitControl(statsChannelRef, groom, settings);

  const clearReconnectTimer = useCallback(() => {
    if (reconnectTimerRef.current !== null) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }
  }, []);

  const scheduleReconnect = useCallback(() => {
    if (!isPageActiveRef.current || !navigator.onLine || reconnectTimerRef.current !== null) return;

    // 계속 재시도하되 서버가 불안정할 때 요청 간격은 최대 8초로 제한한다.
    const delay = Math.min(1000 * 2 ** retryCountRef.current, 8000);
    retryCountRef.current += 1;
    reconnectTimerRef.current = setTimeout(() => {
      reconnectTimerRef.current = null;
      if (isPageActiveRef.current) setConnectionAttempt(attempt => attempt + 1);
    }, delay);
  }, []);

  const stopConnection = useCallback(() => {
    attemptControllerRef.current?.abort();
    if (connectionDeadlineRef.current !== null) {
      clearTimeout(connectionDeadlineRef.current);
      connectionDeadlineRef.current = null;
    }
    const peer = peerConnectionRef.current;
    peerConnectionRef.current = null;
    statsChannelRef.current = null;
    peer?.close();
    localStreamRef.current?.getTracks().forEach(track => track.stop());
    localStreamRef.current = null;
    attachedVideosRef.current.forEach(video => {
      video.srcObject = null;
    });
    attachedVideosRef.current.clear();
    resetGroomFit();
    setControlReady(false);
  }, [resetGroomFit]);

  const attachStream = useCallback((video: HTMLVideoElement, stream: MediaStream) => {
    video.srcObject = stream;
    attachedVideosRef.current.add(video);
    void video.play().catch(() => undefined);
  }, []);

  const failConnection = useCallback(() => {
    if (!isPageActiveRef.current || failedAttemptRef.current) return;

    failedAttemptRef.current = true;
    stopConnection();
    setConnectionStatus("connecting");
    setConnectionFeedback(
      navigator.onLine ? (hasConnectedRef.current ? "reconnecting" : "retrying") : "offline"
    );
    setReconnectMessage(
      hasConnectedRef.current
        ? "연결이 끊어졌어요. 다시 연결 중이에요."
        : "연결이 원활하지 않아요. 다시 연결 중이에요."
    );
    scheduleReconnect();
  }, [scheduleReconnect, stopConnection]);

  const startConnection = useCallback(
    async (signal: AbortSignal) => {
      if (signal.aborted || !isPageActiveRef.current) return;
      failedAttemptRef.current = false;
      setConnectionStatus("connecting");
      if (!navigator.onLine) {
        setConnectionFeedback("offline");
        return;
      }
      let stage: "configuration" | "camera" | "server" = "configuration";
      try {
        const baseUrl = getArServerBaseUrl();
        if (!baseUrl) throw new Error("AR 서버 주소가 설정되지 않았습니다.");
        stage = "camera";
        if (!navigator.mediaDevices?.getUserMedia || typeof RTCPeerConnection === "undefined") {
          throw new DOMException("Camera unavailable", "NotSupportedError");
        }
        if (retryCountRef.current === 0 && !hasConnectedRef.current)
          setConnectionFeedback("camera");
        const localStream = await openCamera(
          cameraFacingModeRef.current,
          requireExactFacingModeRef.current
        );
        // 화면 이탈 중 카메라 권한 응답이 도착해도 스트림이 남지 않게 한다.
        if (signal.aborted) {
          localStream.getTracks().forEach(track => track.stop());
          return;
        }
        // 수신하는 서버 트랙에는 방향 정보가 없으므로 로컬 카메라에서 한 번 판별한다.
        const previewFacingMode = resolveCameraFacingMode(
          localStream.getVideoTracks()[0],
          requireExactFacingModeRef.current ? cameraFacingModeRef.current : undefined
        );
        // 최초 ideal 요청과 다른 카메라가 열려도 다음 전환은 실제 방향을 기준으로 한다.
        if (previewFacingMode) cameraFacingModeRef.current = previewFacingMode;
        setIsPreviewMirrored(previewFacingMode === "user");
        stage = "server";
        setConnectionFeedback(
          hasConnectedRef.current
            ? "reconnecting"
            : retryCountRef.current > 0
              ? "retrying"
              : "connecting"
        );
        // 권한 응답을 기다리는 시간은 제한하지 않고, 실제 연결 시도만 만료시킨다.
        connectionDeadlineRef.current = setTimeout(failConnection, 30_000);
        localStreamRef.current = localStream;
        if (previewVideoRef.current) attachStream(previewVideoRef.current, localStream);

        const peer = new RTCPeerConnection({
          iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
        });
        peerConnectionRef.current = peer;
        const isCurrentPeer = () => !signal.aborted && peerConnectionRef.current === peer;

        const channel = peer.createDataChannel("stats");
        statsChannelRef.current = channel;
        channel.binaryType = "arraybuffer";
        channel.addEventListener("open", () => {
          if (!isCurrentPeer()) return;
          hasConnectedRef.current = true;
          setReconnectMessage(null);
          setControlReady(true);
          syncGroomFit();
        });
        channel.addEventListener("close", () => {
          if (!isCurrentPeer()) return;
          failConnection();
        });
        channel.addEventListener("message", event => {
          void (async () => {
            try {
              const serverEvent = parseArServerEvent(await parseDataChannelPayload(event.data));
              if (!isCurrentPeer() || !serverEvent) return;
              if (serverEvent.type !== "stats") handleControlEvent(serverEvent);
            } catch {
              // 잘못된 진단 메시지가 합성 영상 재생을 중단하지 않도록 무시한다.
            }
          })();
        });

        localStream.getVideoTracks().forEach(track => {
          configureVideoSender(peer, track);
          track.addEventListener(
            "ended",
            () => {
              if (isCurrentPeer()) failConnection();
            },
            { once: true }
          );
        });
        peer.addEventListener("track", event => {
          if (!isCurrentPeer() || event.track.kind !== "video" || !previewVideoRef.current) return;
          attachStream(previewVideoRef.current, event.streams[0] ?? new MediaStream([event.track]));
        });
        let disconnectedTimer: ReturnType<typeof setTimeout> | null = null;
        const clearDisconnectedTimer = () => {
          if (disconnectedTimer === null) return;
          clearTimeout(disconnectedTimer);
          disconnectedTimer = null;
        };
        signal.addEventListener("abort", clearDisconnectedTimer, { once: true });
        const schedulePeerRecovery = () => {
          if (disconnectedTimer !== null) return;
          // 일시적인 연결 흔들림 동안에는 재생 중인 미리보기를 숨기지 않는다.
          // 복구 기한이 지나면 failConnection에서 재연결 화면으로 전환한다.
          disconnectedTimer = setTimeout(() => {
            disconnectedTimer = null;
            if (isCurrentPeer() && peer.connectionState !== "connected") failConnection();
          }, 2000);
        };
        peer.addEventListener("connectionstatechange", () => {
          if (peer.connectionState !== "disconnected" && peer.connectionState !== "connecting") {
            clearDisconnectedTimer();
          }
          if (!isCurrentPeer()) return;
          if (peer.connectionState === "connected") {
            if (connectionDeadlineRef.current !== null) {
              clearTimeout(connectionDeadlineRef.current);
              connectionDeadlineRef.current = null;
            }
            hasConnectedRef.current = true;
            failedAttemptRef.current = false;
            retryCountRef.current = 0;
            setReconnectMessage(null);
            setConnectionStatus("connected");
          } else if (
            peer.connectionState === "disconnected" ||
            (hasConnectedRef.current && peer.connectionState === "connecting")
          ) {
            // 일시적인 네트워크 전환은 WebRTC가 복구할 수 있어 짧게 기다린 뒤 재연결한다.
            schedulePeerRecovery();
          } else if (peer.connectionState === "failed" || peer.connectionState === "closed") {
            failConnection();
          }
        });

        const offer = await peer.createOffer();
        signal.throwIfAborted();
        await peer.setLocalDescription(offer);
        await waitForIceGatheringComplete(peer, signal);
        const localDescription = peer.localDescription;
        if (!localDescription)
          throw new Error("AR 연결을 준비하지 못했습니다. 다시 연결해 주세요.");
        const answer = await requestArServerOffer(baseUrl, localDescription, signal);
        signal.throwIfAborted();
        await peer.setRemoteDescription(answer);
      } catch (error: unknown) {
        if (signal.aborted) return;
        if (stage === "server") {
          const status = getHttpStatus(error);
          if (status === 502 || status === 503) {
            // 서버 장애·사용 중 응답에는 카메라를 반복해서 열어도 연결이 빨라지지 않는다.
            failedAttemptRef.current = true;
            clearReconnectTimer();
            stopConnection();
            setConnectionStatus("error");
            setConnectionFeedback("unavailable");
            setReconnectMessage(null);
            return;
          }
          failConnection();
          return;
        }
        // 기기·권한 오류는 재요청만 반복해도 해결되지 않아 사용자 조치 후 재시도한다.
        stopConnection();
        setConnectionStatus("error");
        if (stage === "configuration") setConnectionFeedback("unavailable");
        else {
          const name = error instanceof DOMException ? error.name : "";
          if (name === "NotAllowedError") setConnectionFeedback("permission");
          else if (name === "NotFoundError" || name === "OverconstrainedError") {
            setConnectionFeedback("camera-missing");
            cameraFacingModeRef.current = "user";
            requireExactFacingModeRef.current = false;
          } else if (name === "NotReadableError" || name === "AbortError")
            setConnectionFeedback("camera-busy");
          else if (name === "SecurityError" || name === "NotSupportedError")
            setConnectionFeedback("unsupported");
          else setConnectionFeedback("camera-error");
        }
      }
    },
    [
      attachStream,
      clearReconnectTimer,
      failConnection,
      handleControlEvent,
      previewVideoRef,
      syncGroomFit,
      stopConnection,
    ]
  );

  useEffect(() => {
    if (!isPageActive) return;

    const controller = new AbortController();
    attemptControllerRef.current = controller;
    const timer = setTimeout(() => void startConnection(controller.signal), 0);
    return () => {
      clearTimeout(timer);
      controller.abort();
      clearReconnectTimer();
      stopConnection();
    };
  }, [clearReconnectTimer, connectionAttempt, isPageActive, startConnection, stopConnection]);

  const handleReconnect = useCallback(() => {
    clearReconnectTimer();
    retryCountRef.current = 0;
    failedAttemptRef.current = false;
    setConnectionStatus("connecting");
    setReconnectMessage(null);
    setConnectionFeedback(navigator.onLine ? "connecting" : "offline");
    setConnectionAttempt(attempt => attempt + 1);
  }, [clearReconnectTimer]);

  useEffect(() => {
    const handleOffline = () => {
      if (!isPageActiveRef.current) return;
      clearReconnectTimer();
      stopConnection();
      setConnectionStatus("connecting");
      setConnectionFeedback("offline");
    };
    const handleOnline = () => {
      if (isPageActiveRef.current) handleReconnect();
    };
    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);
    return () => {
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
    };
  }, [clearReconnectTimer, handleReconnect, stopConnection]);

  const handleCameraSwitch = useCallback(() => {
    cameraFacingModeRef.current = cameraFacingModeRef.current === "user" ? "environment" : "user";
    requireExactFacingModeRef.current = true;
    handleReconnect();
  }, [handleReconnect]);

  const handlePageEnter = useCallback(() => {
    isPageActiveRef.current = true;
    hasConnectedRef.current = false;
    failedAttemptRef.current = false;
    retryCountRef.current = 0;
    clearReconnectTimer();
    setIsPageActive(true);
    setConnectionFeedback(navigator.onLine ? "camera" : "offline");
    setConnectionStatus("connecting");
    setReconnectMessage(null);
  }, [clearReconnectTimer]);

  const handlePageLeave = useCallback(() => {
    isPageActiveRef.current = false;
    failedAttemptRef.current = true;
    retryCountRef.current = 0;
    clearReconnectTimer();
    setIsPageActive(false);
    setConnectionStatus("idle");
    setReconnectMessage(null);
  }, [clearReconnectTimer]);

  return {
    connectionStatus,
    connectionFeedback,
    reconnectMessage,
    controlReady,
    isPreviewMirrored,
    groomState: controlReady && groomState.groom !== groom ? { status: "loading" } : groomState,
    foreheadState,
    handleGroomRetry,
    handleForeheadRefresh,
    handlePageEnter,
    handlePageLeave,
    handleReconnect,
    handleCameraSwitch,
  };
};
