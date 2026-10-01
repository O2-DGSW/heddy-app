import { X509Certificate } from "node:crypto";
import { readFileSync } from "node:fs";
import { isIP } from "node:net";

interface ArServerTrustOptions {
  serverUrl?: string;
  certificateFile?: string;
}

export interface ArServerTrustConfig {
  origin: string;
  certificate: string;
  validFrom: number;
  validUntil: number;
}

export const getArServerTrust = ({
  serverUrl,
  certificateFile,
}: ArServerTrustOptions): ArServerTrustConfig | undefined => {
  if (!certificateFile?.trim()) return undefined;
  if (!serverUrl?.trim()) {
    throw new Error("AR_SERVER_CERT_FILE을 사용하려면 VITE_AR_SERVER_URL이 필요합니다.");
  }

  const url = new URL(serverUrl.trim());
  if (url.protocol !== "https:" || url.username || url.password) {
    throw new Error("인증서를 고정할 AR 서버는 인증 정보가 없는 HTTPS 주소여야 합니다.");
  }

  const certificate = new X509Certificate(readFileSync(certificateFile.trim()));
  const hostname = url.hostname.replace(/^\[|\]$/g, "");
  const matchesHost = isIP(hostname)
    ? certificate.checkIP(hostname)
    : certificate.checkHost(hostname, { subject: "never" });
  if (!matchesHost) {
    throw new Error("AR 서버 주소가 승인된 인증서의 호스트와 일치하지 않습니다.");
  }

  const validFrom = Date.parse(certificate.validFrom) / 1000;
  const validUntil = Date.parse(certificate.validTo) / 1000;
  const now = Date.now() / 1000;
  if (now < validFrom || now >= validUntil) {
    throw new Error("승인된 AR 서버 인증서의 유효기간을 확인해 주세요.");
  }

  // 공개 인증서의 DER만 전달하며, 개인키나 로컬 파일 경로는 앱에 포함하지 않는다.
  return {
    origin: url.origin,
    certificate: certificate.raw.toString("base64"),
    validFrom,
    validUntil,
  };
};
