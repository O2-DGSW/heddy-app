import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signupApi } from "@/entities/auth/api/authApi";
import type { MemberType, SignupStep, CustomerAccountForm } from "./types";

const INITIAL_ACCOUNT_FORM = {
  id: "",
  password: "",
  passwordConfirm: "",
  name: "",
  carrier: "SKT" as const,
  phone: "",
  verificationCode: "",
};

export const useSignup = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<SignupStep>("type-select");
  const [memberType, setMemberType] = useState<MemberType | null>(null);
  const [customerForm, setCustomerForm] = useState<CustomerAccountForm>({
    ...INITIAL_ACCOUNT_FORM,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectMemberType = (type: MemberType) => {
    setMemberType(type);
    setStep("account");
  };

  const nextStep = () => {
    if (step === "account" && memberType === "owner") setStep("shop");
    else if (step === "account") setStep("terms");
    else if (step === "shop") setStep("terms");
  };

  const submitSignup = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await signupApi({
        loginId: customerForm.id,
        password: customerForm.password,
        name: customerForm.name,
        phoneNumber: customerForm.phone.replace(/\D/g, ""),
      });
      navigate("/login");
    } catch (err) {
      setError(err instanceof Error ? err.message : "회원가입에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    customerForm,
    setCustomerForm,
    selectMemberType,
    nextStep,
    submitSignup,
    isLoading,
    error,
  };
};
