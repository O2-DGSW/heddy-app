import { FaceLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";
import { useEffect, useState, type RefObject } from "react";
import { publicUrl } from "@/shared/lib";

interface UseFaceYawResult {
  isFaceTracked: boolean;
}

const DETECTION_INTERVAL_MS = 120;

const getYawFromTransformationMatrix = (matrix: number[]): number | null => {
  if (matrix.length < 16) {
    return null;
  }

  const yawRadians = Math.atan2(-matrix[8], Math.hypot(matrix[0], matrix[4]));
  const yaw = (yawRadians * 180) / Math.PI;

  return Number.isFinite(yaw) ? yaw : null;
};

const createFaceLandmarker = async () => {
  const vision = await FilesetResolver.forVisionTasks(publicUrl("mediapipe"));

  return FaceLandmarker.createFromOptions(vision, {
    baseOptions: { modelAssetPath: publicUrl("models/face_landmarker.task") },
    minFaceDetectionConfidence: 0.6,
    minFacePresenceConfidence: 0.6,
    minTrackingConfidence: 0.6,
    numFaces: 1,
    outputFacialTransformationMatrixes: true,
    runningMode: "VIDEO",
  });
};

// WASM과 모델을 AR 화면에 들어올 때마다 다시 올리지 않도록 앱 수명 동안 한 번만 만든다.
let faceLandmarkerPromise: Promise<FaceLandmarker> | null = null;

const getFaceLandmarker = () => {
  faceLandmarkerPromise ??= createFaceLandmarker().catch((error: unknown) => {
    // 실패한 Promise를 남겨 두면 다음 진입에서도 계속 실패하므로 비운다.
    faceLandmarkerPromise = null;
    throw error;
  });

  return faceLandmarkerPromise;
};

/**
 * 기기에서 얼굴 방향(yaw)을 감지해 인식 여부만 알린다. 매 감지마다 화면을 다시 그리지 않도록
 * yaw 값은 state로 내보내지 않는다.
 * enabled가 false면(서버가 yaw를 주는 동안) 감지를 멈춘다.
 */
export const useFaceYaw = (
  faceTrackingVideoRef: RefObject<HTMLVideoElement | null>,
  enabled = true
): UseFaceYawResult => {
  const [isFaceTracked, setIsFaceTracked] = useState(false);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    let isActive = true;
    let detectionTimer: number | null = null;

    // 감지는 120ms마다 한 번이면 충분해 매 프레임 도는 rAF 대신 타이머로 다음 감지를 건다.
    const scheduleDetection = (faceLandmarker: FaceLandmarker) => {
      detectionTimer = window.setTimeout(
        () => runFaceDetection(faceLandmarker),
        DETECTION_INTERVAL_MS
      );
    };

    const runFaceDetection = (faceLandmarker: FaceLandmarker) => {
      if (!isActive) {
        return;
      }

      const faceTrackingVideo = faceTrackingVideoRef.current;

      if (!faceTrackingVideo || faceTrackingVideo.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) {
        scheduleDetection(faceLandmarker);
        return;
      }

      try {
        const result = faceLandmarker.detectForVideo(faceTrackingVideo, performance.now());
        const matrix = result.facialTransformationMatrixes[0];
        const detectedYaw = matrix ? getYawFromTransformationMatrix(matrix.data) : null;

        // 값이 같으면 React가 다시 그리지 않으므로 인식 여부가 바뀔 때만 렌더링된다.
        setIsFaceTracked(detectedYaw !== null);
      } catch {
        setIsFaceTracked(false);
      }

      scheduleDetection(faceLandmarker);
    };

    const initializeFaceLandmarker = async () => {
      try {
        const faceLandmarker = await getFaceLandmarker();

        if (isActive) {
          runFaceDetection(faceLandmarker);
        }
      } catch {
        if (isActive) {
          setIsFaceTracked(false);
        }
      }
    };

    void initializeFaceLandmarker();

    return () => {
      isActive = false;
      // 감지를 멈추면 마지막 결과를 들고 있지 않는다.
      setIsFaceTracked(false);

      if (detectionTimer !== null) {
        window.clearTimeout(detectionTimer);
      }
    };
  }, [enabled, faceTrackingVideoRef]);

  return { isFaceTracked };
};
