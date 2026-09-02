// VITE_ 접두사 환경변수는 클라이언트 번들에 포함되므로 사용하지 않는다.
// AR 서버 주소는 Vercel 서버에서만 읽는 환경변수로 관리한다.
const arServerOrigin = process.env.AR_SERVER_ORIGIN?.trim().replace(/\/$/, "");

const arServerRewrites = arServerOrigin
  ? [
      { source: "/ar-server", destination: arServerOrigin },
      { source: "/ar-server/:path*", destination: `${arServerOrigin}/:path*` },
    ]
  : [];

export const config = {
  rewrites: [
    ...arServerRewrites,
    { source: "/((?!ar-server/|assets/|favicon|font/).*)", destination: "/index.html" },
  ],
};
