import assert from "node:assert/strict";
import { createServer } from "node:http";
import { after, before, test } from "node:test";

import { ApiHttpError, get, post } from "./index.ts";

let baseUrl = "";
let requestCount = 0;
const server = createServer((request, response) => {
  requestCount += 1;
  const send = (data: unknown) => {
    response.setHeader("Content-Type", "application/json");
    response.end(JSON.stringify(data));
  };
  if (request.url === "/error") {
    response.statusCode = 503;
    send({ error: "server_busy" });
    return;
  }
  if (request.url === "/slow") {
    setTimeout(() => send({ ok: true }), 100);
    return;
  }
  if (request.url === "/slow-body") {
    response.setHeader("Content-Type", "application/json");
    response.write('{"ok":');
    setTimeout(() => response.end("true}"), 100);
    return;
  }
  if (request.method === "POST") {
    let body = "";
    request.on("data", (chunk: unknown) => {
      body += String(chunk);
    });
    request.on("end", () =>
      send({
        method: request.method,
        body: JSON.parse(body),
        contentType: request.headers["content-type"],
      })
    );
  } else send({ grooms: [{ name: "short-swept" }] });
});

before(async () => {
  await new Promise<void>(resolve => server.listen(0, "127.0.0.1", resolve));
  const address = server.address();
  if (!address || typeof address === "string") throw new Error("검증 서버 주소를 얻지 못했습니다.");
  baseUrl = `http://127.0.0.1:${address.port}`;
});

after(async () => {
  server.closeAllConnections();
  await new Promise<void>((resolve, reject) =>
    server.close(error => (error ? reject(error) : resolve()))
  );
});

test("공용 get이 JSON 응답을 반환한다", async () => {
  assert.deepEqual(await get(`${baseUrl}/grooms`), { grooms: [{ name: "short-swept" }] });
});

test("공용 post가 JSON offer를 전송한다", async () => {
  const offer = { type: "offer", sdp: "test-sdp" };
  assert.deepEqual(await post(`${baseUrl}/offer`, offer), {
    method: "POST",
    body: offer,
    contentType: "application/json",
  });
});

test("서버 오류의 상태 코드와 응답을 보존한다", async () => {
  await assert.rejects(get(`${baseUrl}/error`), (error: unknown) => {
    assert.ok(error instanceof ApiHttpError);
    assert.equal(error.status, 503);
    assert.deepEqual(error.data, { error: "server_busy" });
    return true;
  });
});

test("미리 취소된 요청은 전송하지 않는다", async () => {
  const count = requestCount;
  const controller = new AbortController();
  controller.abort(new Error("화면 이탈"));
  await assert.rejects(get(`${baseUrl}/grooms`, { signal: controller.signal }), /화면 이탈/);
  assert.equal(requestCount, count);
});

test("응답 대기 중 화면 이탈 시 요청을 취소한다", async () => {
  const controller = new AbortController();
  const result = get(`${baseUrl}/slow`, { signal: controller.signal });
  setTimeout(() => controller.abort(new Error("화면 이탈")), 10);
  await assert.rejects(result, /화면 이탈/);
});

test("응답 본문 수신 중 취소를 JSON 파싱 오류로 삼키지 않는다", async () => {
  const controller = new AbortController();
  const result = get(`${baseUrl}/slow-body`, { signal: controller.signal });
  setTimeout(() => controller.abort(new Error("본문 수신 취소")), 20);
  await assert.rejects(result, /본문 수신 취소/);
});

test("서버가 응답하지 않으면 제한 시간 뒤 종료한다", async () => {
  await assert.rejects(get(`${baseUrl}/slow`, { timeoutMs: 10 }), /응답 시간이 초과/);
});
