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
): photo is TreatmentRecordPhotoApiData & { photo_url: string } =>
  typeof photo.photo_url === "string" && photo.photo_url.length > 0;

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

  return afterPhoto?.photo_url ?? usablePhotos[0]?.photo_url ?? "";
};
