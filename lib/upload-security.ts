/** Resim dosyaları için magic byte kontrolü (sahte MIME'a karşı) */
const IMAGE_SIGNATURES: Record<string, number[][]> = {
  "image/jpeg": [[0xff, 0xd8, 0xff]],
  "image/png": [[0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]],
  "image/gif": [[0x47, 0x49, 0x46, 0x38, 0x37, 0x61], [0x47, 0x49, 0x46, 0x38, 0x39, 0x61]],
  "image/webp": [[0x52, 0x49, 0x46, 0x46]], // RIFF...WEBP
};

export async function validateImageBuffer(buffer: ArrayBuffer, claimedType: string): Promise<boolean> {
  const arr = new Uint8Array(buffer);
  const sigs = IMAGE_SIGNATURES[claimedType];
  if (!sigs) return false;
  for (const sig of sigs) {
    if (arr.length >= sig.length && sig.every((byte, i) => arr[i] === byte)) {
      if (claimedType === "image/webp" && arr.length >= 12) {
        const slice = arr.slice(8, 12);
        const webp = Array.from(slice).map((b) => String.fromCharCode(b)).join("");
        return webp === "WEBP";
      }
      return true;
    }
  }
  return false;
}

const ALLOWED_IMAGE = ["image/jpeg", "image/png", "image/gif", "image/webp"];
const ALLOWED_VIDEO = ["video/mp4", "video/webm", "video/quicktime"];

export function isAllowedMime(mime: string): boolean {
  return ALLOWED_IMAGE.includes(mime) || ALLOWED_VIDEO.includes(mime);
}
