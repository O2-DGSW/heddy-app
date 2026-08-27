import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { setAuthTokens, signupApi } from "@/entities/auth";
import { queryClient } from "@/app/queryClient";
import type { CustomerAccountForm } from "./types";

const INITIAL_ACCOUNT_FORM: CustomerAccountForm = {
  id: "",
  password: "",
  passwordConfirm: "",
  name: "",
  carrier: "SKT",
  phone: "",
  verificationCode: "",
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
    setIsLoading(true);
    setError(null);

    try {
      const { tokens } = await signupApi({
        email: customerForm.id.trim(),
        password: customerForm.password,
        nickname: customerForm.name.trim(),
        phone_number: customerForm.phone.replace(/\D/g, ""),
        agreements: customerForm.agreements,
      });

      await setAuthTokens({
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
      });
      queryClient.clear();
      navigate("/");
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
