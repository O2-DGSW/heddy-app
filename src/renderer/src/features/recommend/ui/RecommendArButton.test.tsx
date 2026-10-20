// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { RecommendArButton } from "./RecommendArButton";
const navigate = vi.hoisted(() => vi.fn());
vi.mock("react-router-dom", () => ({ useNavigate: () => navigate }));
afterEach(() => {
  cleanup();
  navigate.mockClear();
});
it("선택한 추천의 정확한 groom을 전달한다", () => {
  render(<RecommendArButton groomName="guile-cut" />);
  fireEvent.click(screen.getByRole("button"));
  expect(navigate).toHaveBeenCalledWith("/ar?groom=guile-cut");
});
it.each([null, "", "../secret", "not a groom"])(
  "매핑이 없거나 잘못되면 다른 스타일로 이동하지 않는다: %s",
  groomName => {
    render(<RecommendArButton groomName={groomName} />);
    fireEvent.click(screen.getByRole("button"));
    expect(screen.getByRole("button").hasAttribute("disabled")).toBe(true);
    expect(navigate).not.toHaveBeenCalled();
  }
);
