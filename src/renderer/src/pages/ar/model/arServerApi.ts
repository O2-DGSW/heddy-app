import { Capacitor, CapacitorHttp } from "@capacitor/core";

import type { ArHairstyleOption } from "./types";

interface ArServerAnswer {
  sdp: string;
  type: "answer";
}

interface ArServerReferencesResponse {
  references?: unknown[];
  styles?: unknown[];
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const isArServerAnswer = (value: unknown): value is ArServerAnswer =>
  isRecord(value) && typeof value.sdp === "string" && value.type === "answer";

const isArServerReferencesResponse = (value: unknown): value is ArServerReferencesResponse =>
  isRecord(value) && (Array.isArray(value.references) || Array.isArray(value.styles));

const parseHairstyleOption = (value: unknown): ArHairstyleOption | null => {
  if (typeof value === "string" && value.trim()) {
    return { id: value, label: value };
  }

  if (!isRecord(value) || typeof value.id !== "string" || !value.id.trim()) {
    return null;
  }

  const label =
    typeof value.display_name === "string"
      ? value.display_name
      : typeof value.name === "string"
        ? value.name
        : value.id;
  const imageUrl =
    typeof value.image_url === "string"
      ? value.image_url
      : typeof value.thumbnail_url === "string"
        ? value.thumbnail_url
        : typeof value.image === "string"
          ? value.image
          : undefined;

  return { id: value.id, imageUrl, label };
};

export const getArServerBaseUrl = (): string => {
  const configuredUrl = import.meta.env.VITE_AR_SERVER_URL?.trim().replace(/\/$/, "") ?? "";

  return configuredUrl ? (Capacitor.isNativePlatform() ? configuredUrl : "/ar-server") : "";
};

export const getArHairstyleReferences = async (): Promise<ArHairstyleOption[]> => {
  const serverBaseUrl = getArServerBaseUrl();

  if (!serverBaseUrl) {
    throw new Error("AR 서버 주소가 설정되지 않았습니다.");
  }

  const url = `${serverBaseUrl}/references`;
  let responseData: unknown;

  if (Capacitor.isNativePlatform()) {
    const response = await CapacitorHttp.get({
      connectTimeout: 10000,
      readTimeout: 10000,
      url,
    });

    if (response.status < 200 || response.status >= 300) {
      throw new Error("AR 헤어스타일 목록을 불러오지 못했습니다.");
    }

    responseData = response.data;
  } else {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error("AR 헤어스타일 목록을 불러오지 못했습니다.");
    }

    responseData = (await response.json()) as unknown;
  }

  if (!isArServerReferencesResponse(responseData)) {
    throw new Error("AR 서버의 헤어스타일 목록 형식이 올바르지 않습니다.");
  }

  return (responseData.styles ?? responseData.references ?? []).flatMap(reference => {
    const hairstyleOption = parseHairstyleOption(reference);

    return hairstyleOption ? [hairstyleOption] : [];
  });
};

export const requestArServerOffer = async (
  serverBaseUrl: string,
  offer: RTCSessionDescriptionInit
): Promise<RTCSessionDescriptionInit> => {
  const url = `${serverBaseUrl}/offer`;
  let answer: unknown;

  if (Capacitor.isNativePlatform()) {
    const response = await CapacitorHttp.post({
      connectTimeout: 10000,
      data: offer,
      headers: { "Content-Type": "application/json" },
      readTimeout: 10000,
      url,
    });

    if (response.status < 200 || response.status >= 300) {
      throw new Error("AR 서버가 offer 요청을 처리하지 못했습니다.");
    }

    answer = response.data;
  } else {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(offer),
    });
    answer = (await response.json()) as unknown;

    if (!response.ok) {
      throw new Error("AR 서버가 offer 요청을 처리하지 못했습니다.");
    }
  }

  if (!isArServerAnswer(answer)) {
    throw new Error("AR 서버가 유효한 WebRTC 응답을 반환하지 않았습니다.");
  }

  return answer;
};
