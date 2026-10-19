import { useEffect, useState } from "react";

import type { ArConnectionFeedbackType } from "@/features/ar-session";
import { getArConnectionContent, isArConnectionPending } from "./arConnectionContent";

export const useArConnectionContent = (feedback: ArConnectionFeedbackType) => {
  const [delay, setDelay] = useState<{ feedback: ArConnectionFeedbackType; level: number } | null>(
    null
  );
  const level = delay?.feedback === feedback ? delay.level : 0;
  const isConnecting = isArConnectionPending(feedback);

  useEffect(() => {
    if (feedback !== "camera" && !isConnecting) return;
    const slow = window.setTimeout(() => setDelay({ feedback, level: 1 }), 12_000);
    const delayed = window.setTimeout(() => setDelay({ feedback, level: 2 }), 30_000);
    return () => {
      window.clearTimeout(slow);
      window.clearTimeout(delayed);
    };
  }, [feedback, isConnecting]);

  return getArConnectionContent(feedback, level);
};
