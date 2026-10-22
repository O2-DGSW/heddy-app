import { useState } from "react";
import type { Ref } from "react";
import { font, lightTheme } from "@heddy/design-tokens";
import EyeOnIcon from "./assets/onPassword.svg";
import EyeOffIcon from "./assets/offPassword.svg";

interface PasswordInputProps {
  id?: string;
  name?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete?: string;
  className?: string;
  /** 오류가 난 칸으로 포커스를 옮길 때 쓴다 */
  ref?: Ref<HTMLInputElement>;
  maxLength?: number;
  onBlur?: () => void;
  invalid?: boolean;
  /** 오류 문구 요소의 id. 스크린 리더가 칸과 함께 읽는다 */
  describedBy?: string;
}

export const PasswordInput = ({
  id,
  name,
  placeholder = "비밀번호",
  value,
  onChange,
  autoComplete,
  className = "",
  ref,
  maxLength,
  onBlur,
  invalid = false,
  describedBy,
}: PasswordInputProps) => {
  const [show, setShow] = useState(false);

  return (
    <div className="relative w-full">
      <input
        id={id}
        ref={ref}
        name={name}
        maxLength={maxLength}
        onBlur={onBlur}
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy}
        type={show ? "text" : "password"}
        className={`w-full px-4 py-4 pr-12 rounded-xl focus:outline-none ${font.body.regular} ${className}`}
        style={{
          backgroundColor: lightTheme.background.neutral,
          color: lightTheme.label.normal,
        }}
        autoComplete={autoComplete}
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
      />
      {value && (
        <button
          type="button"
          className="absolute right-4 top-1/2 -translate-y-1/2"
          onMouseDown={e => e.preventDefault()}
          onClick={() => setShow(prev => !prev)}
          tabIndex={-1}
        >
          <img src={show ? EyeOnIcon : EyeOffIcon} alt="비밀번호 보기" className="size-6" />
        </button>
      )}
    </div>
  );
};
