import type { BaseAccountForm, Carrier } from '@/features/auth/signup/model/types';

export interface SmsVerificationState {
  isSent: boolean;
  isVerified: boolean;
  isSending: boolean;
  isVerifying: boolean;
  smsError: string | null;
  onSendCode: () => void;
  onVerifyCode: () => void;
}

export interface AccountFormFieldsProps {
  form: BaseAccountForm;
  showPasswordError: boolean;
  showPhoneError: boolean;
  showNameError?: boolean;
  canRequestVerification: boolean;
  nameLabel?: string;
  smsVerification: SmsVerificationState;
  onChange: (form: BaseAccountForm) => void;
}

export interface PasswordFieldsProps {
  password: string;
  passwordConfirm: string;
  showError?: boolean;
  onPasswordChange: (value: string) => void;
  onPasswordConfirmChange: (value: string) => void;
}

export interface PhoneVerificationFieldProps {
  carrier: Carrier;
  phone: string;
  verificationCode: string;
  canRequestVerification: boolean;
  showPhoneError?: boolean;
  smsVerification: SmsVerificationState;
  onCarrierChange: (carrier: Carrier) => void;
  onPhoneChange: (value: string) => void;
  onVerificationCodeChange: (value: string) => void;
}