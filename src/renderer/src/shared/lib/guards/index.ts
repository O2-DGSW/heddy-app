/** 객체인지 확인한다. 외부 응답(unknown)을 필드 단위로 좁힐 때 쓴다 */
export const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;
