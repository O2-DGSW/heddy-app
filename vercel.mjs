const arServerOrigin = process.env.VITE_AR_SERVER_URL?.trim().replace(/\/$/, "");

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
