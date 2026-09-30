export interface ArStats {
  yaw?: number;
  yaw_ema?: number;
  server_fps?: number;
  errors?: number;
}

type ArServerEvent =
  | { type: "stats"; data: ArStats }
  | { type: "groom"; status: "ok" | "error"; groom?: string; message?: string }
  | { type: "forehead"; status: "loading" | "ok" | "error"; message?: string }
  | { type: "error"; message: string };

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const getEventData = (value: Record<string, unknown>): Record<string, unknown> => {
  if (isRecord(value.data)) return value.data;
  if (isRecord(value.payload)) return value.payload;
  return value;
};

const getOptionalNumber = (value: unknown): number | undefined => {
  const number = typeof value === "string" && value.trim() ? Number(value) : value;
  return typeof number === "number" && Number.isFinite(number) ? number : undefined;
};

export const parseDataChannelPayload = async (value: unknown): Promise<unknown> => {
  if (typeof value === "string") return JSON.parse(value) as unknown;
  if (value instanceof ArrayBuffer || ArrayBuffer.isView(value)) {
    return JSON.parse(new TextDecoder().decode(value)) as unknown;
  }
  if (value instanceof Blob) return JSON.parse(await value.text()) as unknown;
  throw new Error("지원하지 않는 AR DataChannel 메시지 형식입니다.");
};

export const parseArServerEvent = (value: unknown): ArServerEvent | null => {
  if (!isRecord(value)) return null;
  const data = getEventData(value);
  const message = typeof data.message === "string" ? data.message : undefined;
  if (value.type === "groom" && (data.status === "ok" || data.status === "error")) {
    if (data.status === "ok" && typeof data.groom !== "string") return null;
    return {
      type: "groom",
      status: data.status,
      groom: typeof data.groom === "string" ? data.groom : undefined,
      message,
    };
  }
  if (
    value.type === "forehead" &&
    (data.status === "loading" || data.status === "ok" || data.status === "error")
  ) {
    return { type: "forehead", status: data.status, message };
  }
  if (value.type === "error") {
    return { type: "error", message: message ?? "AR 서버가 요청을 처리하지 못했습니다." };
  }
  if (value.type !== "stats") return null;
  const stats = isRecord(data.stats)
    ? data.stats
    : isRecord(data.head_pose)
      ? data.head_pose
      : data;
  return {
    type: "stats",
    data: {
      yaw: getOptionalNumber(stats.yaw),
      yaw_ema: getOptionalNumber(stats.yaw_ema),
      server_fps: getOptionalNumber(stats.server_fps),
      errors: getOptionalNumber(stats.errors),
    },
  };
};
