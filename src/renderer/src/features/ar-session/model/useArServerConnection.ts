import { Capacitor } from "@capacitor/core";
import { useCallback, useEffect, useRef, useState } from "react";
import type { RefObject } from "react";

import { getArServerBaseUrl, requestArServerOffer } from "@/entities/ar-groom";
import type { ArGroomFitSettings, ArGroomState } from "@/entities/ar-groom";

import { arLog, summarizeIceCandidates, summarizeRemoteAddressKinds } from "./arConnectionLog";
import { parseArServerEvent, parseDataChannelPayload } from "./arServerEvent";
import {
  configureVideoSender,
  getArConnectionErrorMessage,
  openFrontCamera,
  waitForIceGatheringComplete,
} from "./peerConnection";
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
  /** 연결이 실패하거나 끊긴 뒤 처음부터 다시 연결한다 */
  handleReconnect: () => void;
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
  // 언마운트 때는 effect cleanup보다 ref 해제가 먼저라 video ref가 이미 null이다.
  // 스트림을 붙인 요소를 따로 기억해 두고 정리할 때 이 목록으로 해제한다.
  const attachedVideosRef = useRef(new Set<HTMLVideoElement>());
  const [hasServerYaw, setHasServerYaw] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<ArConnectionStatusType>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [controlReady, setControlReady] = useState(false);
  // 값이 바뀌면 연결 effect가 다시 실행된다(다시 연결 버튼).
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
      arLog.info("연결 종료", { message });
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
      // 실패했을 때 어느 단계에서 멈췄는지 로그에 남기려고 진행 단계를 기록한다.
      let step = "서버 주소 확인";
      try {
        const baseUrl = getArServerBaseUrl();
        if (!baseUrl) throw new Error("AR 서버 주소가 설정되지 않았습니다.");
        arLog.info("연결 시작", {
          platform: Capacitor.getPlatform(),
          server: new URL(baseUrl, window.location.href).origin,
        });
        step = "카메라 열기";
        const localStream = await openFrontCamera();
        // 화면 이탈 중 카메라 권한 응답이 도착해도 스트림이 남지 않게 한다.
        if (signal.aborted) {
          localStream.getTracks().forEach(track => track.stop());
          return;
        }
        localStreamRef.current = localStream;
        arLog.info("카메라 열림", {
          video: localStream.getVideoTracks().map(track => {
            const { width, height, frameRate } = track.getSettings();
            return { width, height, frameRate };
          }),
        });
        for (const video of [previewVideoRef.current, faceTrackingVideoRef.current]) {
          if (video) attachStream(video, localStream);
        }

        step = "WebRTC 준비";
        const peer = new RTCPeerConnection();
        peerConnectionRef.current = peer;
        const isCurrentPeer = () => !signal.aborted && peerConnectionRef.current === peer;

        const channel = peer.createDataChannel("stats");
        statsChannelRef.current = channel;
        channel.binaryType = "arraybuffer";
        channel.addEventListener("open", () => {
          arLog.info("제어 채널 열림");
          if (signal.aborted) return;
          setControlReady(true);
          syncGroomFit();
        });
        channel.addEventListener("close", () => {
          if (!isCurrentPeer()) return;
          arLog.info("제어 채널 닫힘");
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
          arLog.info("서버 트랙 수신", { kind: event.track.kind });
          if (signal.aborted || event.track.kind !== "video" || !previewVideoRef.current) return;
          attachStream(previewVideoRef.current, event.streams[0] ?? new MediaStream([event.track]));
        });
        peer.addEventListener("iceconnectionstatechange", () => {
          arLog.info("ICE 연결 상태", { state: peer.iceConnectionState });
        });
        peer.addEventListener("icegatheringstatechange", () => {
          arLog.info("ICE 후보 수집 상태", { state: peer.iceGatheringState });
        });
        peer.addEventListener("icecandidateerror", event => {
          // STUN·TURN 서버에 닿지 못한 경우. URL과 코드만 남긴다.
          arLog.info("ICE 후보 오류", {
            errorCode: event.errorCode,
            errorText: event.errorText,
            url: event.url,
          });
        });
        peer.addEventListener("connectionstatechange", () => {
          arLog.info("연결 상태", { state: peer.connectionState });
          if (!isCurrentPeer()) return;
          if (peer.connectionState === "connected") setConnectionStatus("connected");
          else if (peer.connectionState === "failed" || peer.connectionState === "closed") {
            failConnection("AR 연결이 끊어졌습니다. 다시 연결해 주세요.");
          }
        });

        step = "연결 요청 생성";
        const offer = await peer.createOffer();
        signal.throwIfAborted();
        await peer.setLocalDescription(offer);
        step = "ICE 후보 수집";
        await waitForIceGatheringComplete(peer, signal);
        const localDescription = peer.localDescription;
        if (!localDescription)
          throw new Error("AR 연결을 준비하지 못했습니다. 다시 연결해 주세요.");
        arLog.info("연결 요청 전송", {
          localCandidates: summarizeIceCandidates(localDescription.sdp),
        });
        step = "서버 연결 요청(/offer)";
        const answer = await requestArServerOffer(baseUrl, localDescription, signal);
        signal.throwIfAborted();
        // 서버 후보가 tailscale·private뿐이면, 같은 망이 아닌 기기는 미디어 연결에 실패한다.
        arLog.info("서버 응답 받음", {
          remoteCandidates: summarizeIceCandidates(answer.sdp),
          remoteAddressKinds: summarizeRemoteAddressKinds(answer.sdp),
        });
        step = "서버 응답 적용";
        await peer.setRemoteDescription(answer);
      } catch (error: unknown) {
        if (signal.aborted) return;
        arLog.error(`실패: ${step}`, error);
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
    const controller = new AbortController();
    const timer = setTimeout(() => void startConnection(controller.signal), 0);
    return () => {
      clearTimeout(timer);
      controller.abort();
      stopConnection();
    };
  }, [connectionAttempt, startConnection, stopConnection]);

  const handleReconnect = useCallback(() => {
    setConnectionAttempt(attempt => attempt + 1);
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
    handleReconnect,
  };
};
