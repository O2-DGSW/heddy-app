import { font, lightTheme } from "@heddy/design-tokens";

import { noIcon, pictureIcon } from "../../assets";
import { MAX_PHOTO_COUNT } from "../../model";

import type { ChangeEvent, RefObject } from "react";
import type { PhotoItem } from "../../model";

interface RecordPhotoUploaderProps {
  inputRef: RefObject<HTMLInputElement | null>;
  isPhotoLimitReached: boolean;
  photos: PhotoItem[];
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
  inputRef,
  isPhotoLimitReached,
  photos,
  onOpenPhotoPicker,
  onPhotoSelection,
  onRemovePhoto,
}: RecordPhotoUploaderProps) => {
  return (
    <div className="flex w-full flex-col gap-[6px]">
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

      <div className="w-[calc(100%+14px)] overflow-x-auto pb-[2px] scrollbar-hidden">
        <div className="flex w-max items-end gap-[11px]">
          <button
            aria-label="사진 추가"
            className="flex h-[100px] w-[100px] shrink-0 items-center justify-center rounded-[10px] border border-solid p-0 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isPhotoLimitReached}
            onClick={onOpenPhotoPicker}
            style={addPhotoButtonStyle}
            type="button"
          >
            <span className="flex w-[49px] flex-col items-center">
              <img alt="" className="h-[49px] w-[49px]" src={pictureIcon} />
              <span className={font.caption.regular} style={{ color: lightTheme.line.normal }}>
                사진 {photos.length}/{MAX_PHOTO_COUNT}
              </span>
            </span>
          </button>

          {photos.map((photo, index) => (
            <div className="relative h-[106px] w-[100px] shrink-0" key={photo.id}>
              <img
                alt={`선택된 시술 사진 ${index + 1}`}
                className="absolute bottom-0 left-0 h-[100px] w-[100px] rounded-[10px] object-cover"
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
    </div>
  );
};

export default RecordPhotoUploader;
