import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useGetMyProfile, usePatchMyProfile } from "@/entities/profile";
import { showErrorToast, showSuccessToast } from "@/shared";

interface ProfileEditFormValues {
  email: string;
  nickname: string;
  password: string;
  phone: string;
}

const INITIAL_FORM_VALUES: ProfileEditFormValues = {
  email: "",
  nickname: "",
  password: "",
  phone: "",
};

const getProfileName = (nickname: string | null | undefined, isLoading: boolean) => {
  if (typeof nickname === "string" && nickname.trim()) {
    return nickname;
  }

  return isLoading ? "불러오는 중" : "사용자";
};

export const useProfileEdit = () => {
  const navigate = useNavigate();
  const [formValues, setFormValues] = useState<ProfileEditFormValues>(INITIAL_FORM_VALUES);
  const hasInitializedForm = useRef(false);
  const { isPending: isSaving, mutate: patchMyProfile } = usePatchMyProfile();
  const { data: profile, isLoading } = useGetMyProfile();

  useEffect(() => {
    if (!profile || hasInitializedForm.current) {
      return;
    }

    setFormValues({
      email: profile.email ?? "",
      nickname: profile.nickname ?? "",
      password: "",
      phone: profile.phone ?? "",
    });
    hasInitializedForm.current = true;
  }, [profile]);

  const handleBack = () => {
    navigate("/profile");
  };

  const handleChange = (field: keyof ProfileEditFormValues, value: string) => {
    setFormValues(currentValues => ({ ...currentValues, [field]: value }));
  };

  const handleSave = () => {
    const nickname = formValues.nickname.trim();
    const phone = formValues.phone.trim();

    if (!nickname) {
      showErrorToast("이름 또는 닉네임을 입력해주세요.");
      return;
    }

    patchMyProfile(
      {
        nickname,
        ...(phone ? { phone } : {}),
      },
      {
        onSuccess: updatedProfile => {
          setFormValues(currentValues => ({
            ...currentValues,
            nickname: updatedProfile?.nickname ?? nickname,
            phone: updatedProfile?.phone ?? currentValues.phone,
          }));
          showSuccessToast("회원정보를 저장했어요.");
        },
        onError: error => {
          showErrorToast(
            error instanceof Error ? error.message : "회원정보를 저장하지 못했습니다."
          );
        },
      }
    );
  };

  const handleStyleSelect = () => {
    showErrorToast("머리 스타일 선택 기능을 준비 중입니다.");
  };

  return {
    formValues,
    handleBack,
    handleChange,
    handleSave,
    handleStyleSelect,
    isLoading,
    isSaving,
    profileName: getProfileName(profile?.nickname, isLoading),
  };
};
