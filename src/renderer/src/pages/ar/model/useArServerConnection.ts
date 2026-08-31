import { useCallback, useEffect, useRef, useState, type RefObject } from "react";

export type ArConnectionStatusType = "connecting" | "connected" | "error" | "idle";

interface ArServerAnswer {
  sdp: string;
  type: RTCSdpType;
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

  return (
    typeof answer.sdp === "string" &&
    (answer.type === "answer" ||
      answer.type === "offer" ||
      answer.type === "pranswer" ||
      answer.type === "rollback")
  );
};

const waitForIceGatheringComplete = async (peerConnection: RTCPeerConnection) => {
  if (peerConnection.iceGatheringState === "complete") {
    return;
  }

  await new Promise<void>(resolve => {
    const handleIceGatheringStateChange = () => {
      if (peerConnection.iceGatheringState !== "complete") {
        return;
      }

      peerConnection.removeEventListener("icegatheringstatechange", handleIceGatheringStateChange);
      resolve();
    };

    peerConnection.addEventListener("icegatheringstatechange", handleIceGatheringStateChange);
  });
};

export const useArServerConnection = (
  previewVideoRef: RefObject<HTMLVideoElement | null>
): UseArServerConnectionResult => {
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<ArConnectionStatusType>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const stopConnection = useCallback(() => {
    peerConnectionRef.current?.close();
    peerConnectionRef.current = null;
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
      statsChannel.addEventListener("open", () => {
        statsChannel.send(JSON.stringify({ type: "mode", mode: "tryon" }));
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

      const response = await fetch(`${serverBaseUrl}/offer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(peerConnection.localDescription),
      });
      const answer: unknown = await response.json();

      if (!response.ok || !isArServerAnswer(answer)) {
        throw new Error("AR 서버가 유효한 WebRTC 응답을 반환하지 않았습니다.");
      }

      await peerConnection.setRemoteDescription(answer);
    } catch {
      stopConnection();
      setConnectionStatus("error");
      setErrorMessage("AR 서버에 연결하지 못했습니다. 네트워크와 카메라 권한을 확인해 주세요.");
    }
  }, [previewVideoRef, stopConnection]);

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
