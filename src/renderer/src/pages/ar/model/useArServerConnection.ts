import { Capacitor, CapacitorHttp } from "@capacitor/core";
import { useCallback, useEffect, useRef, useState, type RefObject } from "react";

import type { HairstyleOptionId } from "./types";

export type ArConnectionStatusType = "connecting" | "connected" | "error" | "idle";

interface ArServerAnswer {
  sdp: string;
  type: "answer";
}

interface UseArServerConnectionResult {
  connectionStatus: ArConnectionStatusType;
  errorMessage: string | null;
}

const getArServerBaseUrl = () => {
  const configuredUrl = import.meta.env.VITE_AR_SERVER_URL?.trim().replace(/\/$/, "") ?? "";

  if (!configuredUrl) {
    return "";
  }

  return import.meta.env.DEV ? "/ar-server" : configuredUrl;
};

const isArServerAnswer = (value: unknown): value is ArServerAnswer => {
  if (!value || typeof value !== "object") {
    return false;
  }

  const answer = value as Record<string, unknown>;

  return typeof answer.sdp === "string" && answer.type === "answer";
};

const requestArServerOffer = async (
  serverBaseUrl: string,
  offer: RTCSessionDescriptionInit
): Promise<unknown> => {
  const url = `${serverBaseUrl}/offer`;

  if (Capacitor.isNativePlatform()) {
    const response = await CapacitorHttp.post({
      connectTimeout: 10000,
      data: offer,
      headers: { "Content-Type": "application/json" },
      readTimeout: 10000,
      url,
    });

    if (response.status < 200 || response.status >= 300) {
      throw new Error("AR 서버가 offer 요청을 처리하지 못했습니다.");
    }

    return response.data;
  }

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(offer),
  });
  const answer: unknown = await response.json();

  if (!response.ok) {
    throw new Error("AR 서버가 offer 요청을 처리하지 못했습니다.");
  }

  return answer;
};

const waitForIceGatheringComplete = async (peerConnection: RTCPeerConnection) => {
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

export const useArServerConnection = (
  previewVideoRef: RefObject<HTMLVideoElement | null>,
  hairstyleId: HairstyleOptionId
): UseArServerConnectionResult => {
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const statsChannelRef = useRef<RTCDataChannel | null>(null);
  const hairstyleIdRef = useRef(hairstyleId);
  const [connectionStatus, setConnectionStatus] = useState<ArConnectionStatusType>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const sendHairstyleMode = useCallback((nextHairstyleId: HairstyleOptionId) => {
    const statsChannel = statsChannelRef.current;

    if (statsChannel?.readyState !== "open") {
      return;
    }

    const isOriginalStyle = nextHairstyleId === "none";
    statsChannel.send(JSON.stringify({ type: "mode", mode: isOriginalStyle ? "raw" : "tryon" }));

    if (isOriginalStyle) {
      return;
    }

    statsChannel.send(
      JSON.stringify({
        type: "fit",
        asset: "korean-frontal",
        blend: 0,
        harmonize: true,
        offset: 0,
        scale: 1,
        shadow: 0.35,
        smooth: 1,
      })
    );
  }, []);

  const stopConnection = useCallback(() => {
    peerConnectionRef.current?.close();
    peerConnectionRef.current = null;
    statsChannelRef.current = null;
    localStreamRef.current?.getTracks().forEach(track => track.stop());
    localStreamRef.current = null;

    if (previewVideoRef.current) {
      previewVideoRef.current.srcObject = null;
    }
  }, [previewVideoRef]);

  const startConnection = useCallback(async () => {
    const serverBaseUrl = getArServerBaseUrl();

    if (!serverBaseUrl) {
      setConnectionStatus("error");
      setErrorMessage("AR 서버 주소가 설정되지 않았습니다.");
      return;
    }

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
          frameRate: { ideal: 30 },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });
      localStreamRef.current = localStream;

      if (previewVideoRef.current) {
        previewVideoRef.current.srcObject = localStream;
        void previewVideoRef.current.play().catch(() => undefined);
      }

      const peerConnection = new RTCPeerConnection();
      peerConnectionRef.current = peerConnection;
      const statsChannel = peerConnection.createDataChannel("stats");
      statsChannelRef.current = statsChannel;
      statsChannel.addEventListener("open", () => {
        sendHairstyleMode(hairstyleIdRef.current);
      });
      localStream.getTracks().forEach(track => peerConnection.addTrack(track, localStream));

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

      if (!isArServerAnswer(answer)) {
        throw new Error("AR 서버가 유효한 WebRTC 응답을 반환하지 않았습니다.");
      }

      await peerConnection.setRemoteDescription(answer);
    } catch {
      stopConnection();
      setConnectionStatus("error");
      setErrorMessage("AR 서버에 연결하지 못했습니다. 네트워크와 카메라 권한을 확인해 주세요.");
    }
  }, [previewVideoRef, sendHairstyleMode, stopConnection]);

  useEffect(() => {
    hairstyleIdRef.current = hairstyleId;
    sendHairstyleMode(hairstyleId);
  }, [hairstyleId, sendHairstyleMode]);

  useEffect(() => {
    const startTimer = window.setTimeout(() => {
      void startConnection();
    }, 0);

    return () => {
      window.clearTimeout(startTimer);
      stopConnection();
    };
  }, [startConnection, stopConnection]);

  return { connectionStatus, errorMessage };
};
