import { font, lightTheme } from "@heddy/design-tokens";
import { motion } from "motion/react";

import type { ArLivebankProgress } from "../../model/useArServerConnection";
import { cn } from "@/shared";

const TARGET_YAW_TOLERANCE = 7;
const COMPLETION_MESSAGE_DURATION_MS = 3000;
const GUIDE_ROTATION_MULTIPLIER = 1.8;
const MAX_GUIDE_ROTATION = 64;

const getGuideRotation = (targetYaw: number): number =>
  Math.max(
    -MAX_GUIDE_ROTATION,
    Math.min(MAX_GUIDE_ROTATION, targetYaw * GUIDE_ROTATION_MULTIPLIER)
  );

const getHeadTurnInstruction = (targetYaw: number) => {
  if (targetYaw === 0) {
    return "정면을 바라봐 주세요";
  }

  // 미러링된 전면 카메라 미리보기 기준으로 사용자에게 보이는 방향을 안내한다.
  // 서버 내부 수집·에셋 선택은 서버 yaw 좌표계를 그대로 사용한다.
  return targetYaw < 0 ? "고개를 왼쪽으로 돌려주세요" : "고개를 오른쪽으로 돌려주세요";
};

const getHeadTurnStep = (targetYaw: number) => ({
  id: `yaw-${targetYaw}`,
  label: getHeadTurnInstruction(targetYaw),
  rotation: getGuideRotation(targetYaw),
  targetYaw,
});

const getTurnCorrectionLabel = (targetYaw: number, currentYaw: number): string => {
  if (Math.abs(currentYaw - targetYaw) <= TARGET_YAW_TOLERANCE) {
    return "좋아요, 움직이지 말고 잠시 유지해 주세요";
  }

  if (targetYaw === 0) {
    return "고개를 정면으로 되돌려 주세요";
  }

  // 미러링된 전면 카메라 화면에서는 서버 yaw 보정 방향도 좌우가 반대다.
  const direction = currentYaw > targetYaw ? "왼쪽" : "오른쪽";
  const hasPassedTarget =
    Math.sign(currentYaw) === Math.sign(targetYaw) &&
    Math.abs(currentYaw) > Math.abs(targetYaw) + TARGET_YAW_TOLERANCE;

  return hasPassedTarget
    ? `너무 멀리 돌렸어요. 고개를 ${direction}으로 되돌려 주세요`
    : `고개를 ${direction}으로 더 돌려주세요`;
};

interface ArHeadTurnGuideProps {
  capturedYawTargets: number[];
  isExpanded: boolean;
  isLivebankRequested: boolean;
  livebankProgress: ArLivebankProgress | null;
  serverYaw?: number;
  yaw?: number;
}

