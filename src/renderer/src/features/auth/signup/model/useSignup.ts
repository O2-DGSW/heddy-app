import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signupApi, signupOwnerApi } from "@/entities/auth/api/authApi";
import type {
  MemberType,
  SignupStep,
  CustomerAccountForm,
  OwnerAccountForm,
  ShopForm,
} from "./types";

const INITIAL_ACCOUNT_FORM = {
  id: "",
  password: "",
  passwordConfirm: "",
  name: "",
  carrier: "SKT" as const,
  phone: "",
  verificationCode: "",
};

const INITIAL_SHOP_FORM: ShopForm = {
  shopName: "",
  address: "",
  addressDetail: "",
  category: "",
  landline: "",
  storeEmail: "",
  businessNumber: "",
};

export const useSignup = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<SignupStep>("type-select");
  const [memberType, setMemberType] = useState<MemberType | null>(null);
  const [customerForm, setCustomerForm] = useState<CustomerAccountForm>({ ...INITIAL_ACCOUNT_FORM });
  const [ownerForm, setOwnerForm] = useState<OwnerAccountForm>({ ...INITIAL_ACCOUNT_FORM });
  const [shopForm, setShopForm] = useState<ShopForm>(INITIAL_SHOP_FORM);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectMemberType = (type: MemberType) => {
    setMemberType(type);
    setStep("account");
  };

  const nextStep = () => {
    if (step === "account" && memberType === "owner") setStep("shop");
    else if (step === "account") setStep("terms");
    else if (step === "shop") setStep("terms");
  };

  const submitSignup = async () => {
    setIsLoading(true);
    setError(null);
    try {
      if (memberType === "owner") {
        await signupOwnerApi({
          loginId: ownerForm.id,
          password: ownerForm.password,
          name: ownerForm.name,
          phoneNumber: ownerForm.phone.replace(/\D/g, ""),
          storeName: shopForm.shopName,
          roadAddress: shopForm.address,
          detailAddress: shopForm.addressDetail,
          landline: shopForm.landline.replace(/\D/g, ""),
          storeEmail: shopForm.storeEmail,
          businessNumber: shopForm.businessNumber.replace(/\D/g, ""),
        });
      } else {
        await signupApi({
          loginId: customerForm.id,
          password: customerForm.password,
          name: customerForm.name,
          phoneNumber: customerForm.phone.replace(/\D/g, ""),
        });
      }
      navigate("/login");
    } catch (err) {
      setError(err instanceof Error ? err.message : "회원가입에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    step,
    memberType,
    customerForm,
    setCustomerForm,
    ownerForm,
    setOwnerForm,
    shopForm,
    setShopForm,
    selectMemberType,
    nextStep,
    submitSignup,
    isLoading,
    error,
  };
};
