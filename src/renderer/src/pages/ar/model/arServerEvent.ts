export interface ArStats {
  yaw?: number;
  yaw_ema?: number;
  bank?: string;
  asset_used?: string;
  server_fps?: number;
  errors?: number;
}

export interface ArLivebankProgress {
  bank?: string;
  banks: string[];
  buckets: ArLivebankBucket[];
  capturedYaw?: number;
  currentYaw?: number;
  done?: number;
  filledYaw?: number;
  index?: number;
  total?: number;
  nextYaw?: number;
  status:
    "started" | "running" | "captured" | "generating" | "filled" | "complete" | "stopped" | "error";
  message?: string;
}

export interface ArLivebankBucket {
  status: string;
  yaw: number;
}

type ArServerEvent =
  { type: "stats"; data: ArStats } | { type: "livebank"; data: ArLivebankProgress };

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const getEventData = (value: Record<string, unknown>): Record<string, unknown> => {
  if (isRecord(value.data)) {
    return value.data;
  }

  if (isRecord(value.payload)) {
    return value.payload;
  }

  return value;
};

const getOptionalNumber = (value: unknown): number | undefined =>
  typeof value === "number" && Number.isFinite(value)
    ? value
    : typeof value === "string" && value.trim() && Number.isFinite(Number(value))
      ? Number(value)
      : undefined;

const isArLivebankStatus = (value: unknown): value is ArLivebankProgress["status"] =>
  value === "started" ||
  value === "running" ||
  value === "captured" ||
  value === "generating" ||
  value === "filled" ||
  value === "complete" ||
  value === "stopped" ||
  value === "error";

const getLivebankYaw = (value: unknown): number | undefined => {
  if (isRecord(value)) {
    return (
      getOptionalNumber(value.yaw) ??
      getOptionalNumber(value.target_yaw) ??
      getOptionalNumber(value.angle)
    );
  }

  return getOptionalNumber(value);
};

const parseLivebankBuckets = (value: unknown): ArLivebankBucket[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap(bucket => {
    const yaw = getLivebankYaw(bucket);

    if (yaw === undefined) {
      return [];
    }

    return [
      {
        status: isRecord(bucket) && typeof bucket.status === "string" ? bucket.status : "pending",
        yaw,
      },
    ];
  });
};

const parseLivebankBanks = (value: unknown): string[] =>
  Array.isArray(value)
    ? value.flatMap(bank => (typeof bank === "string" && bank.trim() ? [bank] : []))
    : [];

const parseArStats = (value: Record<string, unknown>): ArStats => ({
  asset_used: typeof value.asset_used === "string" ? value.asset_used : undefined,
  bank: typeof value.bank === "string" ? value.bank : undefined,
  errors: getOptionalNumber(value.errors),
  server_fps: getOptionalNumber(value.server_fps),
  yaw: getOptionalNumber(value.yaw),
  yaw_ema: getOptionalNumber(value.yaw_ema),
});

const getStatsData = (value: Record<string, unknown>): Record<string, unknown> => {
  const eventData = getEventData(value);

  if (isRecord(eventData.stats)) {
    return eventData.stats;
  }

  if (isRecord(eventData.head_pose)) {
    return eventData.head_pose;
  }

  return eventData;
};

const hasFaceDirection = (value: Record<string, unknown>): boolean =>
  getOptionalNumber(value.yaw) !== undefined || getOptionalNumber(value.yaw_ema) !== undefined;

export const parseDataChannelPayload = async (value: unknown): Promise<unknown> => {
  if (typeof value === "string") {
    return JSON.parse(value) as unknown;
  }

  if (value instanceof ArrayBuffer) {
    return JSON.parse(new TextDecoder().decode(value)) as unknown;
  }

  if (ArrayBuffer.isView(value)) {
    return JSON.parse(new TextDecoder().decode(value)) as unknown;
  }

  if (value instanceof Blob) {
    return JSON.parse(await value.text()) as unknown;
  }

  throw new Error("지원하지 않는 AR DataChannel 메시지 형식입니다.");
};

export const parseArServerEvent = (value: unknown): ArServerEvent | null => {
  if (!isRecord(value)) {
    return null;
  }

  const data = getEventData(value);
  const statsData = getStatsData(value);

  if (value.type === "livebank" && isArLivebankStatus(data.status)) {
    return {
      type: "livebank",
      data: {
        bank: typeof data.bank === "string" ? data.bank : undefined,
        banks: parseLivebankBanks(data.banks),
        buckets: parseLivebankBuckets(data.buckets),
        capturedYaw: getOptionalNumber(data.captured_yaw),
        currentYaw: getOptionalNumber(data.current_yaw) ?? getOptionalNumber(data.yaw),
        done: getOptionalNumber(data.done),
        filledYaw: getOptionalNumber(data.filled_yaw),
        index: getOptionalNumber(data.index),
        message: typeof data.message === "string" ? data.message : undefined,
        nextYaw: getLivebankYaw(data.next),
        status: data.status,
        total: getOptionalNumber(data.total),
      },
    };
  }

  if (value.type === "stats" || hasFaceDirection(statsData)) {
    return { type: "stats", data: parseArStats(statsData) };
  }

  return null;
};

export const isCapturedLivebankBucket = (status: string): boolean =>
  status === "captured" ||
  status === "generating" ||
  status === "filled" ||
  status === "done" ||
  status === "complete";

export const mergeLivebankProgress = (
  previousProgress: ArLivebankProgress | null,
  nextProgress: ArLivebankProgress
): ArLivebankProgress => {
  const buckets =
    nextProgress.buckets.length > 0 ? nextProgress.buckets : (previousProgress?.buckets ?? []);

  if (nextProgress.status !== "captured" || nextProgress.capturedYaw === undefined) {
    return { ...nextProgress, buckets };
  }

  const capturedYaw = nextProgress.capturedYaw;
  const hasCapturedBucket = buckets.some(
    bucket => bucket.yaw === capturedYaw && isCapturedLivebankBucket(bucket.status)
  );

  if (hasCapturedBucket) {
    return { ...nextProgress, buckets };
  }

  const matchingBucketIndex = buckets.findIndex(bucket => bucket.yaw === capturedYaw);

  if (matchingBucketIndex === -1) {
    return {
      ...nextProgress,
      buckets: [...buckets, { status: "captured", yaw: capturedYaw }],
    };
  }

  return {
    ...nextProgress,
    buckets: buckets.map((bucket, index) =>
      index === matchingBucketIndex ? { ...bucket, status: "captured" } : bucket
    ),
  };
};
