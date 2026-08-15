import { font, lightTheme } from "@heddy/design-tokens";
import { useSignup, CustomerAccountForm } from "@/features/auth/signup";

export const SignupPage = () => {
  const { customerForm, setCustomerForm, submitSignup, isLoading } = useSignup();

  return (
    <div
      className="flex h-full flex-col items-center justify-center overflow-y-auto px-6 pt-4"
      style={{ backgroundColor: lightTheme.background.normal }}
    >
      <div className="flex flex-col items-center">
        <img src="/heddyIcon.svg" alt="heddy" className="w-50" />

        <p className={font.body.medium} style={{ color: lightTheme.label.assistive }}>
          회원가입
        </p>
      </div>

      <CustomerAccountForm
        form={customerForm}
        onChange={setCustomerForm}
        onSubmit={submitSignup}
        isLoading={isLoading}
      />
    </div>
  );
};
