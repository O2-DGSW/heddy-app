import { font, lightTheme } from "@heddy/design-tokens";
import { useSignup, CustomerAccountForm } from "@/features/auth/signup";
import { BackButton } from "@/shared";

const pageStyle = { backgroundColor: lightTheme.background.normal };

const SignupPage = () => {
  const { customerForm, setCustomerForm, submitSignup, isLoading, error } = useSignup();

  return (
    <cap-page>
      <section
        aria-labelledby="signup-title"
        className="flex h-full min-h-0 flex-col items-center overflow-hidden px-6"
        style={pageStyle}
      >
        <header className="flex h-[58px] w-full shrink-0 items-center">
          <BackButton fallbackPath="/welcome" />
        </header>

        <div className="min-h-0 w-full flex-1 touch-pan-y overflow-y-auto overscroll-contain pb-8 no-scrollbar [-webkit-overflow-scrolling:touch]">
          <div className="mx-auto flex w-full max-w-[330px] flex-col items-center pt-6">
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
