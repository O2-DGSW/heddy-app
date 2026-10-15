import { describe, expect, test } from "vitest";

import { summarizeIceCandidates, summarizeRemoteAddressKinds } from "./arConnectionLog";

const SDP = [
  "v=0",
  "a=candidate:1 1 udp 2122260223 192.168.0.10 54321 typ host generation 0",
  "a=candidate:2 1 udp 2122260223 100.101.102.103 54322 typ host generation 0",
  "a=candidate:3 1 udp 1686052607 103.84.155.153 54323 typ srflx raddr 0.0.0.0 rport 0",
  "a=candidate:4 1 udp 2122260223 abcd-1234.local 54324 typ host generation 0",
].join("\r\n");

describe("arConnectionLog", () => {
  test("ICE 후보를 종류별로 센다", () => {
    expect(summarizeIceCandidates(SDP)).toEqual({ host: 3, srflx: 1 });
    expect(summarizeIceCandidates(undefined)).toEqual({});
  });

  test("서버 후보 주소를 망 종류로만 분류한다", () => {
    expect(summarizeRemoteAddressKinds(SDP).sort()).toEqual(
      ["mdns", "private", "public", "tailscale"].sort()
    );
  });
});
