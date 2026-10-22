// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, test, vi } from "vitest";

import HomeHeader from "./HomeHeader";

afterEach(cleanup);

const setup = () => {
  const onProfileClick = vi.fn();
  const onArClick = vi.fn();
  const view = render(
    <>
      <HomeHeader profileName="heddy" onProfileClick={onProfileClick} onArClick={onArClick} />
      <div onPointerDown={event => event.stopPropagation()}>헤더 바깥 영역</div>
    </>
  );
  const notificationButton = screen.getByRole("button", { name: "알림" });
  fireEvent.click(notificationButton);
  return { ...view, notificationButton, onProfileClick, onArClick };
};

test("알림 팝업 내부를 누르면 유지하고 알림 버튼을 다시 누르면 닫는다", () => {
  const { notificationButton } = setup();
  expect(notificationButton.getAttribute("aria-expanded")).toBe("true");
  fireEvent.pointerDown(screen.getByRole("status"));
  expect(screen.getByRole("status")).toBeTruthy();

  const icon = notificationButton.querySelector("img");
  if (!icon) throw new Error("알림 아이콘이 없습니다.");
  fireEvent.pointerDown(icon);
  fireEvent.click(icon);
  expect(screen.queryByRole("status")).toBeNull();
  expect(notificationButton.getAttribute("aria-expanded")).toBe("false");
});

test("바깥 영역의 이벤트 전파가 중단되어도 알림을 닫고 다시 열 수 있다", () => {
  const { notificationButton } = setup();
  fireEvent.pointerDown(screen.getByText("헤더 바깥 영역"));
  expect(screen.queryByRole("status")).toBeNull();
  expect(notificationButton.getAttribute("aria-expanded")).toBe("false");

  fireEvent.click(notificationButton);
  expect(screen.getByRole("status")).toBeTruthy();
});

test.each(["프로필로 이동", "AR로 미리보기"])(
  "%s 버튼을 누르면 알림을 닫으면서 해당 버튼도 작동한다",
  name => {
    const { onProfileClick, onArClick } = setup();
    const button = screen.getByRole("button", { name });
    fireEvent.pointerDown(button);
    fireEvent.click(button);
    expect(screen.queryByRole("status")).toBeNull();
    expect(name === "프로필로 이동" ? onProfileClick : onArClick).toHaveBeenCalledTimes(1);
  }
);

test("Escape로 닫으면 알림 버튼으로 포커스를 돌려준다", () => {
  const { notificationButton } = setup();
  fireEvent.keyDown(document, { key: "Enter" });
  expect(screen.getByRole("status")).toBeTruthy();
  fireEvent.keyDown(document, { key: "Escape" });
  expect(screen.queryByRole("status")).toBeNull();
  expect(notificationButton.getAttribute("aria-expanded")).toBe("false");
  expect(document.activeElement).toBe(notificationButton);
});

test("팝업이 열린 상태로 화면을 떠나면 전역 이벤트 리스너를 해제한다", () => {
  const add = vi.spyOn(document, "addEventListener");
  const remove = vi.spyOn(document, "removeEventListener");
  const { unmount } = setup();
  const pointerListener = add.mock.calls.find(([name]) => name === "pointerdown")?.[1];
  const keyListener = add.mock.calls.find(([name]) => name === "keydown")?.[1];
  expect(pointerListener).toBeTypeOf("function");
  expect(keyListener).toBeTypeOf("function");
  unmount();
  expect(remove).toHaveBeenCalledWith("pointerdown", pointerListener, true);
  expect(remove).toHaveBeenCalledWith("keydown", keyListener);
});
