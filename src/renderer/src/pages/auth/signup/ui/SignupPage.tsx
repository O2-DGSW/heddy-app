import { font, lightTheme } from "@heddy/design-tokens";
import { useNavigate } from "react-router-dom";
import { useSignup, CustomerAccountForm } from "@/features/auth/signup";
import { LoadingScreen } from "@/shared/ui/loading";

export const SignupPage = () => {
  const navigate = useNavigate();
  const { customerForm, setCustomerForm, nextStep, isLoading } = useSignup();

  if (isLoading) {
    return <LoadingScreen onComplete={() => navigate("/login")} />;
  }

  return (
    <div
      className="h-full overflow-y-auto flex flex-col items-center justify-center px-6 pt-4"
      style={{ backgroundColor: lightTheme.background.normal }}
    >
      <div className="flex flex-col items-center">
        <img src="/heddyIcon.svg" alt="heddy" className="w-50" />
        <p className={font.body.medium} style={{ color: lightTheme.label.assistive }}>
          회원가입
        </p>
      </div>

      <CustomerAccountForm form={customerForm} onChange={setCustomerForm} onNext={nextStep} />
    </div>
  );
};
