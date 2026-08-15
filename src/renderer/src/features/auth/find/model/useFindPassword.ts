import { useState } from "react";
import { formatPhone } from "@/shared/utils/formatPhone";
import type { Carrier } from "@/features/auth/signup/model/types";
import { MAIN_CARRIERS } from "@/features/auth/signup/constants/signup";

export const useFindPassword = () => {
  const [id, setId] = useState("");
  const [carrier, setCarrier] = useState<Carrier>(MAIN_CARRIERS[0]);
  const [phone, setPhone] = useState("");
  const [verificationCode, setVerificationCode] = useState("");

  const canRequestVerification = phone.length >= 13;
  const canSubmit = id.length > 0 && phone.length >= 13 && verificationCode.length > 0;

  const handlePhoneChange = (value: string) => {
    setPhone(formatPhone(value));
  };

  return {
    idField: { value: id, onChange: setId },
    carrierField: { value: carrier, onChange: setCarrier },
    phoneField: { value: phone, onChange: handlePhoneChange, canRequest: canRequestVerification },
    verificationField: { value: verificationCode, onChange: setVerificationCode },
    canSubmit,
  };
};
