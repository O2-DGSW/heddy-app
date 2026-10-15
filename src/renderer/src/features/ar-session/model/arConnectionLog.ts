import { createDebugLogger } from "@/shared/lib";

/** AR 연결 진단 로그. Xcode·Logcat에서 `[AR]`로 걸러 본다 */
export const arLog = createDebugLogger("AR");

/**
 * SDP의 ICE 후보를 종류별로 센다. host(기기 내부 IP)·srflx(공인 IP)·relay(TURN) 구성을 보면
 * 미디어 연결이 막히는 원인(같은 네트워크·Tailscale 여부)을 가늠할 수 있다. IP 원문은 남기지 않는다.
 */
export const summarizeIceCandidates = (sdp: string | undefined) => {
  const counts: Record<string, number> = {};

  for (const line of (sdp ?? "").split(/\r?\n/)) {
    const match = /^a=candidate:.* typ (\w+)/.exec(line);
    const type = match?.[1];

    if (type) {
      counts[type] = (counts[type] ?? 0) + 1;
    }
  }

  return counts;
};

/** 서버가 알려 준 후보 주소가 어떤 망인지 분류한다(Tailscale 100.64/10, 사설망, 공인망) */
export const summarizeRemoteAddressKinds = (sdp: string | undefined) => {
  const kinds = new Set<string>();

  for (const line of (sdp ?? "").split(/\r?\n/)) {
    const match = /^a=candidate:\S+ \d+ \S+ \d+ (\S+) \d+ typ/.exec(line);
    const address = match?.[1];

    if (!address) continue;

    if (/^100\.(6[4-9]|[7-9]\d|1[01]\d|12[0-7])\./.test(address)) kinds.add("tailscale");
    else if (/^(10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/.test(address)) kinds.add("private");
    else if (address.includes(":")) kinds.add("ipv6");
    else if (address.endsWith(".local")) kinds.add("mdns");
    else kinds.add("public");
  }

  return [...kinds];
};
