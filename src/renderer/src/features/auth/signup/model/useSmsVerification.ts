import { useState, useEffect } from "react";
import { smsSendApi, smsVerifyApi } from "@/entities/auth";
import type { SmsPurpose } from "@/entities/auth";

export const useSmsVerification = (purpose: SmsPurpose, phoneNumber?: string) => {
  const [isSent, setIsSent] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [smsError, setSmsError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    void Promise.resolve().then(() => {
      if (!isMounted) return;

      setIsSent(false);
      setIsVerified(false);
      setSmsError(null);
    });

    return () => {
      isMounted = false;
    };
  }, [phoneNumber]);

  const sendCode = async (phoneNumber: string, carrier: string) => {
    setIsSending(true);
    setSmsError(null);
    try {
      await smsSendApi({ phoneNumber: phoneNumber.replace(/\D/g, ""), carrier, purpose });
      setIsSent(true);
      setIsVerified(false);
    } catch (err) {
      setSmsError(err instanceof Error ? err.message : "인증번호 발송에 실패했습니다.");
    } finally {
      setIsSending(false);
    }
  };

  const verifyCode = async (phoneNumber: string, code: string) => {
    setIsVerifying(true);
    setSmsError(null);
    try {
      await smsVerifyApi({ phone_number: phoneNumber.replace(/\D/g, ""), code, purpose });
      setIsVerified(true);
    } catch (err) {
      setSmsError(err instanceof Error ? err.message : "인증번호가 올바르지 않습니다.");
    } finally {
      setIsVerifying(false);
    }
  };

  return { isSent, isVerified, isSending, isVerifying, smsError, sendCode, verifyCode };
};
