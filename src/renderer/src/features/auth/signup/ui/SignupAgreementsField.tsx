import { font, lightTheme } from "@heddy/design-tokens";

import { SIGNUP_AGREEMENT_ITEMS } from "@/features/auth/signup/constants/signup";
import type { SignupAgreementKey } from "@/features/auth/signup/model/types";
import type { SignupAgreementsFieldProps as Props } from "@/features/auth/signup/ui/types";

export const SignupAgreementsField = ({ agreements, showError = false, onChange }: Props) => {
  const allAgreementsAccepted = SIGNUP_AGREEMENT_ITEMS.every(item => agreements[item.key]);

  const handleToggleAll = (checked: boolean) => {
    onChange(
      SIGNUP_AGREEMENT_ITEMS.reduce(
        (nextAgreements, item) => ({
          ...nextAgreements,
          [item.key]: checked,
        }),
        { ...agreements }
      )
    );
  };

  const handleToggleAgreement = (key: SignupAgreementKey, checked: boolean) => {
    onChange({
      ...agreements,
      [key]: checked,
    });
  };

  return (
    <fieldset className="flex flex-col gap-3">
      <legend className={`${font.label.medium} pl-2`} style={{ color: lightTheme.label.assistive }}>
        약관 동의
      </legend>

      <label
        htmlFor="signup-agreement-all"
        className="flex items-center gap-3 rounded-xl px-4 py-3"
        style={{ backgroundColor: lightTheme.background.neutral }}
      >
        <input
          id="signup-agreement-all"
          type="checkbox"
          checked={allAgreementsAccepted}
          className="size-5 shrink-0"
          style={{ accentColor: lightTheme.primary.normal }}
          onChange={event => handleToggleAll(event.target.checked)}
        />
        <span className={font.label.semiBold} style={{ color: lightTheme.label.neutral }}>
          전체 동의
        </span>
      </label>

      <ul className="flex flex-col gap-3 px-2">
        {SIGNUP_AGREEMENT_ITEMS.map(item => (
          <li key={item.key}>
            <label htmlFor={`signup-agreement-${item.key}`} className="flex items-start gap-3">
              <input
                id={`signup-agreement-${item.key}`}
                type="checkbox"
                checked={agreements[item.key]}
                className="mt-0.5 size-5 shrink-0"
                style={{ accentColor: lightTheme.primary.normal }}
                onChange={event => handleToggleAgreement(item.key, event.target.checked)}
              />
              <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className={font.label.medium} style={{ color: lightTheme.label.neutral }}>
                  {item.required ? "[필수]" : "[선택]"} {item.label}
                </span>
                <span
                  className={font.caption.regular}
                  style={{ color: lightTheme.label.assistive }}
                >
                  {item.description}
                </span>
              </span>
            </label>
          </li>
        ))}
      </ul>

      {showError && (
        <p className={`${font.caption.regular} pl-2`} style={{ color: lightTheme.status.error }}>
          필수 약관에 동의해주세요.
        </p>
      )}
    </fieldset>
  );
};
