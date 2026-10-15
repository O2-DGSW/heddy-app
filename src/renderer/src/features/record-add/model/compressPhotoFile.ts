const MAX_UPLOAD_PHOTO_BYTES = 900 * 1024;
const MAX_UPLOAD_PHOTO_DIMENSION = 1440;
const MIN_UPLOAD_PHOTO_DIMENSION = 720;
const INITIAL_IMAGE_QUALITY = 0.82;
const MIN_IMAGE_QUALITY = 0.5;
const IMAGE_QUALITY_STEP = 0.08;
const IMAGE_DIMENSION_STEP_RATIO = 0.8;
// 원본 사진을 한꺼번에 디코딩하면 iOS WebView 메모리가 순간적으로 크게 뛴다.
const PHOTO_COMPRESSION_CONCURRENCY = 2;

const getCompressedFileName = (fileName: string) => {
  const dotIndex = fileName.lastIndexOf(".");
  const baseName = dotIndex > 0 ? fileName.slice(0, dotIndex) : fileName;

  return `${baseName}.jpg`;
};

const loadImage = (file: File) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("사진을 압축하지 못했습니다."));
    };
    image.src = objectUrl;
  });

const getScaledImageSize = (width: number, height: number, maxDimension: number) => {
  const largestSide = Math.max(width, height);

  if (largestSide <= maxDimension) {
    return { width, height };
  }

  const ratio = maxDimension / largestSide;

  return {
    width: Math.round(width * ratio),
    height: Math.round(height * ratio),
  };
};

const canvasToBlob = (canvas: HTMLCanvasElement, quality: number) =>
  new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      blob => {
        if (!blob) {
          reject(new Error("사진을 압축하지 못했습니다."));
          return;
        }

        resolve(blob);
      },
      "image/jpeg",
      quality
    );
  });

const createImageCanvas = (image: HTMLImageElement, maxDimension: number) => {
  const { width, height } = getScaledImageSize(
    image.naturalWidth,
    image.naturalHeight,
    maxDimension
  );
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  if (!context) {
    return null;
  }

  canvas.width = width;
  canvas.height = height;
  context.drawImage(image, 0, 0, width, height);

  return canvas;
};

/** iOS Safari는 canvas 메모리를 늦게 돌려주므로 크기를 0으로 줄여 바로 놓아준다 */
const releaseCanvas = (canvas: HTMLCanvasElement) => {
  canvas.width = 0;
  canvas.height = 0;
};

const compressImage = async (image: HTMLImageElement) => {
  let maxDimension = MAX_UPLOAD_PHOTO_DIMENSION;
  let smallestBlob: Blob | null = null;

  while (maxDimension >= MIN_UPLOAD_PHOTO_DIMENSION) {
    const canvas = createImageCanvas(image, maxDimension);

    if (!canvas) {
      return smallestBlob;
    }

    let quality = INITIAL_IMAGE_QUALITY;
    let compressedBlob: Blob;

    try {
      compressedBlob = await canvasToBlob(canvas, quality);
      smallestBlob =
        !smallestBlob || compressedBlob.size < smallestBlob.size ? compressedBlob : smallestBlob;

      while (compressedBlob.size > MAX_UPLOAD_PHOTO_BYTES && quality > MIN_IMAGE_QUALITY) {
        quality = Math.max(MIN_IMAGE_QUALITY, quality - IMAGE_QUALITY_STEP);
        compressedBlob = await canvasToBlob(canvas, quality);
        smallestBlob =
          !smallestBlob || compressedBlob.size < smallestBlob.size ? compressedBlob : smallestBlob;
      }
    } finally {
      releaseCanvas(canvas);
    }

    if (compressedBlob.size <= MAX_UPLOAD_PHOTO_BYTES) {
      return compressedBlob;
    }

    maxDimension = Math.floor(maxDimension * IMAGE_DIMENSION_STEP_RATIO);
  }

  return smallestBlob;
};

export const compressPhotoFile = async (file: File): Promise<File> => {
  if (!file.type.startsWith("image/") || file.size <= MAX_UPLOAD_PHOTO_BYTES) {
    return file;
  }

  try {
    const image = await loadImage(file);
    const compressedBlob = await compressImage(image);

    if (!compressedBlob || compressedBlob.size >= file.size) {
      return file;
    }

    return new File([compressedBlob], getCompressedFileName(file.name), {
      lastModified: file.lastModified,
      type: "image/jpeg",
    });
  } catch {
    return file;
  }
};

/** 여러 장을 고르면 동시에 최대 2장만 압축한다. 결과는 고른 순서를 그대로 따른다 */
export const compressPhotoFiles = async (files: File[]): Promise<File[]> => {
  const results = [...files];
  const entries = files.entries();

  const compressNext = async () => {
    for (const [index, file] of entries) {
      results[index] = await compressPhotoFile(file);
    }
  };

  await Promise.all(
    Array.from({ length: Math.min(PHOTO_COMPRESSION_CONCURRENCY, files.length) }, compressNext)
  );

  return results;
};
