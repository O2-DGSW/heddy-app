import { font, lightTheme } from "@heddy/design-tokens";

import chestLengthImage from "@/features/auth/signup/assets/hair-profile/chest-length.png";
import curlyImage from "@/features/auth/signup/assets/hair-profile/curly.svg";
import jawLengthImage from "@/features/auth/signup/assets/hair-profile/jaw-length.png";
import mediumImage from "@/features/auth/signup/assets/hair-profile/medium.svg";
import shoulderLengthImage from "@/features/auth/signup/assets/hair-profile/shoulder-length.png";
import shortImage from "@/features/auth/signup/assets/hair-profile/short.png";
import straightImage from "@/features/auth/signup/assets/hair-profile/straight.svg";
import thickImage from "@/features/auth/signup/assets/hair-profile/thick.svg";
import thinImage from "@/features/auth/signup/assets/hair-profile/thin.svg";
import wavyImage from "@/features/auth/signup/assets/hair-profile/wavy.svg";
import type {
  HairConditionType,
  HairLengthType,
  HairProfileForm,
  HairThicknessType,
  HairType,
} from "@/features/auth/signup/model/types";
import { cn } from "@/shared";

interface HairProfileFieldProps {
  value: HairProfileForm;
  onChange: (value: HairProfileForm) => void;
}

interface ImageOption<TValue extends string> {
  value: TValue;
  label: string;
  image: string;
}

const HAIR_LENGTH_OPTIONS: ImageOption<HairLengthType>[] = [
  { value: "SHORT", label: "숏컷", image: shortImage },
  { value: "BELOW_CHIN", label: "턱선 아래", image: jawLengthImage },
  { value: "BELOW_SHOULDER", label: "어깨선 아래", image: shoulderLengthImage },
  { value: "BELOW_CHEST", label: "가슴선 아래", image: chestLengthImage },
];

const HAIR_CONDITION_OPTIONS: { value: HairConditionType; label: string }[] = [
  { value: "HEALTHY", label: "건강" },
  { value: "NORMAL", label: "보통" },
  { value: "DAMAGED", label: "손상" },
  { value: "SEVERELY_DAMAGED", label: "극손상" },
];

const HAIR_TYPE_OPTIONS: ImageOption<HairType>[] = [
  { value: "STRAIGHT", label: "생머리", image: straightImage },
  { value: "WAVY", label: "반곱슬", image: wavyImage },
  { value: "CURLY", label: "곱슬", image: curlyImage },
];

const HAIR_THICKNESS_OPTIONS: ImageOption<HairThicknessType>[] = [
  { value: "THIN", label: "얇음", image: thinImage },
  { value: "NORMAL", label: "보통", image: mediumImage },
  { value: "THICK", label: "굵음", image: thickImage },
];

interface ImageOptionFieldProps<TValue extends string> {
  legend: string;
  name: string;
  columns: 3 | 4;
  options: ImageOption<TValue>[];
  selectedValue: TValue;
  onChange: (value: TValue) => void;
}

