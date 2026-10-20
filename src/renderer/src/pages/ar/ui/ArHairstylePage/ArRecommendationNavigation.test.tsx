// @vitest-environment jsdom
import { StrictMode } from "react";
import type { ReactNode } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { MemoryRouter, Route, Routes, useNavigate } from "react-router-dom";

import type { ArHairstyleOption } from "@/entities/ar-groom";
import { RecommendResultSection } from "@/features/recommend";
import ArHairstylePage from ".";

const mocks = vi.hoisted(() => ({
  getGrooms: vi.fn(),
  connect: vi.fn(),
  toast: vi.fn(),
}));

vi.mock("@capgo/capacitor-transitions/react", () => ({ setupPage: () => () => {} }));
vi.mock("@/entities/ar-groom", async importOriginal => ({
  ...(await importOriginal<typeof import("@/entities/ar-groom")>()),
  useGetArGrooms: mocks.getGrooms,
}));
vi.mock("@/features/ar-session", () => ({ useArServerConnection: mocks.connect }));
vi.mock("@/shared", async importOriginal => ({
  ...(await importOriginal<typeof import("@/shared")>()),
  showInfoToast: mocks.toast,
}));
vi.mock("@/features/ar-preview", async importOriginal => ({
  ...(await importOriginal<typeof import("@/features/ar-preview")>()),
  ArCameraViewport: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  ArHairstyleCarousel: ({ onSelect }: { onSelect: (position: number) => void }) => (
    <button type="button" onClick={() => onSelect(1)}>
      다른 헤어 직접 선택
    </button>
  ),
}));
vi.mock("../ArControlBar", () => ({
  default: ({ selectedHairstyleLabel }: { selectedHairstyleLabel: string }) => (
    <output aria-label="선택한 헤어">{selectedHairstyleLabel}</output>
  ),
}));
vi.mock("../ArHairstyleBrowser", () => ({ default: () => null }));
vi.mock("../ArStatusNotice", () => ({ default: () => null }));
vi.mock("../ArConnectionLoader", () => ({ default: () => null }));

const LEAF_ID = "10000000-0000-4000-8000-000000000001";
const HIPPIE_ID = "10000000-0000-4000-8000-000000000002";
const options: ArHairstyleOption[] = [
  { name: "leaf-cut", label: "리프컷" },
  { name: "hippie-perm", label: "히피펌" },
];
const recommendations = options.map((option, index) => ({
  id: index === 0 ? LEAF_ID : HIPPIE_ID,
  arGroomName: option.name,
  thumbnailUrl: "",
  styleName: option.label,
  reasonType: null,
  riskLevel: null,
  reasonDescriptions: [],
  referenceRecordLabel: "",
}));
const loadedGrooms = { data: options, isPending: false, error: null, refetch: vi.fn() };
const connection = {
  connectionStatus: "connected",
  controlReady: true,
  isPreviewMirrored: false,
  groomState: { status: "idle" },
  foreheadState: { status: "idle" },
  handleGroomColorReset: vi.fn(),
  handlePageEnter: vi.fn(),
  handlePageLeave: vi.fn(),
};

const NavigationControls = () => {
  const navigate = useNavigate();
  return (
    <button type="button" onClick={() => navigate("/ar?groom=leaf-cut")}>
      같은 추천 다시 열기
    </button>
  );
};

const TestApp = ({ initialEntry = "/recommend" }: { initialEntry?: string }) => (
  <StrictMode>
    <MemoryRouter initialEntries={[initialEntry]}>
      <NavigationControls />
      <Routes>
        <Route
          path="/recommend"
          element={<RecommendResultSection recommendations={recommendations} />}
        />
        <Route path="/ar" element={<ArHairstylePage />} />
      </Routes>
    </MemoryRouter>
  </StrictMode>
);

beforeEach(() => {
  mocks.getGrooms.mockReturnValue(loadedGrooms);
  mocks.connect.mockReturnValue(connection);
  mocks.toast.mockClear();
  mocks.connect.mockClear();
});
afterEach(cleanup);

