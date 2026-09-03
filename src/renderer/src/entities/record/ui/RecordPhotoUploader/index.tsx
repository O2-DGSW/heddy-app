import { font, lightTheme } from "@heddy/design-tokens";

import { noIcon, pictureIcon } from "../../assets";
import { MAX_PHOTO_COUNT } from "../../model";

import type { ChangeEvent, RefObject } from "react";
import type { PhotoItem } from "../../model";

interface RecordPhotoUploaderProps {
  inputRef: RefObject<HTMLInputElement | null>;
  isPhotoLimitReached: boolean;
  photos: PhotoItem[];
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
  photos,
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

          {photos.map((photo, index) => (
            <div
              className="relative h-[calc(var(--record-photo-size)+6px)] w-[var(--record-photo-size)] shrink-0"
              key={photo.id}
            >
              <img
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

      {errorMessage && (
        <span
          className={font.caption.regular}
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
