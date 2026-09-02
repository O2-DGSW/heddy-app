import { FaceLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";
import { useEffect, useRef, useState, type RefObject } from "react";

interface UseFaceYawResult {
  yaw: number | null;
}

const DETECTION_INTERVAL_MS = 120;
const YAW_SMOOTHING_FACTOR = 0.28;

const getYawFromTransformationMatrix = (matrix: number[]): number | null => {
  if (matrix.length < 16) {
    return null;
  }

  const yawRadians = Math.atan2(-matrix[8], Math.hypot(matrix[0], matrix[4]));
  const yaw = (yawRadians * 180) / Math.PI;

  return Number.isFinite(yaw) ? yaw : null;
};

export const useFaceYaw = (
  faceTrackingVideoRef: RefObject<HTMLVideoElement | null>
): UseFaceYawResult => {
  const faceLandmarkerRef = useRef<FaceLandmarker | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const lastDetectionAtRef = useRef(0);
  const previousYawRef = useRef<number | null>(null);
  const [yaw, setYaw] = useState<number | null>(null);

  useEffect(() => {
    let isActive = true;

    const runFaceDetection = () => {
      if (!isActive) {
        return;
      }

      const faceLandmarker = faceLandmarkerRef.current;
      const faceTrackingVideo = faceTrackingVideoRef.current;
      const now = performance.now();

      if (
        !faceLandmarker ||
        !faceTrackingVideo ||
        faceTrackingVideo.readyState < HTMLMediaElement.HAVE_CURRENT_DATA ||
        now - lastDetectionAtRef.current < DETECTION_INTERVAL_MS
      ) {
        animationFrameRef.current = window.requestAnimationFrame(runFaceDetection);
        return;
      }

      lastDetectionAtRef.current = now;

      try {
        const result = faceLandmarker.detectForVideo(faceTrackingVideo, now);
        const matrix = result.facialTransformationMatrixes[0];
        const detectedYaw = matrix ? getYawFromTransformationMatrix(matrix.data) : null;

        if (detectedYaw === null) {
          previousYawRef.current = null;
          setYaw(null);
        } else {
          const smoothedYaw =
            previousYawRef.current === null
              ? detectedYaw
              : previousYawRef.current +
                (detectedYaw - previousYawRef.current) * YAW_SMOOTHING_FACTOR;

          previousYawRef.current = smoothedYaw;
          setYaw(smoothedYaw);
        }
      } catch {
        setYaw(null);
      }

      animationFrameRef.current = window.requestAnimationFrame(runFaceDetection);
    };

    const initializeFaceLandmarker = async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks("/mediapipe");
        const faceLandmarker = await FaceLandmarker.createFromOptions(vision, {
          baseOptions: { modelAssetPath: "/models/face_landmarker.task" },
          minFaceDetectionConfidence: 0.6,
          minFacePresenceConfidence: 0.6,
          minTrackingConfidence: 0.6,
          numFaces: 1,
          outputFacialTransformationMatrixes: true,
          runningMode: "VIDEO",
        });

        if (!isActive) {
          faceLandmarker.close();
          return;
        }

        faceLandmarkerRef.current = faceLandmarker;
        animationFrameRef.current = window.requestAnimationFrame(runFaceDetection);
      } catch {
        if (isActive) {
          setYaw(null);
        }
      }
    };

    void initializeFaceLandmarker();

    return () => {
      isActive = false;

      if (animationFrameRef.current !== null) {
        window.cancelAnimationFrame(animationFrameRef.current);
      }

      faceLandmarkerRef.current?.close();
      faceLandmarkerRef.current = null;
    };
  }, [faceTrackingVideoRef]);

  return { yaw };
};
