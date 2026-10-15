import { Capacitor } from "@capacitor/core";
import { ApiHttpError, get, post } from "@heddy/api";

import type { ArHairstyleOption } from "../model/arGroom.types";
import { env } from "@/shared/config";
import { isRecord, publicUrl } from "@/shared/lib";

export const getArServerBaseUrl = (): string => {
  const configuredUrl = env.arServerUrl;
  if (!configuredUrl) return "";
  let url: URL;
  try {
    url = new URL(configuredUrl);
  } catch {
    throw new Error("지금은 AR을 사용할 수 없습니다. 잠시 후 다시 시도해 주세요.");
  }
  const isLocalhost = ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname);
  if (
    url.username ||
    url.password ||
    (url.protocol !== "https:" && !(isLocalhost && url.protocol === "http:"))
  ) {
    // 설정 오류(HTTPS가 아닌 주소 등)는 사용자가 고칠 수 없으므로 원인은 개발 콘솔에만 남긴다.
    console.error("AR 서버 주소는 HTTPS여야 합니다. 로컬 개발에서는 localhost HTTP만 허용합니다.");
    throw new Error("지금은 AR을 사용할 수 없습니다. 잠시 후 다시 시도해 주세요.");
  }
  return Capacitor.isNativePlatform() ? configuredUrl : publicUrl("ar-server");
};

export const getArGrooms = async (signal?: AbortSignal): Promise<ArHairstyleOption[]> => {
  const baseUrl = getArServerBaseUrl();
  if (!baseUrl) throw new Error("지금은 AR을 사용할 수 없습니다. 잠시 후 다시 시도해 주세요.");
  let response: unknown;
  try {
    response = await get(`${baseUrl}/grooms`, { signal });
  } catch (error: unknown) {
    signal?.throwIfAborted();
    throw new Error("헤어스타일 목록을 불러오지 못했습니다.", { cause: error });
  }
  return parseArGrooms(response, baseUrl);
};

const isStringArray = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every(item => typeof item === "string");

const isArGroomAssetPath = (value: unknown): value is string =>
  typeof value === "string" &&
  /^\/?grooms\/[A-Za-z0-9._-]+\.png$/.test(value) &&
  !value.includes("..");

const resolveArGroomAssetUrl = (path: string, baseUrl: string): string =>
  `${baseUrl.replace(/\/+$/, "")}/${path.replace(/^\/+/, "")}`;

export const parseArGrooms = (
  response: unknown,
  serverBaseUrl = getArServerBaseUrl()
): ArHairstyleOption[] => {
  if (!isRecord(response) || !Array.isArray(response.grooms)) {
    throw new Error("헤어스타일 목록을 불러오지 못했습니다.");
  }
  return response.grooms.map((groom: unknown) => {
    if (!isRecord(groom) || typeof groom.name !== "string" || !groom.name.trim()) {
      throw new Error("헤어스타일 목록을 불러오지 못했습니다.");
    }

    const thumbUrl = isArGroomAssetPath(groom.thumb)
      ? resolveArGroomAssetUrl(groom.thumb, serverBaseUrl)
      : undefined;
    const viewsUrl = isArGroomAssetPath(groom.views)
      ? resolveArGroomAssetUrl(groom.views, serverBaseUrl)
      : undefined;

    return {
      name: groom.name,
      label: typeof groom.label === "string" && groom.label.trim() ? groom.label : groom.name,
      gender: typeof groom.gender === "string" ? groom.gender : undefined,
      type: typeof groom.type === "string" ? groom.type : undefined,
      tags: isStringArray(groom.tags) ? groom.tags.filter(tag => tag.trim()) : [],
      thumbUrl,
      viewsUrl,
    };
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
        ? "다른 사용자가 AR을 사용 중입니다. 잠시 후 다시 연결해 주세요."
        : "AR 서버에 연결하지 못했습니다. 네트워크를 확인하고 다시 연결해 주세요.";
    throw new Error(message, { cause: error });
  }
  if (!isRecord(answer) || typeof answer.sdp !== "string" || answer.type !== "answer") {
    throw new Error("AR 서버에 연결하지 못했습니다. 다시 연결해 주세요.");
  }
  return { sdp: answer.sdp, type: answer.type };
};
