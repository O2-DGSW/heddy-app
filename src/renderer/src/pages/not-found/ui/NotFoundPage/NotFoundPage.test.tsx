// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, describe, expect, test } from "vitest";

import NotFoundPage from ".";

describe("NotFoundPage", () => {
  afterEach(cleanup);

  test("안내를 보여 주고 처음 화면으로 보낸다", () => {
    render(
      <MemoryRouter initialEntries={["/nowhere"]}>
        <Routes>
          <Route path="/" element={<p>처음 화면</p>} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByRole("heading", { name: "페이지를 찾을 수 없어요" })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "처음 화면으로" }));
    expect(screen.getByText("처음 화면")).toBeTruthy();
  });
});
