import type { ArConnectionFeedbackType } from "@/features/ar-session";

export type ConnectionIconType = "loading" | "wifi" | "camera" | "service";
export interface ConnectionContent {
  title: string;
  description: string;
  icon: ConnectionIconType;
  action?: string;
  animated?: boolean;
}

const CONTENT: Record<ArConnectionFeedbackType, ConnectionContent> = {
  camera: {
    title: "카메라를 준비하고 있어요",
    description: "곧 새로운 스타일을 만나볼 수 있어요",
    icon: "camera",
    animated: true,
  },
  connecting: {
    title: "AR을 생성하고 있어요",
    description: "나에게 맞는 스타일을 준비하고 있어요",
    icon: "loading",
    animated: true,
  },
  retrying: {
    title: "AR 연결을 준비하고 있어요",
    description: "서버 응답을 기다리며 다시 시도하고 있어요",
    icon: "loading",
    animated: true,
  },
  reconnecting: {
    title: "AR을 다시 연결하고 있어요",
    description: "잠깐 끊겼어요. 선택한 스타일은 그대로예요",
    icon: "loading",
    animated: true,
  },
  offline: {
    title: "인터넷 연결이 끊겼어요",
    description: "Wi-Fi나 데이터를 켜면 자동으로 연결돼요",
    icon: "wifi",
  },
  permission: {
    title: "카메라 권한이 필요해요",
    description: "설정에서 카메라를 허용한 뒤 눌러 주세요",
    icon: "camera",
    action: "다시 시도",
  },
  "camera-missing": {
    title: "카메라를 찾지 못했어요",
    description: "사용 가능한 카메라를 확인해 주세요",
    icon: "camera",
    action: "카메라 다시 연결",
  },
  "camera-busy": {
    title: "카메라를 열 수 없어요",
    description: "카메라를 쓰는 다른 앱을 닫아 주세요",
    icon: "camera",
    action: "다시 시도",
  },
  "camera-error": {
    title: "카메라 준비에 실패했어요",
    description: "카메라 상태를 확인하고 다시 시도해 주세요",
    icon: "camera",
    action: "다시 시도",
  },
  unsupported: {
    title: "카메라를 사용할 수 없어요",
    description: "Heddy 앱이나 보안 연결된 브라우저로 열어 주세요",
    icon: "camera",
  },
  unavailable: {
    title: "지금은 AR을 사용할 수 없어요",
    description: "잠시 후 다시 시도해 주세요",
    icon: "service",
    action: "다시 시도",
  },
};

export const isArConnectionPending = (feedback: ArConnectionFeedbackType): boolean =>
  feedback === "connecting" || feedback === "retrying" || feedback === "reconnecting";

export const getArConnectionContent = (
  feedback: ArConnectionFeedbackType,
  level: number
): ConnectionContent => {
  const isConnecting = isArConnectionPending(feedback);
  const content = { ...CONTENT[feedback] };

  if (feedback === "camera" && level > 0)
    content.description = "카메라 권한 요청이 보이면 허용해 주세요";
  if (isConnecting && level > 0) {
    content.title = "연결이 조금 늦어지고 있어요";
    content.description = "연결을 계속 확인하고 있어요";
    if (level > 1) {
      content.icon = "wifi";
      content.title = "연결 상태를 확인해 주세요";
      content.description = "인터넷이나 AR 서버 응답이 늦어지고 있어요";
    }
  }

  return content;
};
