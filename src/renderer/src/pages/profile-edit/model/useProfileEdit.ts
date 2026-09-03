import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getAccessToken } from "@/entities/auth";
import { getMyProfileApi, profileQueryKeys } from "@/entities/profile";

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
  const [accessToken, setAccessToken] = useState<string | null | undefined>(undefined);
  const [actionMessage, setActionMessage] = useState("");
  const [formValues, setFormValues] = useState<ProfileEditFormValues>(INITIAL_FORM_VALUES);
  const hasInitializedForm = useRef(false);

  useEffect(() => {
    let isMounted = true;

    void getAccessToken().then(token => {
      if (isMounted) {
        setAccessToken(token);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const { data: profile, isLoading } = useQuery({
    queryKey: profileQueryKeys.mine(),
    queryFn: () => getMyProfileApi(accessToken ?? ""),
    enabled: Boolean(accessToken),
  });

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
    setActionMessage("");
    setFormValues(currentValues => ({ ...currentValues, [field]: value }));
  };

  const handleSave = () => {
    setActionMessage("회원정보 저장 기능을 준비 중입니다.");
  };

  const handleStyleSelect = () => {
    setActionMessage("머리 스타일 선택 기능을 준비 중입니다.");
  };

  return {
    actionMessage,
    formValues,
    handleBack,
    handleChange,
    handleSave,
    handleStyleSelect,
    isLoading,
    profileName: getProfileName(profile?.nickname, isLoading),
  };
};
