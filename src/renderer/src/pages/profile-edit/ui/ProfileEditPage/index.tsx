import { font, lightTheme } from "@heddy/design-tokens";

import { arrowIcon } from "@/entities/record";
import { profileAvatar } from "@/shared";

import { useProfileEdit } from "../../model/useProfileEdit";

interface ProfileEditInputProps {
  autoComplete?: string;
  disabled?: boolean;
  label: string;
  name: string;
  onChange: (value: string) => void;
  placeholder: string;
  type?: "email" | "password" | "tel" | "text";
  value: string;
}

const ProfileEditInput = ({
  autoComplete,
  disabled = false,
  label,
  name,
  onChange,
  placeholder,
  type = "text",
  value,
}: ProfileEditInputProps) => {
  const inputId = `profile-edit-${name}`;

  return (
    <div className="flex flex-col gap-[8px]">
      <label
        className={font.label.medium}
        htmlFor={inputId}
        style={{ color: lightTheme.label.alternative }}
      >
        {label}
      </label>
      <input
        autoComplete={autoComplete}
        className={`h-[42px] w-full rounded-[10px] border-0 px-[15px] outline-none placeholder:text-current disabled:cursor-not-allowed disabled:opacity-60 ${font.caption.regular}`}
        disabled={disabled}
        id={inputId}
        name={name}
        onChange={event => onChange(event.target.value)}
        placeholder={placeholder}
        style={{
          backgroundColor: lightTheme.background.neutral,
          color: lightTheme.label.neutral,
        }}
        type={type}
        value={value}
      />
    </div>
  );
};

const ProfileEditPage = () => {
  const {
    actionMessage,
    formValues,
    handleBack,
    handleChange,
    handleSave,
    handleStyleSelect,
    isLoading,
    isSaving,
    profileName,
  } = useProfileEdit();

  return (
    <cap-page>
      <section
        aria-busy={isLoading || isSaving}
        aria-labelledby="profile-edit-title"
        className="flex h-full min-h-0 flex-col overflow-hidden"
        style={{ backgroundColor: lightTheme.background.normal }}
      >
        <header
          className="relative flex h-[54px] shrink-0 items-center justify-center px-[20px]"
          style={{ backgroundColor: lightTheme.background.normal }}
        >
          <button
            aria-label="프로필로 돌아가기"
            className="absolute left-[20px] flex h-[44px] w-[44px] items-center justify-start border-0 bg-transparent p-0"
            onClick={handleBack}
            type="button"
          >
            <img alt="" className="h-[20px] w-[20px]" src={arrowIcon} />
          </button>
          <h1
            className={font.headline1.bold}
            id="profile-edit-title"
            style={{ color: lightTheme.label.neutral }}
          >
            회원 정보 수정
          </h1>
        </header>

        <form
          className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain no-scrollbar [-webkit-overflow-scrolling:touch]"
          onSubmit={event => {
            event.preventDefault();
            handleSave();
          }}
        >
          <div className="mx-auto flex w-full max-w-[402px] flex-1 flex-col px-[clamp(20px,6.47vw,26px)] pb-[28px] pt-[35px]">
            <div className="flex flex-col items-center">
              <div
                className="flex h-[86px] w-[86px] items-center justify-center rounded-full p-[14px]"
                style={{ backgroundColor: lightTheme.background.neutral }}
              >
                <img
                  alt="현재 프로필 이미지"
                  className="h-full w-full object-contain"
                  src={profileAvatar}
                />
              </div>
              <p
                className={`mt-[12px] ${font.headline1.semiBold}`}
                style={{ color: lightTheme.label.neutral }}
              >
                {profileName}
              </p>
            </div>

            <div className="mt-[35px] flex flex-col gap-[22px]">
              <ProfileEditInput
                autoComplete="nickname"
                label="이름 또는 닉네임"
                name="nickname"
                onChange={value => handleChange("nickname", value)}
                placeholder="이름 또는 닉네임을 입력하세요"
                value={formValues.nickname}
              />
              <ProfileEditInput
                autoComplete="new-password"
                disabled
                label="비밀번호"
                name="password"
                onChange={value => handleChange("password", value)}
                placeholder="비밀번호를 입력하세요"
                type="password"
                value={formValues.password}
              />
              <ProfileEditInput
                autoComplete="tel"
                label="연락처"
                name="phone"
                onChange={value => handleChange("phone", value)}
                placeholder="010-0000-0000"
                type="tel"
                value={formValues.phone}
              />
              <ProfileEditInput
                autoComplete="email"
                disabled
                label="이메일"
                name="email"
                onChange={value => handleChange("email", value)}
                placeholder="example@heddy.com"
                type="email"
                value={formValues.email}
              />

              <div className="flex flex-col gap-[8px]">
                <span className={font.label.medium} style={{ color: lightTheme.label.alternative }}>
                  머리 스타일
                </span>
                <button
                  aria-describedby="profile-edit-action-message"
                  className={`flex h-[42px] w-full items-center justify-between rounded-[10px] border-0 px-[15px] text-left ${font.caption.regular}`}
                  disabled={isSaving}
                  onClick={handleStyleSelect}
                  style={{
                    backgroundColor: lightTheme.background.neutral,
                    color: lightTheme.label.assistive,
                  }}
                  type="button"
                >
                  <span>선호하는 머리 스타일을 선택하세요</span>
                  <img alt="" className="h-[16px] w-[16px] -rotate-90" src={arrowIcon} />
                </button>
              </div>
            </div>

            <div className="mt-auto pt-[36px]">
              <p
                className={`mb-[10px] min-h-[18px] text-center ${font.caption.regular}`}
                id="profile-edit-action-message"
                role="status"
                style={{ color: lightTheme.label.assistive }}
              >
                {actionMessage}
              </p>
              <div className="grid grid-cols-2 gap-[7px]">
                <button
                  className={`h-[42px] rounded-[10px] border ${font.headline2.semiBold}`}
                  disabled={isSaving}
                  onClick={handleBack}
                  style={{
                    backgroundColor: lightTheme.background.alternative,
                    borderColor: lightTheme.fill.neutral,
                    color: lightTheme.label.alternative,
                  }}
                  type="button"
                >
                  취소
                </button>
                <button
                  className={`h-[42px] rounded-[10px] border border-transparent ${font.headline2.semiBold}`}
                  disabled={isSaving}
                  style={{
                    backgroundColor: lightTheme.primary.normal,
                    color: lightTheme.label.buttonText,
                  }}
                  type="submit"
                >
                  {isSaving ? "저장 중" : "저장"}
                </button>
              </div>
            </div>
          </div>
        </form>
      </section>
    </cap-page>
  );
};

export default ProfileEditPage;
