import { font, lightTheme } from "@heddy/design-tokens";
import { useNavigate } from "react-router-dom";
import {
  useSignup,
  SignupTypeSelect,
  TermsAgreement,
  CustomerAccountForm,
  OwnerAccountForm,
  ShopForm,
} from "@/features/auth/signup";
import { STEP_TITLE } from "@/features/auth/signup/constants/signup";
import { LoadingScreen } from "@/shared/ui/loading";

export const SignupPage = () => {
  const navigate = useNavigate();
  const {
    step,
    memberType,
    customerForm,
    setCustomerForm,
    ownerForm,
    setOwnerForm,
    shopForm,
    setShopForm,
    selectMemberType,
    nextStep,
    submitSignup,
    isLoading,
    error,
  } = useSignup();

  if (isLoading) {
    return <LoadingScreen onComplete={() => navigate("/login")} />;
  }

  return (
    <div
      className="h-full overflow-y-auto flex flex-col items-center px-6 pt-4"
      style={{ backgroundColor: lightTheme.background.normal }}
    >
      <div className="flex flex-col items-center gap-2 mb-8">
        <img src="/heddyIcon.svg" alt="heddy" className="w-50" />
        <p className={font.body.medium} style={{ color: lightTheme.label.assistive }}>
          {STEP_TITLE[step]}
        </p>
      </div>

      {step === "type-select" && <SignupTypeSelect onSelect={selectMemberType} />}

      {step === "terms" && (
        <>
          <TermsAgreement onSignup={submitSignup} />
          {error && (
            <p
              className={`${font.caption.regular} mt-2 text-center`}
              style={{ color: lightTheme.status.error }}
            >
              {error}
            </p>
          )}
        </>
      )}

      {step === "account" && memberType === "customer" && (
        <CustomerAccountForm form={customerForm} onChange={setCustomerForm} onNext={nextStep} />
      )}

      {step === "account" && memberType === "owner" && (
        <OwnerAccountForm form={ownerForm} onChange={setOwnerForm} onNext={nextStep} />
      )}

      {step === "shop" && <ShopForm form={shopForm} onChange={setShopForm} onNext={nextStep} />}
    </div>
  );
};
