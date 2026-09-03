import { font, lightTheme } from "@heddy/design-tokens";
import { motion } from "motion/react";

import type { ArLivebankProgress } from "../../model/useArServerConnection";
import { cn } from "@/shared";

const TARGET_YAW_TOLERANCE = 7;

const getHeadTurnInstruction = (targetYaw: number) => {
  if (targetYaw === 0) {
    return "정면을 바라봐 주세요";
  }

  // AR 서버 FacePose의 yaw 부호는 카메라 기준 실제 회전과 반대다.
  // 서버 내부 수집·에셋 선택은 같은 좌표계를 공유하므로 그대로 두고,
  // 사용자에게 보여 주는 물리적 방향과 가상 얼굴 회전만 반대로 보정한다.
  return targetYaw < 0 ? "고개를 오른쪽으로 돌려주세요" : "고개를 왼쪽으로 돌려주세요";
};

const getHeadTurnStep = (targetYaw: number) => ({
  id: `yaw-${targetYaw}`,
  label: getHeadTurnInstruction(targetYaw),
  rotation: -targetYaw * (3 / 4),
  targetYaw,
});

const getTurnCorrectionLabel = (targetYaw: number, currentYaw: number): string => {
  if (Math.abs(currentYaw - targetYaw) <= TARGET_YAW_TOLERANCE) {
    return "좋아요, 움직이지 말고 잠시 유지해 주세요";
  }

  if (targetYaw === 0) {
    return "고개를 정면으로 되돌려 주세요";
  }

  // 서버 yaw는 실제 회전 부호와 반대이므로 yaw가 목표보다 크면 오른쪽으로 더 돌아야 한다.
  const direction = currentYaw > targetYaw ? "오른쪽" : "왼쪽";
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
    livebankProgress?.status === "generating" ||
    livebankProgress?.status === "running" ||
    livebankProgress?.status === "filled";
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
  const currentRotation = -(yaw ?? 0) * (3 / 4);
  const guideRotation = activeStep?.rotation ?? currentRotation;
  const previousRotation = activeStep ? currentRotation : guideRotation;

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
          : isExpanded
            ? "top-[16%]"
            : "top-[20%]"
      )}
    >
      {!isStyleGenerationCompleted && (
        <div className="[perspective:700px]">
          <motion.div
            initial={{
              rotateY: previousRotation,
              x: previousRotation / 1.8,
            }}
            animate={{
              rotateY: isAngleCollectionCompleted || isGenerating ? 0 : guideRotation,
              x: isAngleCollectionCompleted || isGenerating ? 0 : guideRotation / 1.8,
            }}
            className="relative flex h-[104px] w-[82px] items-center justify-center rounded-[46%] border border-white/75 bg-white/25 shadow-[0_8px_24px_rgba(0,0,0,0.2)] backdrop-blur-sm"
            key={activeStep?.id ?? livebankProgress?.status ?? "waiting"}
            style={{ transformOrigin: "center center" }}
            transition={{ damping: 18, mass: 0.9, stiffness: 90, type: "spring" }}
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

      <div
        className="mt-3 flex flex-col items-center rounded-[12px] px-3 py-2 text-center backdrop-blur-sm"
        style={{ backgroundColor: "rgba(0, 0, 0, 0.48)" }}
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
      </div>
    </section>
  );
};

export default ArHeadTurnGuide;
