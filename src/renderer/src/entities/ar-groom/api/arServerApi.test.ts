import { beforeEach, expect, test, vi } from "vitest";
import { ApiHttpError } from "@heddy/api";
import { requestArServerOffer } from "./arServerApi";

const mocks = vi.hoisted(() => ({ post: vi.fn() }));
vi.mock("@heddy/api", async importOriginal => ({
  ...(await importOriginal<typeof import("@heddy/api")>()),
  post: mocks.post,
}));

beforeEach(() => {
  mocks.post.mockReset();
  mocks.post.mockResolvedValue({ sdp: "server-sdp", type: "answer" });
});

test("SDP 객체의 toJSON과 별개로 x1 출력 크기를 일반 JSON 요청에 포함한다", async () => {
  const offer = {
    sdp: "camera-sdp",
    type: "offer" as const,
    toJSON: () => ({ sdp: "camera-sdp", type: "offer" }),
  };
  const signal = new AbortController().signal;
  const answer = await requestArServerOffer("/ar-server", offer, signal);
  expect(mocks.post).toHaveBeenCalledExactlyOnceWith(
    "/ar-server/offer",
    { sdp: "camera-sdp", type: "offer", out_size: "400x648" },
    { signal }
  );
  const body: unknown = mocks.post.mock.calls[0][1];
  expect(JSON.parse(JSON.stringify(body))).toEqual({
    sdp: "camera-sdp",
    type: "offer",
    out_size: "400x648",
  });
  expect(answer).toEqual({ sdp: "server-sdp", type: "answer" });
});

test("SDP가 없는 요청을 서버로 보내지 않는다", async () => {
  await expect(requestArServerOffer("/ar-server", { type: "offer" })).rejects.toThrow(
    "AR 연결 정보"
  );
  expect(mocks.post).not.toHaveBeenCalled();
});

test("잘못된 SDP 응답을 연결에 적용하지 않는다", async () => {
  mocks.post.mockResolvedValue({ sdp: "server-sdp", type: "offer" });
  await expect(
    requestArServerOffer("/ar-server", { sdp: "camera-sdp", type: "offer" })
  ).rejects.toThrow("AR 서버에 연결하지 못했습니다");
});

test("서버 오류의 상태 코드를 cause에 보존한다", async () => {
  const error = new ApiHttpError(503, null);
  mocks.post.mockRejectedValue(error);
  await expect(
    requestArServerOffer("/ar-server", { sdp: "camera-sdp", type: "offer" })
  ).rejects.toMatchObject({ cause: error });
});
