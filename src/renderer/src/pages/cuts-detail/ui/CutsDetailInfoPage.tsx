import { useNavigate, useParams } from "react-router-dom";
import { font, lightTheme } from "@heddy/design-tokens";

import procedurePhoto from "../assets/procedure-photo.png";
import ratingStar from "../assets/rating-star.svg";
import { dummyCutsRecords } from "@/features/cuts/constrants/dummyRecords";

const RECORD_PHOTO_COUNT = 3;

const RECORD_DETAIL_VALUES = {
  duration: "2시간 30분",
  memo: "생각보다 밝게 나와서 만족하였지만 두피가 예민하기에 탈색없이 진행하여야 함.",
  price: "120,000원",
  procedureContent: "다운펌 시술",
} as const;

const CutsDetailInfoPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const record = dummyCutsRecords.find(cutsRecord => cutsRecord.id === id);

  if (!record) {
    return (
      <p
        className={`flex flex-1 items-center justify-center ${font.body.regular}`}
        style={{ color: lightTheme.label.assistive }}
      >
        시술 기록을 찾을 수 없어요
      </p>
    );
  }

  const recordInformation = [
    { label: "시술 날짜", value: record.date },
    { label: "미용실", value: record.salonName },
    { label: "담당 디자이너", value: record.designerName },
    { label: "시술 종류", value: record.category },
    { label: "시술 내용", value: RECORD_DETAIL_VALUES.procedureContent },
    { label: "소요 시간", value: RECORD_DETAIL_VALUES.duration },
    { label: "금액", value: RECORD_DETAIL_VALUES.price },
  ];

  const handleShare = () => {
    navigate("../share");
  };

  return (
    <div className="flex flex-col gap-[52px] px-[19px] pb-[30px] pt-[29px]">
      <section className="flex flex-col gap-[6px]" aria-labelledby="record-photo-title">
        <h2
          className={font.headline2.semiBold}
          id="record-photo-title"
          style={{ color: lightTheme.label.neutral }}
        >
          사진
        </h2>
        <div className="flex gap-[11px] pl-[6px]">
          {Array.from({ length: RECORD_PHOTO_COUNT }, (_, index) => (
            <img
              alt={`${record.procedureName} 시술 사진 ${index + 1}`}
              className="h-[110px] w-[110px] rounded-[10px] object-cover"
              key={index}
              src={record.thumbnailUrl || procedurePhoto}
            />
          ))}
        </div>
      </section>

      <div className="flex flex-col gap-[28px]">
        <section className="flex flex-col gap-[10px]" aria-labelledby="record-information-title">
          <h2
            className={font.headline2.semiBold}
            id="record-information-title"
            style={{ color: lightTheme.label.neutral }}
          >
            시술 정보
          </h2>
          <dl
            className="overflow-hidden rounded-[15px]"
            style={{ backgroundColor: lightTheme.background.normal }}
          >
            {recordInformation.map(({ label, value }) => (
              <div
                className="flex h-[53px] items-center justify-between border-b px-[14px] last:border-b-0"
                key={label}
                style={{ borderColor: lightTheme.label.buttonText }}
              >
                <dt className={font.body.medium} style={{ color: lightTheme.label.assistive }}>
                  {label}
                </dt>
                <dd className={font.body.medium} style={{ color: lightTheme.label.alternative }}>
                  {value}
                </dd>
              </div>
            ))}
            <div className="flex h-[53px] items-center justify-between px-[14px]">
              <dt className={font.body.medium} style={{ color: lightTheme.label.assistive }}>
                만족도
              </dt>
              <dd aria-label={`만족도 ${record.rating}점`} className="flex -space-x-[3px]">
                {Array.from({ length: record.rating }, (_, index) => (
                  <img alt="" className="h-[20px] w-[20px]" key={index} src={ratingStar} />
                ))}
              </dd>
            </div>
          </dl>
        </section>

        <section className="flex flex-col gap-[10px]" aria-labelledby="record-memo-title">
          <h2
            className={font.headline2.semiBold}
            id="record-memo-title"
            style={{ color: lightTheme.label.neutral }}
          >
            메모
          </h2>
          <p
            className={`${font.body.medium} min-h-[92px] rounded-[15px] px-[17px] py-[15px]`}
            style={{
              backgroundColor: lightTheme.background.neutral,
              color: lightTheme.label.alternative,
            }}
          >
            {RECORD_DETAIL_VALUES.memo}
          </p>
        </section>
      </div>

      <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_92px] gap-[7px]">
        <button
          className={`h-[42px] rounded-[10px] border ${font.headline2.semiBold}`}
          style={{
            backgroundColor: lightTheme.background.normal,
            borderColor: lightTheme.fill.neutral,
            color: lightTheme.label.alternative,
          }}
          type="button"
        >
          수정
        </button>
        <button
          className={`h-[42px] rounded-[10px] border ${font.headline2.semiBold}`}
          onClick={handleShare}
          style={{
            backgroundColor: lightTheme.background.normal,
            borderColor: lightTheme.fill.neutral,
            color: lightTheme.label.alternative,
          }}
          type="button"
        >
          공유
        </button>
        <button
          className={`h-[42px] rounded-[10px] border-0 ${font.headline2.semiBold}`}
          style={{ backgroundColor: lightTheme.status.error, color: lightTheme.label.buttonText }}
          type="button"
        >
          삭제
        </button>
      </div>
    </div>
  );
};

export { CutsDetailInfoPage };
