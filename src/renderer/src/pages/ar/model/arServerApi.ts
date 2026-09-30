import { Capacitor } from "@capacitor/core";
import { ApiHttpError, get, post } from "@heddy/api";

import type { ArHairstyleOption } from "./types";

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

export const getArServerBaseUrl = (): string => {
  const configuredUrl = import.meta.env.VITE_AR_SERVER_URL?.trim().replace(/\/$/, "") ?? "";
  if (!configuredUrl) return "";
  let url: URL;
  try {
    url = new URL(configuredUrl);
  } catch {
    throw new Error("AR 서버 주소가 올바르지 않습니다.");
  }
  const isLocalhost = ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname);
  if (
    url.username ||
    url.password ||
    (url.protocol !== "https:" && !(isLocalhost && url.protocol === "http:"))
  ) {
    throw new Error(
      "AR 서버는 HTTPS 주소를 사용해야 합니다. 로컬 개발에서는 localhost HTTP를 사용할 수 있습니다."
    );
  }
  return Capacitor.isNativePlatform() ? configuredUrl : "/ar-server";
};

export const getArGrooms = async (signal?: AbortSignal): Promise<ArHairstyleOption[]> => {
  const baseUrl = getArServerBaseUrl();
  if (!baseUrl) throw new Error("AR 서버 주소가 설정되지 않았습니다.");
  let response: unknown;
  try {
    response = await get(`${baseUrl}/grooms`, { signal });
  } catch (error: unknown) {
    signal?.throwIfAborted();
    throw new Error("AR 헤어스타일 목록을 불러오지 못했습니다.", { cause: error });
  }
  return parseArGrooms(response);
};

export const parseArGrooms = (response: unknown): ArHairstyleOption[] => {
  if (!isRecord(response) || !Array.isArray(response.grooms)) {
    throw new Error("AR 서버의 헤어스타일 목록 형식이 올바르지 않습니다.");
  }
  return response.grooms.map((groom: unknown) => {
    if (!isRecord(groom) || typeof groom.name !== "string" || !groom.name.trim()) {
      throw new Error("AR 서버의 헤어스타일 이름이 올바르지 않습니다.");
    }
    // GLB 파일은 서버에서 렌더링하므로 목록 이름만 사용한다.
    return { id: groom.name, label: groom.name };
  });
};

export const requestArServerOffer = async (
  serverBaseUrl: string,
  offer: RTCSessionDescriptionInit,
  signal?: AbortSignal
): Promise<RTCSessionDescriptionInit> => {
  let answer: unknown;
  try {
    answer = await post(`${serverBaseUrl}/offer`, offer, { signal });
  } catch (error: unknown) {
    signal?.throwIfAborted();
    const message =
      error instanceof ApiHttpError && error.status === 503
        ? "AR 서버가 사용 중입니다. 잠시 후 다시 시도해 주세요."
        : "AR 서버가 연결 요청을 처리하지 못했습니다.";
    throw new Error(message, { cause: error });
  }
  if (!isRecord(answer) || typeof answer.sdp !== "string" || answer.type !== "answer") {
    throw new Error("AR 서버가 유효한 WebRTC 응답을 반환하지 않았습니다.");
  }
  return { sdp: answer.sdp, type: answer.type };
};
