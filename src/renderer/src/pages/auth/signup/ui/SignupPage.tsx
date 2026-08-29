import { font, lightTheme } from "@heddy/design-tokens";
import { useSignup, CustomerAccountForm } from "@/features/auth/signup";

export const SignupPage = () => {
  const { customerForm, setCustomerForm, submitSignup, isLoading, error } = useSignup();

  return (
    <div
      className="flex min-h-full flex-col items-center px-6 pb-8 pt-[64px]"
      style={{ backgroundColor: lightTheme.background.normal }}
    >
      <div className="flex w-full max-w-[330px] flex-col items-center">
        <div className="mb-8 flex flex-col items-center gap-3">
          <img src="/heddyIcon.svg" alt="heddy" className="h-[69px] w-[204px] shrink-0" />

          <p className={font.body.medium} style={{ color: lightTheme.label.assistive }}>
            회원가입
          </p>
        </div>

        <CustomerAccountForm
          form={customerForm}
          onChange={setCustomerForm}
          onSubmit={submitSignup}
          isLoading={isLoading}
          error={error}
        />
      </div>
    </div>
  );
};
