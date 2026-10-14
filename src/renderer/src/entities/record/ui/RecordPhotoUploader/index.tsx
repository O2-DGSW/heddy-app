import { font, lightTheme } from "@heddy/design-tokens";

import RecordRequiredMark from "../RecordRequiredMark";

import { noIcon, pictureIcon } from "../../assets";
import { MAX_PHOTO_COUNT } from "../../model";

import type { ChangeEvent, RefObject } from "react";
import type { PhotoItem } from "../../model";

interface RecordPhotoUploaderProps {
  inputRef: RefObject<HTMLInputElement | null>;
  isPhotoLimitReached: boolean;
  isRequired?: boolean;
  photos: PhotoItem[];
  /** 압축하느라 아직 목록에 들어오지 않은 사진 수. 그만큼 "준비 중" 칸을 그린다 */
  processingPhotoCount?: number;
  errorMessage?: string;
  onOpenPhotoPicker: () => void;
  onPhotoSelection: (event: ChangeEvent<HTMLInputElement>) => void;
  onRemovePhoto: (photoId: string) => void;
}

const addPhotoButtonStyle = {
  backgroundColor: lightTheme.background.alternative,
  borderColor: lightTheme.label.disable,
};

const photoRemoveButtonStyle = { backgroundColor: lightTheme.background.normal };

const RecordPhotoUploader = ({
  errorMessage,
  inputRef,
  isPhotoLimitReached,
  isRequired = false,
  photos,
  processingPhotoCount = 0,
  onOpenPhotoPicker,
  onPhotoSelection,
  onRemovePhoto,
}: RecordPhotoUploaderProps) => {
  const hasError = Boolean(errorMessage);
  const errorId = "record-photos-error";

  return (
    <div className="flex w-full flex-col gap-[6px] [--record-photo-size:clamp(82px,26vw,100px)]">
      <h2 className={font.headline2.semiBold} style={{ color: lightTheme.label.neutral }}>
        사진
        {isRequired && <RecordRequiredMark />}
      </h2>

      <input
        accept="image/heic,image/heif,image/jpeg,image/png,image/webp"
        className="hidden"
        multiple
        onChange={onPhotoSelection}
        ref={inputRef}
        type="file"
      />

      <div className="w-full overflow-x-auto pb-[2px] scrollbar-hidden">
        <div className="flex w-max items-end gap-[clamp(8px,2.8vw,11px)]">
          <button
            aria-describedby={hasError ? errorId : undefined}
            aria-label="사진 추가"
            className="flex h-[var(--record-photo-size)] w-[var(--record-photo-size)] shrink-0 items-center justify-center rounded-[10px] border border-solid p-0 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isPhotoLimitReached}
            onClick={onOpenPhotoPicker}
            style={{
              ...addPhotoButtonStyle,
              borderColor: hasError ? lightTheme.status.error : addPhotoButtonStyle.borderColor,
            }}
            type="button"
          >
            <span className="flex w-[clamp(44px,13vw,49px)] flex-col items-center">
              <img
                alt=""
                className="h-[clamp(44px,13vw,49px)] w-[clamp(44px,13vw,49px)]"
                src={pictureIcon}
              />
              <span className={font.caption.regular} style={{ color: lightTheme.line.normal }}>
                사진 {photos.length}/{MAX_PHOTO_COUNT}
              </span>
            </span>
          </button>

          {Array.from({ length: processingPhotoCount }, (_, index) => (
            <div
              aria-busy="true"
              aria-label="사진 준비 중"
              className="flex h-[var(--record-photo-size)] w-[var(--record-photo-size)] shrink-0 animate-pulse items-center justify-center rounded-[10px]"
              key={`processing-${index}`}
              role="img"
              style={{ backgroundColor: lightTheme.fill.normal }}
            >
              <span className={font.caption.regular} style={{ color: lightTheme.label.assistive }}>
                준비 중
              </span>
            </div>
          ))}

          {photos.map((photo, index) => (
            <div
              className="relative h-[calc(var(--record-photo-size)+6px)] w-[var(--record-photo-size)] shrink-0"
              key={photo.id}
            >
              <img
                decoding="async"
                alt={`선택된 시술 사진 ${index + 1}`}
                className="absolute bottom-0 left-0 h-[var(--record-photo-size)] w-[var(--record-photo-size)] rounded-[10px] object-cover"
                src={photo.src}
              />
              <button
                aria-label={`사진 ${index + 1} 삭제`}
                className="absolute right-[-3px] top-0 flex h-[24px] w-[24px] items-center justify-center rounded-full border-0 p-0 shadow-[0_0_6px_rgba(0,0,0,0.07)]"
                onClick={() => onRemovePhoto(photo.id)}
                style={photoRemoveButtonStyle}
                type="button"
              >
                <img alt="" className="h-[19px] w-[19px]" src={noIcon} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 추가 버튼이 왜 꺼졌는지 알려 준다 */}
      {isPhotoLimitReached && !errorMessage && (
        <span className={font.caption.regular} style={{ color: lightTheme.label.assistive }}>
          사진은 최대 {MAX_PHOTO_COUNT}장까지 올릴 수 있어요.
        </span>
      )}

      {errorMessage && (
        <span
          className={font.caption.regular}
          data-form-error="true"
          id={errorId}
          style={{ color: lightTheme.status.error }}
        >
          {errorMessage}
        </span>
      )}
    </div>
  );
};

export default RecordPhotoUploader;
