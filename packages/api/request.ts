import { Capacitor, CapacitorHttp } from "@capacitor/core";

export interface ApiRequestOptions {
  signal?: AbortSignal;
  timeoutMs?: number;
}

export class ApiHttpError extends Error {
  readonly status: number;
  readonly data: unknown;

  constructor(status: number, data: unknown) {
    super(`HTTP 요청 실패 (${status})`);
    this.name = "ApiHttpError";
    this.status = status;
    this.data = data;
  }
}

const request = async (
  method: "GET" | "POST",
  url: string,
  body: unknown,
  { signal, timeoutMs = 10000 }: ApiRequestOptions
): Promise<unknown> => {
  signal?.throwIfAborted();
  const headers = { Accept: "application/json", "Content-Type": "application/json" };

  if (Capacitor.isNativePlatform()) {
    const response = await CapacitorHttp.request({
      method,
      url,
      headers,
      ...(body !== undefined && { data: body }),
      connectTimeout: timeoutMs,
      readTimeout: timeoutMs,
      responseType: "json",
    });
    // 네이티브 HTTP는 AbortSignal을 받지 않으므로 취소된 결과를 호출부에 전달하지 않는다.
    signal?.throwIfAborted();
    const data: unknown = response.data;
    if (response.status < 200 || response.status >= 300) {
      throw new ApiHttpError(response.status, data);
    }
    return data;
  }

  const controller = new AbortController();
  const handleAbort = () => controller.abort(signal?.reason);
  signal?.addEventListener("abort", handleAbort, { once: true });
  const timeout = setTimeout(
    () => controller.abort(new Error("서버 응답 시간이 초과되었습니다.")),
    timeoutMs
  );
  try {
    const response = await fetch(url, {
      method,
      headers,
      ...(body !== undefined && { body: JSON.stringify(body) }),
      signal: controller.signal,
    });
    const data: unknown = await response.json().catch(() => null);
    controller.signal.throwIfAborted();
    if (!response.ok) throw new ApiHttpError(response.status, data);
    return data;
  } finally {
    clearTimeout(timeout);
    signal?.removeEventListener("abort", handleAbort);
  }
};

export const get = (url: string, options: ApiRequestOptions = {}): Promise<unknown> =>
  request("GET", url, undefined, options);

export const post = (
  url: string,
  body: unknown,
  options: ApiRequestOptions = {}
): Promise<unknown> => request("POST", url, body, options);
