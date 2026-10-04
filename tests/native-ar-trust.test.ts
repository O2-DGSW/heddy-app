import assert from "node:assert/strict";
import { X509Certificate } from "node:crypto";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

import { getArServerTrust } from "../config/arServerTrust.ts";

const certificateFile = fileURLToPath(
  new URL("fixtures/ar-certificates/localhost.pem", import.meta.url)
);
const expiredCertificateFile = fileURLToPath(
  new URL("fixtures/ar-certificates/expired-localhost.pem", import.meta.url)
);

test("인증서 설정이 없으면 시스템 인증서 검증을 사용한다", () => {
  assert.equal(getArServerTrust({}), undefined);
  assert.equal(getArServerTrust({ certificateFile: " " }), undefined);
});

test("승인 인증서를 사용하는 경우 서버 주소가 필요하다", () => {
  assert.throws(() => getArServerTrust({ certificateFile }), /VITE_AR_SERVER_URL/);
});

test("HTTPS 외의 프로토콜과 인증 정보가 있는 주소를 거부한다", () => {
  for (const serverUrl of [
    "http://localhost",
    "ftp://localhost",
    "https://user:password@localhost",
  ]) {
    assert.throws(() => getArServerTrust({ certificateFile, serverUrl }), /HTTPS/);
  }
  assert.throws(() => getArServerTrust({ certificateFile, serverUrl: "invalid-url" }), TypeError);
});

test("네이티브 설정에는 서버 origin과 공개 인증서만 포함한다", () => {
  const trust = getArServerTrust({ certificateFile, serverUrl: "https://localhost:8443/ar/" });
  const certificate = new X509Certificate(readFileSync(certificateFile));
  assert.ok(trust);
  assert.equal(trust.origin, "https://localhost:8443");
  assert.deepEqual(Buffer.from(trust.certificate, "base64"), certificate.raw);
  assert.ok(trust.validFrom < Date.now() / 1000);
  assert.ok(trust.validUntil > Date.now() / 1000);
  assert.ok(!JSON.stringify(trust).includes(certificateFile));
  assert.ok(!JSON.stringify(trust).includes("PRIVATE KEY"));
});

test("IP 주소도 인증서 SAN에 등록된 경우에만 허용한다", () => {
  assert.equal(
    getArServerTrust({ certificateFile, serverUrl: "https://127.0.0.1:8443" })?.origin,
    "https://127.0.0.1:8443"
  );
  for (const serverUrl of ["https://127.0.0.2:8443", "https://unapproved.example.com"]) {
    assert.throws(() => getArServerTrust({ certificateFile, serverUrl }), /호스트와 일치/);
  }
});

test("만료된 인증서를 네이티브 앱에 포함하지 않는다", () => {
  assert.throws(
    () =>
      getArServerTrust({ certificateFile: expiredCertificateFile, serverUrl: "https://localhost" }),
    /유효기간/
  );
});

test("인증서 파일을 읽을 수 없으면 설정을 생략하지 않고 실패한다", () => {
  assert.throws(
    () =>
      getArServerTrust({
        certificateFile: `${certificateFile}.missing`,
        serverUrl: "https://localhost",
      }),
    { code: "ENOENT" }
  );
});

test("올바른 공개 인증서가 아닌 파일을 거부한다", () => {
  const directory = mkdtempSync(join(tmpdir(), "heddy-native-cert-"));
  const invalidCertificateFile = join(directory, "invalid.pem");
  try {
    writeFileSync(invalidCertificateFile, "not a certificate");
    assert.throws(() =>
      getArServerTrust({ certificateFile: invalidCertificateFile, serverUrl: "https://localhost" })
    );
  } finally {
    rmSync(directory, { recursive: true });
  }
});
