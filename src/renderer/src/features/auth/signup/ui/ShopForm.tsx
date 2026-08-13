import { useState } from "react";
import { font, lightTheme } from "@heddy/design-tokens";
import { Link } from "react-router-dom";
import type { ShopForm as ShopFormType } from "@/features/auth/signup/model/types";
import { useAddressSearch } from "@/features/auth/signup/model/useAddressSearch";
import { AddressSearchModal } from "@/features/auth/signup/ui/AddressSearchModal";
import { SHOP_CATEGORIES } from "@/features/auth/signup/constants/signup";
import { formatLandline } from "@/shared/utils/formatLandline";
import { formatBusinessNumber } from "@/shared/utils/formatBusinessNumber";

interface ShopFormProps {
  form: ShopFormType;
  onChange: (form: ShopFormType) => void;
  onNext: () => void;
}

export const ShopForm = ({ form, onChange, onNext }: ShopFormProps) => {
  const [showModal, setShowModal] = useState(false);

  const { embedPostcode } = useAddressSearch((address, zonecode) => {
    onChange({ ...form, address: `[${zonecode}] ${address}` });
    setShowModal(false);
  });

  const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isValid =
    !!form.shopName &&
    !!form.address &&
    !!form.category &&
    !!form.landline &&
    isValidEmail(form.storeEmail) &&
    !!form.businessNumber;

  const inputStyle = {
    backgroundColor: lightTheme.background.neutral,
    color: lightTheme.label.normal,
  };

  return (
    <>
      <div className="flex flex-col w-full gap-4">
        <div className="flex flex-col gap-1">
          <p className={`${font.label.medium} pl-2`} style={{ color: lightTheme.label.assistive }}>
            상점명
          </p>
          <input
            className={`w-full px-4 py-4 rounded-xl focus:outline-none ${font.caption.regular}`}
            style={inputStyle}
            placeholder="상점명"
            value={form.shopName}
            onChange={e => onChange({ ...form, shopName: e.target.value })}
          />
        </div>

        <div className="flex flex-col gap-1">
          <p className={`${font.label.medium} pl-2`} style={{ color: lightTheme.label.assistive }}>
            주소 (사업장 소재지)
          </p>
          <div className="flex gap-2">
            <input
              className={`flex-1 px-4 py-4 rounded-xl focus:outline-none ${font.caption.regular}`}
              style={inputStyle}
              placeholder="주소검색"
              value={form.address}
              onChange={e => onChange({ ...form, address: e.target.value })}
            />
            <button
              className={`px-6 py-4 rounded-xl ${font.label.medium}`}
              style={{
                backgroundColor: lightTheme.line.alternative,
                color: lightTheme.label.assistive,
              }}
              onClick={() => setShowModal(true)}
            >
              주소검색
            </button>
          </div>
          <input
            className={`w-full px-4 py-4 rounded-xl focus:outline-none ${font.caption.regular}`}
            style={inputStyle}
            placeholder="상세주소"
            value={form.addressDetail}
            onChange={e => onChange({ ...form, addressDetail: e.target.value })}
          />
        </div>

        <div className="flex flex-col gap-1">
          <p className={`${font.label.medium} pl-2`} style={{ color: lightTheme.label.assistive }}>
            상점 카테고리
          </p>
          <select
            className={`w-full px-4 py-4 rounded-xl focus:outline-none ${font.caption.regular}`}
            style={{
              ...inputStyle,
              color: form.category ? lightTheme.label.normal : lightTheme.label.assistive,
            }}
            value={form.category}
            onChange={e => onChange({ ...form, category: e.target.value })}
          >
            <option value="" disabled>
              카테고리를 선택해주세요
            </option>
            {SHOP_CATEGORIES.map(cat => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <p className={`${font.label.medium} pl-2`} style={{ color: lightTheme.label.assistive }}>
            유선번호
          </p>
          <input
            className={`w-full px-4 py-4 rounded-xl focus:outline-none ${font.caption.regular}`}
            style={inputStyle}
            placeholder="유선번호"
            value={form.landline}
            onChange={e => onChange({ ...form, landline: formatLandline(e.target.value) })}
          />
        </div>

        <div className="flex flex-col gap-1">
          <p className={`${font.label.medium} pl-2`} style={{ color: lightTheme.label.assistive }}>
            매장 이메일
          </p>
          <input
            type="email"
            className={`w-full px-4 py-4 rounded-xl focus:outline-none ${font.caption.regular}`}
            style={inputStyle}
            placeholder="매장 이메일"
            value={form.storeEmail}
            onChange={e => onChange({ ...form, storeEmail: e.target.value })}
          />
        </div>

        <div className="flex flex-col gap-1">
          <p className={`${font.label.medium} pl-2`} style={{ color: lightTheme.label.assistive }}>
            사업자등록번호
          </p>
          <input
            className={`w-full px-4 py-4 rounded-xl focus:outline-none ${font.caption.regular}`}
            style={inputStyle}
            placeholder="사업자등록번호"
            value={form.businessNumber}
            onChange={e =>
              onChange({ ...form, businessNumber: formatBusinessNumber(e.target.value) })
            }
          />
        </div>

        <button
          className={`w-full py-4 rounded-2xl mt-2 ${font.headline2.semiBold}`}
          style={{
            backgroundColor: isValid ? lightTheme.primary.normal : lightTheme.line.alternative,
            color: isValid ? lightTheme.fill.normal : lightTheme.line.normal,
          }}
          disabled={!isValid}
          onClick={onNext}
        >
          다음으로
        </button>

        <div
          className={`flex justify-center gap-2 ${font.caption.regular}`}
          style={{ color: lightTheme.label.assistive }}
        >
          <span>이미 계정이 있으신가요?</span>
          <Link to="/login" style={{ color: lightTheme.primary.normal }}>
            로그인
          </Link>
        </div>
      </div>

      {showModal && (
        <AddressSearchModal onClose={() => setShowModal(false)} embedPostcode={embedPostcode} />
      )}
    </>
  );
};
