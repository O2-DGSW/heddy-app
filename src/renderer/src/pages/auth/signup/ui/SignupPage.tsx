import { font, lightTheme } from "@heddy/design-tokens";
import { AuthBackButton } from "@/features/auth/back-button";
import { useSignup, CustomerAccountForm } from "@/features/auth/signup";

const pageStyle = { backgroundColor: lightTheme.background.normal };

const SignupPage = () => {
  const { customerForm, setCustomerForm, submitSignup, isLoading, error } = useSignup();

  return (
    <cap-page className="block h-full w-full touch-pan-y overflow-y-auto overscroll-contain no-scrollbar [-webkit-overflow-scrolling:touch]">
      <section
        aria-labelledby="signup-title"
        className="relative flex min-h-full w-full min-w-0 flex-col items-center px-6"
        style={pageStyle}
      >
        <header className="h-[58px] w-full shrink-0">
          <AuthBackButton fallbackPath="/welcome" />
        </header>

        <div className="min-w-0 w-full pb-8">
          <div className="mx-auto flex min-w-0 w-full max-w-[330px] flex-col items-center pt-6">
            <div className="mb-8 flex flex-col items-center gap-3">
              <img src="/heddyIcon.svg" alt="heddy" className="h-[69px] w-[204px] shrink-0" />

              <h1
                className={font.body.medium}
                id="signup-title"
                style={{ color: lightTheme.label.assistive }}
              >
                회원가입
              </h1>
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
      </section>
    </cap-page>
  );
};

export default SignupPage;
