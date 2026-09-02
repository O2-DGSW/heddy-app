import { font, lightTheme } from "@heddy/design-tokens";
import { motion } from "motion/react";
import { useEffect, useState } from "react";

import type { ArLivebankProgress } from "../../model/useArServerConnection";
import { cn } from "@/shared";

const HEAD_TURN_STEPS = [
  { id: "front", label: "정면을 바라봐 주세요", targetYaw: 0, threshold: 10, rotation: 0 },
  { id: "left", label: "고개를 왼쪽으로 돌려주세요", targetYaw: -36, threshold: 12, rotation: -24 },
  {
    id: "right",
    label: "고개를 오른쪽으로 돌려주세요",
    targetYaw: 36,
    threshold: 12,
    rotation: 24,
  },
] as const;

const isTargetYawReached = (yaw: number, targetYaw: number, threshold: number) =>
  Math.abs(yaw - targetYaw) <= threshold;

interface ArHeadTurnGuideProps {
  isExpanded: boolean;
  livebankProgress: ArLivebankProgress | null;
  yaw?: number;
}

const ArHeadTurnGuide = ({ isExpanded, livebankProgress, yaw }: ArHeadTurnGuideProps) => {
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const activeStep = HEAD_TURN_STEPS[Math.min(activeStepIndex, HEAD_TURN_STEPS.length - 1)];
  const isAngleGuideCompleted = activeStepIndex === HEAD_TURN_STEPS.length;
  const isGenerating =
    livebankProgress?.status === "started" ||
    livebankProgress?.status === "running" ||
    livebankProgress?.status === "generating";
  const isGenerationCompleted = livebankProgress?.status === "complete";

  useEffect(() => {
    if (livebankProgress?.status !== "started") {
      return;
    }

    const animationFrame = window.requestAnimationFrame(() => {
      setActiveStepIndex(0);
    });

    return () => window.cancelAnimationFrame(animationFrame);
  }, [livebankProgress?.status]);

  useEffect(() => {
    if (
      typeof yaw !== "number" ||
      activeStepIndex >= HEAD_TURN_STEPS.length ||
      !isTargetYawReached(yaw, activeStep.targetYaw, activeStep.threshold)
    ) {
      return;
    }

    const animationFrame = window.requestAnimationFrame(() => {
      setActiveStepIndex(currentStepIndex => currentStepIndex + 1);
    });

    return () => window.cancelAnimationFrame(animationFrame);
  }, [activeStep, activeStepIndex, yaw]);

  const progressLabel = isGenerationCompleted
    ? "스타일 생성이 완료됐어요"
    : isAngleGuideCompleted
      ? "스타일을 생성하고 있어요"
      : activeStep.label;
  const detailLabel =
    typeof yaw !== "number"
      ? "고개 움직임을 감지하고 있어요"
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
          {HEAD_TURN_STEPS.map((step, index) => (
            <span
              className={cn(
                "h-1.5 w-1.5 rounded-full transition-colors duration-200",
                index < activeStepIndex ? "bg-white" : "bg-white/35"
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
