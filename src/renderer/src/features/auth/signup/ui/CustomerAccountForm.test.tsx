// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, test, vi } from "vitest";

vi.mock("@/entities/auth", async importOriginal => ({
  ...(await importOriginal<typeof import("@/entities/auth")>()),
  useSmsVerification: () => ({
    isSent: false,
    isVerified: true,
    isSending: false,
    isVerifying: false,
    smsError: null,
    sendCode: vi.fn(),
    verifyCode: vi.fn(),
  }),
}));

import { CustomerAccountForm } from "./CustomerAccountForm";

import type { CustomerAccountForm as CustomerAccountFormType } from "../model/signup.types";

const FORM: CustomerAccountFormType = {
  id: "heddy@example.com",
  password: "1234",
  passwordConfirm: "1234",
  name: "헤디",
  carrier: "SKT",
  phone: "010-1234-5678",
  verificationCode: "123456",
  hairProfile: {
    hairLength: "SHORT",
    hairCondition: "HEALTHY",
    hairType: "STRAIGHT",
    hairThickness: "THIN",
  },
  agreements: {
    terms_of_service: true,
    privacy_policy: true,
    ai_training: false,
    service_analytics: false,
    marketing_notification: false,
  },
};

const renderForm = (props: Partial<Parameters<typeof CustomerAccountForm>[0]> = {}) => {
  const onSubmit = vi.fn();

  render(
    <MemoryRouter>
      <CustomerAccountForm
        form={FORM}
        isLoading={false}
        onChange={vi.fn()}
        onSubmit={onSubmit}
        {...props}
      />
    </MemoryRouter>
  );

  return onSubmit;
};

describe("CustomerAccountForm", () => {
  afterEach(cleanup);

  test("비밀번호 4자리로 가입하면 이유를 칸 아래에 보여 주고 그 칸으로 포커스를 옮긴다", () => {
    window.HTMLElement.prototype.scrollIntoView = vi.fn();
    const onSubmit = renderForm();

    fireEvent.click(screen.getByRole("button", { name: "회원가입" }));

    expect(screen.getByText("비밀번호는 8자 이상이어야 합니다. (현재 4자)")).toBeTruthy();
    expect(document.activeElement).toBe(screen.getByLabelText("비밀번호"));
    expect(onSubmit).not.toHaveBeenCalled();
  });

  test("서버가 거부한 칸은 그 값이 그대로인 동안 칸 아래에 문구를 보여 준다", () => {
    window.HTMLElement.prototype.scrollIntoView = vi.fn();
    renderForm({
      form: { ...FORM, password: "12345678", passwordConfirm: "12345678", name: "가".repeat(30) },
      serverFieldErrors: {
        nickname: { message: "닉네임은 30자 이하여야 합니다.", value: "가".repeat(30) },
      },
    });

    expect(screen.getByText("닉네임은 30자 이하여야 합니다.")).toBeTruthy();
    expect(document.activeElement).toBe(screen.getByLabelText("닉네임"));
  });
});
