import type {
  TreatmentRecordPhotoApiData,
  TreatmentRecordSummaryApiData,
} from "./treatmentRecord.types";

type TreatmentRecordThumbnailSource = Pick<
  TreatmentRecordSummaryApiData,
  "photos" | "thumbnail_url"
>;

const hasPhotoUrl = (
  photo: TreatmentRecordPhotoApiData
): photo is TreatmentRecordPhotoApiData & ({ display_url: string } | { photo_url: string }) =>
  getTreatmentRecordPhotoDisplayUrl(photo).length > 0;

export const getTreatmentRecordPhotoDisplayUrl = (photo: TreatmentRecordPhotoApiData) =>
  photo.display_url || photo.photo_url || "";

export const getTreatmentRecordThumbnailUrl = ({
  photos,
  thumbnail_url,
}: TreatmentRecordThumbnailSource) => {
  if (thumbnail_url) {
    return thumbnail_url;
  }

  const usablePhotos = [...(photos ?? [])]
    .filter(hasPhotoUrl)
    .sort((a, b) => a.sort_order - b.sort_order);
  const afterPhoto = usablePhotos.find(photo => photo.image_type === "AFTER");

  return afterPhoto
    ? getTreatmentRecordPhotoDisplayUrl(afterPhoto)
    : usablePhotos[0]
      ? getTreatmentRecordPhotoDisplayUrl(usablePhotos[0])
      : "";
};
