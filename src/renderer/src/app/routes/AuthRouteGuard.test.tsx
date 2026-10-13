// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, describe, expect, test, vi } from "vitest";

const { restoreAuthSession } = vi.hoisted(() => ({ restoreAuthSession: vi.fn() }));

vi.mock("@/entities/auth", () => ({ restoreAuthSession }));

import { RequireAuth, RequireGuest } from "./AuthRouteGuard";

const renderAt = (path: string) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route element={<RequireAuth />}>
          <Route path="/home" element={<p>홈 화면</p>} />
        </Route>
        <Route element={<RequireGuest />}>
          <Route path="/login" element={<p>로그인 화면</p>} />
        </Route>
        <Route path="/welcome" element={<p>웰컴 화면</p>} />
      </Routes>
    </MemoryRouter>
  );

afterEach(() => {
  cleanup();
});

describe("RequireAuth", () => {
  test("로그인 상태면 화면을 보여준다", async () => {
    restoreAuthSession.mockResolvedValue(true);
    renderAt("/home");

    expect(await screen.findByText("홈 화면")).toBeTruthy();
  });

  test("로그아웃 상태면 웰컴 화면으로 보낸다", async () => {
    restoreAuthSession.mockResolvedValue(false);
    renderAt("/home");

    expect(await screen.findByText("웰컴 화면")).toBeTruthy();
    expect(screen.queryByText("홈 화면")).toBeNull();
  });
});

describe("RequireGuest", () => {
  test("이미 로그인했으면 로그인 화면 대신 홈으로 보낸다", async () => {
    restoreAuthSession.mockResolvedValue(true);
    renderAt("/login");

    expect(await screen.findByText("홈 화면")).toBeTruthy();
  });

  test("로그아웃 상태면 로그인 화면을 보여준다", async () => {
    restoreAuthSession.mockResolvedValue(false);
    renderAt("/login");

    expect(await screen.findByText("로그인 화면")).toBeTruthy();
  });
});
