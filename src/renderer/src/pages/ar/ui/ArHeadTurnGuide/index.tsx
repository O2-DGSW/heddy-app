import { font, lightTheme } from "@heddy/design-tokens";
import { motion } from "motion/react";

import type { ArLivebankProgress } from "../../model/useArServerConnection";
import { cn } from "@/shared";

const getHeadTurnInstruction = (targetYaw: number) => {
  if (targetYaw === 0) {
    return "정면을 바라봐 주세요";
  }

  return targetYaw < 0 ? "고개를 왼쪽으로 돌려주세요" : "고개를 오른쪽으로 돌려주세요";
};

const getHeadTurnStep = (targetYaw: number) => ({
  id: `yaw-${targetYaw}`,
  label: getHeadTurnInstruction(targetYaw),
  rotation: targetYaw * (3 / 4),
  targetYaw,
});

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
  const isAngleGuideCompleted =
    livebankProgress?.status === "complete" ||
    (livebankProgress?.total !== undefined && capturedYawTargets.length >= livebankProgress.total);
  const isInTargetRange =
    activeStep !== null && typeof yaw === "number" && Math.abs(yaw - activeStep.targetYaw) <= 7;
  const isWaitingForServerDirection =
    isLivebankRequested && livebankProgress !== null && typeof serverYaw !== "number";
  const progressLabel = !isLivebankRequested
    ? "헤어스타일을 선택해 주세요"
    : isGenerating
      ? "헤어를 만들고 있어요"
      : isAngleGuideCompleted
        ? "스타일을 생성하고 있어요"
        : (activeStep?.label ?? "수집 준비 중이에요");
  const detailLabel = !isLivebankRequested
    ? "선택한 스타일의 AR 영상을 만들기 위해 필요해요"
    : isWaitingForServerDirection
      ? "AR 서버에서 얼굴 방향 데이터를 확인하고 있어요"
      : typeof yaw !== "number"
        ? "얼굴 방향 데이터를 기다리고 있어요"
        : isGenerating
          ? "원하는 스타일을 확인해 보세요"
          : isInTargetRange
            ? "좋아요, 그 방향에서 잠깐만 멈춰주세요"
            : "가상 얼굴이 향하는 방향으로 천천히 움직여주세요";
  const guideRotation = activeStep?.rotation ?? (yaw ?? 0) * (3 / 4);
  const previousRotation = activeStep ? (yaw ?? activeStep.targetYaw) * (3 / 4) : guideRotation;

  return (
    <section
      aria-live="polite"
      aria-label="고개 회전 가이드"
      className={cn(
        "pointer-events-none absolute left-1/2 z-10 flex -translate-x-1/2 flex-col items-center",
        isExpanded ? "top-[16%]" : "top-[20%]"
      )}
    >
      <div className="[perspective:700px]">
        <motion.div
          initial={{
            rotateY: previousRotation,
            x: previousRotation / 1.8,
          }}
          animate={{
            rotateY: isAngleGuideCompleted || isGenerating ? 0 : guideRotation,
            x: isAngleGuideCompleted || isGenerating ? 0 : guideRotation / 1.8,
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
              opacity: isAngleGuideCompleted ? 0 : [0.4, 1, 0.4],
              scale: [0.96, 1.06, 0.96],
            }}
            className="absolute -inset-[9px] rounded-[50%] border border-white/75"
            transition={{ duration: 1.6, ease: "easeInOut", repeat: Infinity }}
          />
        </motion.div>
      </div>

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
      </div>
    </section>
  );
};

export default ArHeadTurnGuide;