test.each([
  { rank: 0, expectedGroom: "leaf-cut", expectedLabel: "리프컷" },
  { rank: 1, expectedGroom: "hippie-perm", expectedLabel: "히피펌" },
])(
  "추천 $expectedLabel 카드를 누르면 해당 groom으로 AR에 진입한다",
  ({ rank, expectedGroom, expectedLabel }) => {
    render(<TestApp />);
    fireEvent.click(screen.getAllByRole("button", { name: "AR로 체험" })[rank]);
    expect(screen.getByLabelText("선택한 헤어").textContent).toBe(expectedLabel);
    expect(mocks.connect.mock.lastCall?.[1]).toBe(expectedGroom);
    expect(
      mocks.connect.mock.calls.some(call => call[1] === LEAF_ID || call[1] === HIPPIE_ID)
    ).toBe(false);
  }
);

test("서버 목록이 늦게 도착해도 연결 준비 전에 추천 헤어를 선택한다", () => {
  mocks.getGrooms.mockReturnValue({ ...loadedGrooms, data: undefined, isPending: true });
  mocks.connect.mockReturnValue({ ...connection, controlReady: false });
  const entry = "/ar?groom=leaf-cut";
  const view = render(<TestApp initialEntry={entry} />);
  expect(mocks.connect.mock.lastCall?.[1]).toBe("");
  expect(mocks.toast).not.toHaveBeenCalled();

  mocks.getGrooms.mockReturnValue(loadedGrooms);
  view.rerender(<TestApp initialEntry={entry} />);
  expect(mocks.connect.mock.lastCall?.[1]).toBe("leaf-cut");

  mocks.connect.mockReturnValue(connection);
  view.rerender(<TestApp initialEntry={entry} />);
  expect(screen.getByLabelText("선택한 헤어").textContent).toBe("리프컷");
});

test("추천 적용 후 직접 선택한 헤어를 재렌더링으로 되돌리지 않는다", () => {
  const entry = "/ar?groom=leaf-cut";
  const view = render(<TestApp initialEntry={entry} />);
  fireEvent.click(screen.getByRole("button", { name: "다른 헤어 직접 선택" }));
  expect(screen.getByLabelText("선택한 헤어").textContent).toBe("히피펌");

  mocks.getGrooms.mockReturnValue({ ...loadedGrooms, data: [...options] });
  view.rerender(<TestApp initialEntry={entry} />);
  expect(screen.getByLabelText("선택한 헤어").textContent).toBe("히피펌");

  fireEvent.click(screen.getByRole("button", { name: "같은 추천 다시 열기" }));
  expect(screen.getByLabelText("선택한 헤어").textContent).toBe("리프컷");
});

test("등록되지 않은 groom은 원본을 유지하고 한 번만 안내한다", () => {
  const entry = "/ar?groom=unknown";
  const view = render(<TestApp initialEntry={entry} />);
  expect(screen.getByLabelText("선택한 헤어").textContent).toBe("원본 스타일");
  expect(mocks.connect.mock.lastCall?.[1]).toBe("");
  expect(mocks.toast).toHaveBeenCalledTimes(1);

  view.rerender(<TestApp initialEntry={entry} />);
  expect(mocks.toast).toHaveBeenCalledTimes(1);
});

test("목록 조회 실패를 미등록 스타일로 오인하지 않고 재조회 성공 후 선택한다", () => {
  mocks.getGrooms.mockReturnValue({
    ...loadedGrooms,
    data: undefined,
    error: new Error("목록 오류"),
  });
  const entry = "/ar?groom=leaf-cut";
  const view = render(<TestApp initialEntry={entry} />);
  expect(mocks.toast).not.toHaveBeenCalled();

  mocks.getGrooms.mockReturnValue(loadedGrooms);
  view.rerender(<TestApp initialEntry={entry} />);
  expect(screen.getByLabelText("선택한 헤어").textContent).toBe("리프컷");
});

test("일반 AR 진입은 기존 원본 선택을 유지한다", () => {
  render(<TestApp initialEntry="/ar" />);
  expect(screen.getByLabelText("선택한 헤어").textContent).toBe("원본 스타일");
  expect(mocks.toast).not.toHaveBeenCalled();
});

test.each([undefined, "../../unknown"])(
  "명시적인 groom 매핑이 없거나 잘못되면 AR 버튼을 비활성화한다: %s",
  arGroomName => {
    render(
      <MemoryRouter>
        <RecommendResultSection recommendations={[{ ...recommendations[0], arGroomName }]} />
      </MemoryRouter>
    );
    const button = screen.getByRole("button", { name: "AR 미지원" });
    expect(button.hasAttribute("disabled")).toBe(true);
    fireEvent.click(button);
    expect(mocks.connect).not.toHaveBeenCalled();
  }
);
