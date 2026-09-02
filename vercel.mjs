const arServerUrl = process.env.VITE_AR_SERVER_URL?.trim().replace(/\/$/, "");

if (!arServerUrl) {
  throw new Error("VITE_AR_SERVER_URL 환경변수가 필요합니다.");
}

export const config = {
  rewrites: [
    { source: "/ar-server", destination: arServerUrl },
    { source: "/ar-server/:path*", destination: `${arServerUrl}/:path*` },
    { source: "/((?!ar-server/|assets/|favicon|font/).*)", destination: "/index.html" },
  ],
};
