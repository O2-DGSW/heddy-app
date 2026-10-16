import { useCallback, useEffect, useRef, useState } from "react";
import { App } from "@capacitor/app";

type CameraStatusType = "idle" | "starting" | "active" | "error";

const getCameraErrorMessage = (error: unknown): string => {
  if (error instanceof DOMException) {
    if (error.name === "NotAllowedError" || error.name === "SecurityError") {
      return "카메라 권한을 허용한 뒤 다시 시도해 주세요.";
    }
    if (error.name === "NotFoundError" || error.name === "OverconstrainedError") {
      return "사용 가능한 카메라를 찾을 수 없습니다.";
    }
    if (error.name === "NotReadableError") {
      return "다른 앱에서 카메라를 사용 중인지 확인해 주세요.";
    }
  }
  return "카메라를 시작하지 못했습니다. 다시 시도해 주세요.";
};

export const useLocalCamera = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const requestIdRef = useRef(0);
  const startingRef = useRef(false);
  const [status, setStatus] = useState<CameraStatusType>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const releaseCamera = useCallback(() => {
    requestIdRef.current += 1;
    startingRef.current = false;
    streamRef.current?.getTracks().forEach(track => track.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
  }, []);

  const stopCamera = useCallback(() => {
    releaseCamera();
    setStatus("idle");
    setErrorMessage(null);
  }, [releaseCamera]);

  const startCamera = useCallback(async () => {
    if (startingRef.current || streamRef.current) return;
    if (!navigator.mediaDevices?.getUserMedia) {
      setStatus("error");
      setErrorMessage("카메라는 HTTPS 또는 localhost에서 사용할 수 있습니다.");
      return;
    }
    const requestId = ++requestIdRef.current;
    startingRef.current = true;
    setStatus("starting");
    setErrorMessage(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
          facingMode: { ideal: "user" },
          width: { ideal: 640 },
          height: { ideal: 480 },
          frameRate: { ideal: 24, max: 30 },
        },
      });
      const video = videoRef.current;
      if (requestId !== requestIdRef.current || !video) {
        stream.getTracks().forEach(track => track.stop());
        return;
      }
      streamRef.current = stream;
      stream.getVideoTracks().forEach(track => {
        track.addEventListener("ended", stopCamera, { once: true });
      });
      video.srcObject = stream;
      await video.play();
      if (requestId !== requestIdRef.current) return;
      startingRef.current = false;
      setStatus("active");
    } catch (error) {
      if (requestId !== requestIdRef.current) return;
      releaseCamera();
      setStatus("error");
      setErrorMessage(getCameraErrorMessage(error));
    }
  }, [releaseCamera, stopCamera]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) stopCamera();
    };
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => !entry.isIntersecting)) stopCamera();
    });
    if (containerRef.current) observer.observe(containerRef.current);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("pagehide", stopCamera);
    const listener = App.addListener("appStateChange", ({ isActive }) => {
      if (!isActive) stopCamera();
    });
    return () => {
      releaseCamera();
      observer.disconnect();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("pagehide", stopCamera);
      void listener.then(handle => handle.remove());
    };
  }, [releaseCamera, stopCamera]);

  return { videoRef, containerRef, status, errorMessage, startCamera, stopCamera };
};
