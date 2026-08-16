import { useState } from "react";
import { formatPhone } from "@/shared/utils/formatPhone";

export const useFindId = () => {
  const [phone, setPhone] = useState("");
  const [verificationCode, setVerificationCode] = useState("");

  const canRequestVerification = phone.length >= 13;
  const canSubmit = phone.length >= 13 && verificationCode.length > 0;

  const handlePhoneChange = (value: string) => {
    setPhone(formatPhone(value));
  };

  return {
    phone,
    verificationCode,
    canRequestVerification,
    canSubmit,
    handlePhoneChange,
    setVerificationCode,
  };
};
