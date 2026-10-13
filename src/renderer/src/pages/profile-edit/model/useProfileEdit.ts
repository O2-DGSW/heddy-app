import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { useGetMyProfile, usePatchMyProfile } from "@/entities/profile";
import { showErrorToast, showSuccessToast } from "@/shared";

interface ProfileEditFormValues {
  email: string;
  nickname: string;
  password: string;
  phone: string;
}

interface ProfileFormSource {
  email?: string | null;
  nickname?: string | null;
  phone?: string | null;
}

/** 서버 값으로 만든 폼 기본값. 비밀번호는 서버가 주지 않으므로 항상 빈 값이다 */
const toFormValues = (profile: ProfileFormSource | null | undefined): ProfileEditFormValues => ({
  email: profile?.email ?? "",
  nickname: profile?.nickname ?? "",
  password: "",
  phone: profile?.phone ?? "",
});

const getProfileName = (nickname: string | null | undefined, isLoading: boolean) => {
  if (typeof nickname === "string" && nickname.trim()) {
    return nickname;
  }

  return isLoading ? "불러오는 중" : "사용자";
};

export const useProfileEdit = () => {
  const navigate = useNavigate();
  // 서버 값을 폼 state로 복사하지 않고, 사용자가 고친 칸만 따로 들고 있다가 서버 값 위에 덮는다
  const [draft, setDraft] = useState<Partial<ProfileEditFormValues>>({});
  const { isPending: isSaving, mutate: patchMyProfile } = usePatchMyProfile();
  const { data: profile, isLoading } = useGetMyProfile();
  const formValues: ProfileEditFormValues = { ...toFormValues(profile), ...draft };

  const handleBack = () => {
    navigate("/profile");
  };

  const handleChange = (field: keyof ProfileEditFormValues, value: string) => {
    setDraft(currentDraft => ({ ...currentDraft, [field]: value }));
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
        onSuccess: () => {
          // 저장 응답이 캐시에 반영되므로, 저장한 칸의 수정분만 지우면 서버 값이 보인다
          setDraft(currentDraft => {
            const nextDraft = { ...currentDraft };
            delete nextDraft.nickname;
            delete nextDraft.phone;
            return nextDraft;
          });
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
