import assert from "node:assert/strict";
import { test } from "node:test";

import { parseArGrooms } from "../src/renderer/src/pages/ar/model/arServerApi.ts";
import {
  parseArServerEvent,
  parseDataChannelPayload,
} from "../src/renderer/src/pages/ar/model/arServerEvent.ts";
import {
  buildGroomFitCommand,
  DEFAULT_GROOM_FIT_SETTINGS,
  isValidGroomFitSettings,
} from "../src/renderer/src/pages/ar/model/arGroomFit.ts";

const defaults = DEFAULT_GROOM_FIT_SETTINGS;

test("groom 이름만 목록에 사용하고 GLB를 이미지로 노출하지 않는다", () => {
  assert.deepEqual(
    parseArGrooms({
      grooms: [{ name: "short-swept", url: "/grooms/style.glb", n_strands: 12855 }],
    }),
    [{ id: "short-swept", label: "short-swept" }]
  );
  assert.deepEqual(parseArGrooms({ grooms: [] }), []);
});

test("GAN 목록과 잘못된 groom 이름을 거부한다", () => {
  for (const response of [
    null,
    { references: [] },
    { grooms: {} },
    { grooms: [{ id: "old" }] },
    { grooms: [{ name: " " }] },
  ]) {
    assert.throws(() => parseArGrooms(response));
  }
});

test("최초 선택에는 groom만 전송하고 같은 선택은 중복 전송하지 않는다", () => {
  assert.deepEqual(buildGroomFitCommand("short-swept", defaults, null), {
    type: "fit",
    groom: "short-swept",
  });
  assert.equal(
    buildGroomFitCommand("short-swept", defaults, { groom: "short-swept", settings: defaults }),
    null
  );
});

test("머리색 자동 맞춤으로 복귀할 때 빈 문자열을 명시한다", () => {
  assert.deepEqual(
    buildGroomFitCommand("short-swept", defaults, {
      groom: "short-swept",
      settings: { ...defaults, groom_color: "#102030" },
    }),
    { type: "fit", groom_color: "" }
  );
});

test("스타일 변경에는 사용자 조정값을 다시 적용하고 해제 시 이전 설정을 초기화한다", () => {
  const custom = {
    ...defaults,
    dyn: 0,
    scale: 1.5,
    offset: -150,
    groom_fwd: 15,
    groom_color: "#102030",
  };
  assert.deepEqual(
    buildGroomFitCommand("long-wavy", custom, { groom: "short-swept", settings: custom }),
    {
      type: "fit",
      groom: "long-wavy",
      groom_color: "#102030",
      dyn: 0,
      scale: 1.5,
      offset: -150,
      groom_fwd: 15,
    }
  );
  assert.deepEqual(buildGroomFitCommand("", defaults, { groom: "long-wavy", settings: custom }), {
    type: "fit",
    groom: "",
    groom_color: "",
    dyn: 1,
    scale: 1,
    offset: 0,
    groom_fwd: 0,
  });
});

test("조정 범위의 양 끝과 6자리 색상만 허용한다", () => {
  assert.equal(
    isValidGroomFitSettings({
      groom_color: "#aBc123",
      dyn: 0,
      scale: 0.5,
      offset: -150,
      groom_fwd: -15,
    }),
    true
  );
  assert.equal(
    isValidGroomFitSettings({ groom_color: "", dyn: 2, scale: 2, offset: 150, groom_fwd: 15 }),
    true
  );
  for (const invalid of [
    { dyn: -0.1 },
    { dyn: 2.1 },
    { scale: 0.49 },
    { scale: 2.01 },
    { offset: 151 },
    { groom_fwd: -16 },
    { dyn: NaN },
    { scale: Infinity },
    { groom_color: "#abc" },
    { groom_color: "red" },
  ]) {
    assert.equal(isValidGroomFitSettings({ ...defaults, ...invalid }), false);
  }
});

test("groom 성공·실패와 forehead 상태를 구분해 파싱한다", () => {
  assert.deepEqual(parseArServerEvent({ type: "groom", status: "ok", groom: "" }), {
    type: "groom",
    status: "ok",
    groom: "",
    message: undefined,
  });
  assert.deepEqual(parseArServerEvent({ type: "groom", status: "error", message: "실패" }), {
    type: "groom",
    status: "error",
    groom: undefined,
    message: "실패",
  });
  for (const status of ["loading", "ok", "error"]) {
    assert.deepEqual(parseArServerEvent({ type: "forehead", status }), {
      type: "forehead",
      status,
      message: undefined,
    });
  }
});

test("지원하지 않는 상태·GAN 이벤트·잘못된 데이터는 무시한다", () => {
  for (const value of [
    null,
    [],
    { type: "livebank", status: "complete" },
    { type: "capture" },
    { type: "groom", status: "ok" },
    { type: "groom", status: "pending", groom: "style" },
    { type: "forehead", status: "done" },
  ]) {
    assert.equal(parseArServerEvent(value), null);
  }
});

test("중첩 이벤트와 stats의 숫자를 검증한다", () => {
  const result = parseArServerEvent({
    type: "stats",
    data: { head_pose: { yaw: "12.5", yaw_ema: Infinity, server_fps: 30 } },
  });
  assert.deepEqual(result, {
    type: "stats",
    data: { yaw: 12.5, yaw_ema: undefined, server_fps: 30, errors: undefined },
  });
  assert.deepEqual(
    parseArServerEvent({
      type: "forehead",
      payload: { status: "error", message: "이마 생성 실패" },
    }),
    { type: "forehead", status: "error", message: "이마 생성 실패" }
  );
});

test("텍스트·바이너리·Blob DataChannel과 잘못된 JSON을 구분한다", async () => {
  const event = { type: "groom", status: "ok", groom: "short-swept" };
  const text = JSON.stringify(event);
  const bytes = new TextEncoder().encode(text);
  for (const payload of [text, bytes, bytes.buffer, new Blob([text])]) {
    assert.deepEqual(await parseDataChannelPayload(payload), event);
  }
  await assert.rejects(parseDataChannelPayload("{"));
  await assert.rejects(parseDataChannelPayload({ type: "groom" }));
});
