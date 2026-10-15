import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signupApi } from "@/entities/auth";
import { showSuccessToast } from "@/shared";
import { isRequiredSignupAgreementsAccepted } from "./validation";
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

    try {
      await signupApi({
        email: customerForm.id.trim(),
        password: customerForm.password,
        nickname: customerForm.name.trim(),
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
      setError(err instanceof Error ? err.message : "회원가입에 실패했습니다.");
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
  };
};
