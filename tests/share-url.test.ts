import assert from "node:assert/strict";
import { test } from "node:test";

import { toWebShareUrl } from "../src/renderer/src/shared/lib/share/toWebShareUrl.ts";

test("/mobile 없이 온 공유 링크에 /mobile을 붙인다", () => {
  assert.equal(toWebShareUrl("https://heddy.site/s/abc123"), "https://heddy.site/mobile/s/abc123");
});

test("이미 /mobile이 있으면 그대로 둔다", () => {
  assert.equal(
    toWebShareUrl("https://heddy.site/mobile/s/abc123"),
    "https://heddy.site/mobile/s/abc123"
  );
});

test("서버가 준 호스트와 쿼리는 유지하고 경로만 바꾼다", () => {
  assert.equal(
    toWebShareUrl("https://example.test/s/abc-123_XYZ?from=qr"),
    "https://example.test/mobile/s/abc-123_XYZ?from=qr"
  );
});

test("끝에 슬래시가 있어도 토큰을 찾는다", () => {
  assert.equal(toWebShareUrl("https://heddy.site/s/abc123/"), "https://heddy.site/mobile/s/abc123");
});

test("공유 경로가 아니거나 URL이 아니면 건드리지 않는다", () => {
  assert.equal(toWebShareUrl("https://heddy.site/home"), "https://heddy.site/home");
  assert.equal(toWebShareUrl("not a url"), "not a url");
});
