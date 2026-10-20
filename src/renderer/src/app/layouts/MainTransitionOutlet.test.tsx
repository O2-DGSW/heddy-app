// @vitest-environment jsdom
import { setDirection } from "@capgo/capacitor-transitions/react";
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { BrowserRouter, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { NavBar } from "@/widgets/nav-bar";

import { MainTransitionOutlet } from "./MainTransitionOutlet";

const PATHS = ["/home", "/cuts", "/ar", "/recommend", "/profile", "/profile/edit"];
const LABELS = ["홈", "기록", "AR", "추천", "프로필"];
const animate = vi.fn(() => ({ finished: Promise.resolve(), cancel: vi.fn() }));

const TestPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <cap-page key={location.pathname}>
      <h1>{location.pathname}</h1>
      <button type="button" onClick={() => navigate("/profile/edit")}>
        상세로 이동
      </button>
      <button type="button" onClick={() => navigate(-1)}>
        뒤로가기
      </button>
    </cap-page>
  );
};

const renderNavigation = (path = "/home") => {
  window.history.replaceState(null, "", path);

  return render(
    <BrowserRouter>
      <Routes>
        <Route element={<MainTransitionOutlet />}>
          {PATHS.map(route => (
            <Route key={route} path={route} element={<TestPage />} />
          ))}
        </Route>
      </Routes>
      <NavBar />
    </BrowserRouter>
  );
};

const expectCurrentPage = async (path: string, pageCount: number) => {
  await waitFor(() => {
    expect(window.location.pathname).toBe(path);
    expect(screen.getByRole("heading", { name: path })).toBeTruthy();
    expect(document.querySelectorAll("cap-router-outlet > cap-page")).toHaveLength(pageCount);
  });
};

beforeEach(() => {
  animate.mockReset().mockImplementation(() => ({ finished: Promise.resolve(), cancel: vi.fn() }));
  // jsdom에는 Web Animations가 없으므로 상세 화면의 정상 전환만 즉시 완료한다.
  Object.defineProperty(Element.prototype, "animate", {
    configurable: true,
    value: animate,
  });
});

afterEach(() => {
  cleanup();
  Reflect.deleteProperty(Element.prototype, "animate");
});

describe("하단 탭과 화면 전환 연동", () => {
  test("방문했던 탭을 반복해서 눌러도 마지막 선택 화면만 표시하고 이전 DOM을 정리한다", async () => {
    renderNavigation();

    for (const index of [1, 3, 4, 0, 2, 1, 0, 4, 3, 0]) {
      await act(async () => {
        fireEvent.click(screen.getByRole("button", { name: LABELS[index] }));
      });
      await expectCurrentPage(PATHS[index], 1);
      expect(screen.getByRole("button", { name: LABELS[index] }).getAttribute("aria-current")).toBe(
        "page"
      );
    }

    expect(animate).not.toHaveBeenCalled();
  });

  test("현재 탭 연속 클릭은 이력과 다음 화면의 전환 의도를 변경하지 않는다", async () => {
    renderNavigation();
    const historyLength = window.history.length;

    fireEvent.click(screen.getByRole("button", { name: "홈" }));
    fireEvent.click(screen.getByRole("button", { name: "홈" }));

    expect(window.history.length).toBe(historyLength);
    expect(
      document.querySelector("cap-router-outlet")?.getAttribute("data-navigation-action")
    ).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "상세로 이동" }));
    await expectCurrentPage("/profile/edit", 2);
    expect(animate).toHaveBeenCalled();
  });

  test("상세 화면에서 선택된 탭을 누르면 해당 탭의 시작 화면으로 이동한다", async () => {
    renderNavigation("/profile/edit");
    setDirection("back");

    fireEvent.click(screen.getByRole("button", { name: "프로필" }));

    await expectCurrentPage("/profile", 1);
    expect(animate).not.toHaveBeenCalled();
  });

  test("탭 이동 이후 상세 화면 진입과 뒤로가기는 유지한다", async () => {
    renderNavigation();
    fireEvent.click(screen.getByRole("button", { name: "프로필" }));
    await expectCurrentPage("/profile", 1);

    fireEvent.click(screen.getByRole("button", { name: "상세로 이동" }));
    await expectCurrentPage("/profile/edit", 2);
    fireEvent.click(screen.getByRole("button", { name: "뒤로가기" }));
    await expectCurrentPage("/profile", 1);
  });

  test("상세 화면 전환 도중 탭을 누르면 취소된 전환이 이전 화면을 다시 표시하지 않는다", async () => {
    renderNavigation();
    animate.mockImplementation(() => {
      let finish: (() => void) | undefined;
      const finished = new Promise<void>(resolve => {
        finish = resolve;
      });

      return { finished, cancel: vi.fn(() => finish?.()) };
    });

    fireEvent.click(screen.getByRole("button", { name: "상세로 이동" }));
    await waitFor(() => expect(animate).toHaveBeenCalled());
    fireEvent.click(screen.getByRole("button", { name: "기록" }));

    await expectCurrentPage("/cuts", 1);
    expect(screen.queryByRole("heading", { name: "/profile/edit" })).toBeNull();
  });
});
