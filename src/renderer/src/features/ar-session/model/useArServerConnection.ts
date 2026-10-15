import { useCallback, useEffect, useRef, useState } from "react";
import type { RefObject } from "react";

import { getArServerBaseUrl, requestArServerOffer } from "@/entities/ar-groom";
import type { ArGroomFitSettings, ArGroomState } from "@/entities/ar-groom";

import { parseArServerEvent, parseDataChannelPayload } from "./arServerEvent";
import {
  configureVideoSender,
  getArConnectionErrorMessage,
  openCamera,
  waitForIceGatheringComplete,
} from "./peerConnection";
import type { ArCameraFacingModeType } from "./peerConnection";
import { useGroomFitControl } from "./useGroomFitControl";

export type ArConnectionStatusType = "connecting" | "connected" | "error" | "idle";

interface UseArServerConnectionResult {
  connectionStatus: ArConnectionStatusType;
  errorMessage: string | null;
  controlReady: boolean;
  groomState: ArGroomState;
  foreheadState: ArGroomState;
  /** 서버가 얼굴 yaw를 보내 주고 있는지. 매 stats마다 바뀌지 않도록 boolean만 state로 둔다 */
  hasServerYaw: boolean;
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
  faceTrackingVideoRef: RefObject<HTMLVideoElement | null>,
  groom: string,
  settings: ArGroomFitSettings
): UseArServerConnectionResult => {
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const statsChannelRef = useRef<RTCDataChannel | null>(null);
  const cameraFacingModeRef = useRef<ArCameraFacingModeType>("user");
  const requireExactFacingModeRef = useRef(false);
  // 언마운트 때는 effect cleanup보다 ref 해제가 먼저라 video ref가 이미 null이다.
  // 스트림을 붙인 요소를 따로 기억해 두고 정리할 때 이 목록으로 해제한다.
  const attachedVideosRef = useRef(new Set<HTMLVideoElement>());
  const [hasServerYaw, setHasServerYaw] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<ArConnectionStatusType>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [controlReady, setControlReady] = useState(false);
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

  const stopConnection = useCallback(() => {
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
    setHasServerYaw(false);
  }, [resetGroomFit]);

  const attachStream = useCallback((video: HTMLVideoElement, stream: MediaStream) => {
    video.srcObject = stream;
    attachedVideosRef.current.add(video);
    void video.play().catch(() => undefined);
  }, []);

  const failConnection = useCallback(
    (message: string) => {
      stopConnection();
      setConnectionStatus("error");
      setErrorMessage(message);
    },
    [stopConnection]
  );

  const startConnection = useCallback(
    async (signal: AbortSignal) => {
      setConnectionStatus("connecting");
      setErrorMessage(null);
      try {
        const baseUrl = getArServerBaseUrl();
        if (!baseUrl) throw new Error("AR 서버 주소가 설정되지 않았습니다.");
        const localStream = await openCamera(
          cameraFacingModeRef.current,
          requireExactFacingModeRef.current
        );
        // 화면 이탈 중 카메라 권한 응답이 도착해도 스트림이 남지 않게 한다.
        if (signal.aborted) {
          localStream.getTracks().forEach(track => track.stop());
          return;
        }
        localStreamRef.current = localStream;
        for (const video of [previewVideoRef.current, faceTrackingVideoRef.current]) {
          if (video) attachStream(video, localStream);
        }

        const peer = new RTCPeerConnection();
        peerConnectionRef.current = peer;
        const isCurrentPeer = () => !signal.aborted && peerConnectionRef.current === peer;

        const channel = peer.createDataChannel("stats");
        statsChannelRef.current = channel;
        channel.binaryType = "arraybuffer";
        channel.addEventListener("open", () => {
          if (signal.aborted) return;
          setControlReady(true);
          syncGroomFit();
        });
        channel.addEventListener("close", () => {
          if (!isCurrentPeer()) return;
          failConnection("AR 연결이 끊어졌습니다. 다시 연결해 주세요.");
        });
        channel.addEventListener("message", event => {
          void (async () => {
            try {
              const serverEvent = parseArServerEvent(await parseDataChannelPayload(event.data));
              if (!isCurrentPeer() || !serverEvent) return;
              if (serverEvent.type === "stats") {
                const { yaw, yaw_ema: yawEma } = serverEvent.data;
                setHasServerYaw(typeof (yawEma ?? yaw) === "number");
              } else handleControlEvent(serverEvent);
            } catch {
              // 잘못된 진단 메시지가 합성 영상 재생을 중단하지 않도록 무시한다.
            }
          })();
        });

        localStream.getVideoTracks().forEach(track => configureVideoSender(peer, track));
        peer.addEventListener("track", event => {
          if (signal.aborted || event.track.kind !== "video" || !previewVideoRef.current) return;
          attachStream(previewVideoRef.current, event.streams[0] ?? new MediaStream([event.track]));
        });
        peer.addEventListener("connectionstatechange", () => {
          if (!isCurrentPeer()) return;
          if (peer.connectionState === "connected") setConnectionStatus("connected");
          else if (peer.connectionState === "failed" || peer.connectionState === "closed") {
            failConnection("AR 연결이 끊어졌습니다. 다시 연결해 주세요.");
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
        failConnection(getArConnectionErrorMessage(error));
      }
    },
    [
      attachStream,
      failConnection,
      faceTrackingVideoRef,
      handleControlEvent,
      previewVideoRef,
      syncGroomFit,
    ]
  );

  useEffect(() => {
    if (!isPageActive) return;

    const controller = new AbortController();
    const timer = setTimeout(() => void startConnection(controller.signal), 0);
    return () => {
      clearTimeout(timer);
      controller.abort();
      stopConnection();
    };
  }, [connectionAttempt, isPageActive, startConnection, stopConnection]);

  const handleReconnect = useCallback(() => {
    setConnectionStatus("connecting");
    setErrorMessage(null);
    setConnectionAttempt(attempt => attempt + 1);
  }, []);

  const handleCameraSwitch = useCallback(() => {
    cameraFacingModeRef.current = cameraFacingModeRef.current === "user" ? "environment" : "user";
    requireExactFacingModeRef.current = true;
    handleReconnect();
  }, [handleReconnect]);

  const handlePageEnter = useCallback(() => {
    setIsPageActive(true);
    setConnectionStatus("connecting");
    setErrorMessage(null);
  }, []);

  const handlePageLeave = useCallback(() => {
    setIsPageActive(false);
    setConnectionStatus("idle");
    setErrorMessage(null);
  }, []);

  return {
    connectionStatus,
    errorMessage,
    controlReady,
    groomState: controlReady && groomState.groom !== groom ? { status: "loading" } : groomState,
    foreheadState,
    hasServerYaw,
    handleGroomRetry,
    handleForeheadRefresh,
    handlePageEnter,
    handlePageLeave,
    handleReconnect,
    handleCameraSwitch,
  };
};