const ImageOptionField = <TValue extends string>({
  legend,
  name,
  columns,
  options,
  selectedValue,
  onChange,
}: ImageOptionFieldProps<TValue>) => {
  return (
    <fieldset>
      <legend className={font.body.semiBold} style={{ color: lightTheme.label.normal }}>
        {legend}
      </legend>

      <div className={cn("mt-3 grid gap-2.5", columns === 4 ? "grid-cols-4" : "grid-cols-3")}>
        {options.map(option => {
          const isSelected = selectedValue === option.value;

          return (
            <label key={option.value} className="relative min-w-0 cursor-pointer text-center">
              <input
                type="radio"
                name={name}
                value={option.value}
                checked={isSelected}
                className="peer absolute inset-0 z-10 size-full cursor-pointer opacity-0"
                onChange={() => onChange(option.value)}
              />
              <span
                className="flex aspect-square w-full items-center justify-center overflow-hidden rounded-xl border-2 peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2"
                style={{
                  backgroundColor: lightTheme.background.neutral,
                  borderColor: isSelected ? lightTheme.primary.normal : "transparent",
                  outlineColor: lightTheme.primary.normal,
                }}
              >
                <img
                  src={option.image}
                  alt=""
                  className={cn(
                    columns === 4 ? "size-full object-cover" : "max-h-[32px] max-w-[72px]"
                  )}
                />
              </span>
              <span
                className={`mt-1 block ${font.caption.regular}`}
                style={{ color: lightTheme.label.alternative }}
              >
                {option.label}
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
};

const HairProfileField = ({ value, onChange }: HairProfileFieldProps) => {
  const handleCareTimeChange = (careTime: string) => {
    const numericValue = careTime.replace(/\D/g, "").slice(0, 3);
    onChange({ ...value, availableCareTimeMinutes: numericValue });
  };

  return (
    <section aria-label="모발 정보" className="flex flex-col gap-9 py-3">
      <ImageOptionField
        legend="현재 머리 기장"
        name="hair-length"
        columns={4}
        options={HAIR_LENGTH_OPTIONS}
        selectedValue={value.hairLength}
        onChange={hairLength => onChange({ ...value, hairLength })}
      />

      <fieldset>
        <legend className={font.body.semiBold} style={{ color: lightTheme.label.normal }}>
          모발 상태
        </legend>

        <div className="relative mt-4 grid grid-cols-4">
          <span
            aria-hidden="true"
            className="absolute left-[12.5%] right-[12.5%] top-2 h-px"
            style={{ backgroundColor: lightTheme.line.normal }}
          />

          {HAIR_CONDITION_OPTIONS.map(option => {
            const isSelected = value.hairCondition === option.value;

            return (
              <label
                key={option.value}
                className="relative flex cursor-pointer flex-col items-center"
              >
                <input
                  type="radio"
                  name="hair-condition"
                  value={option.value}
                  checked={isSelected}
                  className="peer absolute inset-0 z-20 size-full cursor-pointer opacity-0"
                  onChange={() => onChange({ ...value, hairCondition: option.value })}
                />
                <span
                  aria-hidden="true"
                  className="z-10 flex size-4 items-center justify-center rounded-full border-2 peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2"
                  style={{
                    backgroundColor: lightTheme.background.normal,
                    borderColor: isSelected ? lightTheme.primary.normal : lightTheme.line.normal,
                    outlineColor: lightTheme.primary.normal,
                  }}
                >
                  {isSelected && (
                    <span
                      className="size-2 rounded-full"
                      style={{ backgroundColor: lightTheme.primary.normal }}
                    />
                  )}
                </span>
                <span
                  className={`mt-2 ${font.caption.regular}`}
                  style={{
                    color: isSelected ? lightTheme.primary.normal : lightTheme.label.alternative,
                  }}
                >
                  {option.label}
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>

      <ImageOptionField
        legend="모발 타입"
        name="hair-type"
        columns={3}
        options={HAIR_TYPE_OPTIONS}
        selectedValue={value.hairType}
        onChange={hairType => onChange({ ...value, hairType })}
      />

      <ImageOptionField
        legend="모발 굵기"
        name="hair-thickness"
        columns={3}
        options={HAIR_THICKNESS_OPTIONS}
        selectedValue={value.hairThickness}
        onChange={hairThickness => onChange({ ...value, hairThickness })}
      />

      <div className="flex flex-col gap-3">
        <label
          htmlFor="available-care-time"
          className={font.body.semiBold}
          style={{ color: lightTheme.label.normal }}
        >
          관리 가능 시간
        </label>
        <div className="relative">
          <input
            id="available-care-time"
            name="availableCareTimeMinutes"
            type="text"
            inputMode="numeric"
            autoComplete="off"
            className={`h-[42px] w-full rounded-xl px-4 pr-12 focus:outline-none focus-visible:outline focus-visible:outline-2 ${font.label.regular}`}
            style={{
              backgroundColor: lightTheme.background.neutral,
              color: lightTheme.label.normal,
              outlineColor: lightTheme.primary.normal,
            }}
            placeholder="관리 가능 시간"
            value={value.availableCareTimeMinutes}
            onChange={event => handleCareTimeChange(event.target.value)}
          />
          {value.availableCareTimeMinutes && (
            <span
              className={`pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 ${font.label.regular}`}
              style={{ color: lightTheme.label.assistive }}
            >
              분
            </span>
          )}
        </div>
      </div>
    </section>
  );
};

export default HairProfileField;