const ArHeadTurnGuide = ({
  capturedYawTargets,
  isExpanded,
  isLivebankRequested,
  livebankProgress,
  serverYaw,
  yaw,
}: ArHeadTurnGuideProps) => {
  const nextYaw = livebankProgress?.nextYaw;
  const activeStep = nextYaw === undefined ? null : getHeadTurnStep(nextYaw);
  const isGenerating =
    livebankProgress?.status === "generating" || livebankProgress?.status === "filled";
  const isStyleGenerationCompleted = livebankProgress?.status === "complete";
  const isAngleCollectionCompleted =
    livebankProgress?.total !== undefined && capturedYawTargets.length >= livebankProgress.total;
  const isCollectionError = livebankProgress?.status === "error";
  const isCollectionStopped = livebankProgress?.status === "stopped";
  const totalYawTargets = livebankProgress?.total ?? livebankProgress?.buckets.length ?? 0;
  const completedYawTargets = Math.min(capturedYawTargets.length, totalYawTargets);
  const isInTargetRange =
    activeStep !== null &&
    typeof serverYaw === "number" &&
    Math.abs(serverYaw - activeStep.targetYaw) <= TARGET_YAW_TOLERANCE;
  const isWaitingForServerDirection =
    isLivebankRequested && livebankProgress !== null && typeof serverYaw !== "number";
  const progressLabel = isCollectionError
    ? "각도 수집을 다시 시작해 주세요"
    : isCollectionStopped
      ? "각도 수집이 중지됐어요"
      : isStyleGenerationCompleted
        ? "스타일 생성 완료"
        : !isLivebankRequested
          ? "헤어스타일을 선택해 주세요"
          : isGenerating || isAngleCollectionCompleted
            ? "스타일을 생성하고 있어요"
            : (activeStep?.label ?? "수집 준비 중이에요");
  const detailLabel = isCollectionError
    ? (livebankProgress?.message ?? "얼굴이 잘 보이는 곳에서 스타일을 다시 선택해 주세요")
    : isCollectionStopped
      ? "원하는 스타일을 다시 선택하면 각도 수집을 시작해요"
      : isStyleGenerationCompleted
        ? "완성된 스타일을 확인해 보세요"
        : !isLivebankRequested
          ? "선택한 스타일의 AR 영상을 만들기 위해 필요해요"
          : isWaitingForServerDirection
            ? "AR 서버에서 얼굴 방향 데이터를 확인하고 있어요"
            : typeof yaw !== "number"
              ? "얼굴 방향 데이터를 기다리고 있어요"
              : isGenerating || isAngleCollectionCompleted
                ? "확보한 방향으로 헤어를 만들고 있어요"
                : isInTargetRange
                  ? "좋아요, 그 방향에서 잠깐만 멈춰주세요"
                  : activeStep && typeof serverYaw === "number"
                    ? getTurnCorrectionLabel(activeStep.targetYaw, serverYaw)
                    : "가상 얼굴이 향하는 방향으로 천천히 움직여주세요";
  // 가이드 얼굴은 사용자의 현재 움직임이 아니라 서버가 요청한 목표 방향을 보여준다.
  // 실제 yaw는 위의 보정 문구를 계산하는 데만 사용한다.
  const guideRotation = activeStep?.rotation ?? 0;
  const shouldRepeatDirectionGuide =
    activeStep !== null &&
    !isAngleCollectionCompleted &&
    !isGenerating &&
    !isCollectionError &&
    !isCollectionStopped;

  return (
    <section
      aria-live="polite"
      aria-label="고개 회전 가이드"
      className={cn(
        "pointer-events-none absolute left-1/2 z-10 flex -translate-x-1/2 flex-col items-center",
        isStyleGenerationCompleted
          ? isExpanded
            ? "top-[max(20px,env(safe-area-inset-top))]"
            : "top-3"
          : "top-1/2 -translate-y-1/2"
      )}
    >
      {!isStyleGenerationCompleted && (
        <div className="[perspective:700px]">
          <motion.div
            initial={false}
            animate={
              shouldRepeatDirectionGuide
                ? {
                    rotateY: [0, guideRotation, 0],
                    x: [0, guideRotation / 1.8, 0],
                  }
                : { rotateY: 0, x: 0 }
            }
            className="relative flex h-[104px] w-[82px] items-center justify-center rounded-[46%] border border-white/75 bg-white/25 shadow-[0_8px_24px_rgba(0,0,0,0.2)] backdrop-blur-sm"
            style={{ transformOrigin: "center center" }}
            transition={
              shouldRepeatDirectionGuide
                ? { duration: 1.1, ease: "easeInOut", repeat: Infinity }
                : { damping: 18, mass: 0.9, stiffness: 90, type: "spring" }
            }
          >
            <span className="absolute -left-[5px] top-[43px] h-[17px] w-[8px] rounded-l-full border border-white/70 bg-white/20" />
            <span className="absolute -right-[5px] top-[43px] h-[17px] w-[8px] rounded-r-full border border-white/70 bg-white/20" />
            <span className="absolute left-[19px] top-[40px] h-[7px] w-[7px] rounded-full bg-white shadow-[34px_0_0_white]" />
            <span className="absolute left-1/2 top-[54px] h-[13px] w-[7px] -translate-x-1/2 rounded-b-full border-b border-white/80" />
            <span className="absolute bottom-[23px] left-1/2 h-[7px] w-[20px] -translate-x-1/2 rounded-b-full border-b-2 border-white" />
            <motion.span
              animate={{
                opacity: isAngleCollectionCompleted ? 0 : [0.4, 1, 0.4],
                scale: [0.96, 1.06, 0.96],
              }}
              className="absolute -inset-[9px] rounded-[50%] border border-white/75"
              transition={{ duration: 1.6, ease: "easeInOut", repeat: Infinity }}
            />
          </motion.div>
        </div>
      )}

      <motion.div
        animate={
          isStyleGenerationCompleted
            ? {
                opacity: [0, 1, 1, 0],
                y: [-8, 0, 0, -16],
              }
            : { opacity: 1, y: 0 }
        }
        className="mt-3 flex flex-col items-center rounded-[12px] px-3 py-2 text-center backdrop-blur-sm"
        style={{ backgroundColor: "rgba(0, 0, 0, 0.48)" }}
        transition={
          isStyleGenerationCompleted
            ? {
                duration: COMPLETION_MESSAGE_DURATION_MS / 1000 + 0.56,
                ease: "easeOut",
                times: [0, 0.08, 0.92, 1],
              }
            : { duration: 0.2, ease: "easeOut" }
        }
      >
        <strong className={font.label.medium} style={{ color: lightTheme.label.buttonText }}>
          {progressLabel}
        </strong>
        <span className={font.caption.medium} style={{ color: lightTheme.label.disable }}>
          {detailLabel}
        </span>
        {isLivebankRequested && totalYawTargets > 0 && (
          <div
            className="mt-2 w-full"
            aria-label={`${completedYawTargets}/${totalYawTargets} 방향 확보`}
          >
            <div
              aria-valuemax={totalYawTargets}
              aria-valuemin={0}
              aria-valuenow={completedYawTargets}
              className="flex gap-1"
              role="progressbar"
            >
              {Array.from({ length: totalYawTargets }, (_, index) => {
                const bucket = livebankProgress?.buckets[index];
                const isCaptured = bucket
                  ? capturedYawTargets.includes(bucket.yaw)
                  : index < completedYawTargets;
                const isCurrent = bucket?.yaw === activeStep?.targetYaw;

                return (
                  <span
                    className={cn(
                      "h-1.5 flex-1 rounded-full transition-colors duration-300",
                      isCaptured ? "bg-white" : isCurrent ? "bg-white/75" : "bg-white/25"
                    )}
                    key={bucket?.yaw ?? index}
                  />
                );
              })}
            </div>
          </div>
        )}
      </motion.div>
    </section>
  );
};

export default ArHeadTurnGuide;
