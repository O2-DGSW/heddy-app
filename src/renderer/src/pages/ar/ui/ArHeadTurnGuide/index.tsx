import { font, lightTheme } from "@heddy/design-tokens";
import { motion } from "motion/react";

import type { ArLivebankProgress } from "../../model/useArServerConnection";
import { LIVEBANK_CAPTURE_YAWS } from "../../model/constants";
import { cn } from "@/shared";

const getHeadTurnStep = (targetYaw: number) => ({
  id: `yaw-${targetYaw}`,
  label: targetYaw === 0 ? "정면을 바라봐 주세요" : `고개를 ${targetYaw}°로 돌려주세요`,
  rotation: targetYaw * (2 / 3),
  targetYaw,
});

const HEAD_TURN_STEPS = LIVEBANK_CAPTURE_YAWS.map(getHeadTurnStep);

interface ArHeadTurnGuideProps {
  capturedYawTargets: number[];
  isExpanded: boolean;
  livebankProgress: ArLivebankProgress | null;
  yaw?: number;
}

const ArHeadTurnGuide = ({
  capturedYawTargets,
  isExpanded,
  livebankProgress,
  yaw,
}: ArHeadTurnGuideProps) => {
  const activeStepIndex = HEAD_TURN_STEPS.findIndex(
    step => !capturedYawTargets.includes(step.targetYaw)
  );
  const isAngleGuideCompleted = activeStepIndex === -1;
  const activeStep =
    HEAD_TURN_STEPS[isAngleGuideCompleted ? HEAD_TURN_STEPS.length - 1 : activeStepIndex];
  const isGenerating =
    livebankProgress?.status === "started" ||
    livebankProgress?.status === "running" ||
    livebankProgress?.status === "generating";
  const isGenerationCompleted = livebankProgress?.status === "complete";

  const progressLabel = isGenerationCompleted
    ? "스타일 생성이 완료됐어요"
    : isAngleGuideCompleted
      ? "스타일을 생성하고 있어요"
      : activeStep.label;
  const detailLabel =
    typeof yaw !== "number"
      ? "얼굴 방향 데이터를 기다리고 있어요"
      : isGenerating && livebankProgress?.total
        ? `${livebankProgress.done ?? 0}/${livebankProgress.total} 방향 생성 중`
        : isGenerationCompleted
          ? "원하는 스타일을 확인해 보세요"
          : `현재 각도 ${Math.round(yaw)}°`;

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
          animate={{
            rotateY: isGenerationCompleted ? 0 : activeStep.rotation,
            x: activeStep.rotation / 2,
          }}
          className="relative flex h-[104px] w-[82px] items-center justify-center rounded-[46%] border border-white/75 bg-white/25 shadow-[0_8px_24px_rgba(0,0,0,0.2)] backdrop-blur-sm"
          transition={{ damping: 16, stiffness: 120, type: "spring" }}
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
        <span aria-hidden="true" className="mt-2 flex gap-1.5">
          {HEAD_TURN_STEPS.map(step => (
            <span
              className={cn(
                "h-1.5 w-1.5 rounded-full transition-colors duration-200",
                capturedYawTargets.includes(step.targetYaw) ? "bg-white" : "bg-white/35"
              )}
              key={step.id}
            />
          ))}
        </span>
      </div>
    </section>
  );
};

export default ArHeadTurnGuide;
