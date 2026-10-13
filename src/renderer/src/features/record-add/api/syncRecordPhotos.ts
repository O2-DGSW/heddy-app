import {
  addTreatmentRecordPhotoApi,
  deleteTreatmentRecordPhotoApi,
  updateTreatmentRecordPhotoApi,
} from "@/entities/record";
import type { PhotoItem } from "@/entities/record";

interface SyncRecordPhotosParams {
  recordId: string;
  /** 화면을 열 때 서버에서 받은 사진. 배열 순서가 곧 서버의 표시 순서다 */
  initialPhotos: PhotoItem[];
  /** 저장 시점의 사진. 배열 순서가 곧 바뀐 표시 순서다 */
  photos: PhotoItem[];
}

const isNewPhoto = (photo: PhotoItem): photo is PhotoItem & { file: File } =>
  photo.file !== undefined;

/**
 * 수정 화면의 사진을 서버와 맞춘다.
 * - 화면에서 뺀 사진은 지운다.
 * - 새로 고른 사진은 올려서 붙인다.
 * - 남아 있던 사진은 자리가 바뀌었을 때만 순서를 고친다. 지웠다 다시 붙이지 않으므로
 *   photo_id가 유지되고, 이 사진을 참조하는 분석 결과도 끊기지 않는다.
 *
 * 표시 순서는 화면에 보이는 차례 그대로 매긴다. 새 사진이 목록 맨 앞에 붙는데
 * 서버에서만 맨 뒤로 가면 저장하고 다시 들어왔을 때 순서가 달라 보인다.
 * 지우는 일을 먼저 해야 10장 제한에 걸리지 않는다.
 */
export const syncRecordPhotos = async ({
  recordId,
  initialPhotos,
  photos,
}: SyncRecordPhotosParams): Promise<void> => {
  const keptIds = new Set(photos.filter(photo => !isNewPhoto(photo)).map(photo => photo.id));

  for (const initialPhoto of initialPhotos) {
    if (!keptIds.has(initialPhoto.id)) {
      await deleteTreatmentRecordPhotoApi(recordId, initialPhoto.id);
    }
  }

  for (const [sortOrder, photo] of photos.entries()) {
    if (isNewPhoto(photo)) {
      await addTreatmentRecordPhotoApi(recordId, {
        file: photo.file,
        image_type: "AFTER",
        sort_order: sortOrder,
      });

      continue;
    }

    const previousSortOrder = initialPhotos.findIndex(initialPhoto => initialPhoto.id === photo.id);

    if (previousSortOrder !== sortOrder) {
      await updateTreatmentRecordPhotoApi(recordId, photo.id, { sort_order: sortOrder });
    }
  }
};
