import { getApiFieldErrors } from "@heddy/api";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signupApi } from "@/entities/auth";
import { showSuccessToast } from "@/shared";
import { isRequiredSignupAgreementsAccepted, mapSignupFieldErrors } from "./validation";
import type { SignupServerFieldErrorsType } from "./useAccountForm";
import type { CustomerAccountForm } from "./signup.types";

const INITIAL_ACCOUNT_FORM: CustomerAccountForm = {
  id: "",
  password: "",
  passwordConfirm: "",
  name: "",
  carrier: "SKT",
  phone: "",
  verificationCode: "",
  hairProfile: {
    hairLength: "SHORT",
    hairCondition: "HEALTHY",
    hairType: "STRAIGHT",
    hairThickness: "THIN",
  },
  agreements: {
    terms_of_service: false,
    privacy_policy: false,
    ai_training: false,
    service_analytics: false,
    marketing_notification: false,
  },
};

export const useSignup = () => {
  const navigate = useNavigate();

  const [customerForm, setCustomerForm] = useState<CustomerAccountForm>({
    ...INITIAL_ACCOUNT_FORM,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [serverFieldErrors, setServerFieldErrors] = useState<SignupServerFieldErrorsType>({});

  const submitSignup = async () => {
    if (isLoading) {
      return;
    }

    if (!isRequiredSignupAgreementsAccepted(customerForm.agreements)) {
      setError("필수 약관에 동의해주세요.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setServerFieldErrors({});

    // 서버가 칸별 오류를 주면 어느 값을 거부했는지 함께 기억해, 사용자가 그 칸을 고치면 문구를 지운다
    const submittedValues = {
      email: customerForm.id.trim(),
      password: customerForm.password,
      nickname: customerForm.name.trim(),
    };

    try {
      await signupApi({
        email: submittedValues.email,
        password: submittedValues.password,
        nickname: submittedValues.nickname,
        agreements: customerForm.agreements,
        hair_profile: {
          hair_type: customerForm.hairProfile.hairType,
          hair_condition: customerForm.hairProfile.hairCondition,
          hair_length: customerForm.hairProfile.hairLength,
          hair_thickness: customerForm.hairProfile.hairThickness,
          available_care_time_minutes: 0,
        },
      });

      showSuccessToast("가입이 완료됐습니다. 로그인해 주세요.");
      navigate("/login", { replace: true });
    } catch (err) {
      const fieldErrors = getApiFieldErrors(err);
      const fieldMessages = mapSignupFieldErrors(fieldErrors);
      const nextServerFieldErrors: SignupServerFieldErrorsType = {};

      for (const field of ["email", "password", "nickname"] as const) {
        const message = fieldMessages[field];

        if (message) {
          nextServerFieldErrors[field] = { message, value: submittedValues[field] };
        }
      }

      setServerFieldErrors(nextServerFieldErrors);

      const hasUnmappedFieldError = fieldErrors.length > Object.keys(nextServerFieldErrors).length;

      // 칸에 붙인 오류만 있으면 하단의 "필드 검증에 실패했습니다." 같은 공통 문구는 띄우지 않는다
      if (Object.keys(nextServerFieldErrors).length === 0 || hasUnmappedFieldError) {
        setError(err instanceof Error ? err.message : "회원가입에 실패했습니다.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return {
    customerForm,
    setCustomerForm,
    submitSignup,
    isLoading,
    error,
    serverFieldErrors,
  };
};
