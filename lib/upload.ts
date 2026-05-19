export interface UploadResult {
  url: string;
  publicId: string;
  width: number;
  height: number;
  bytes: number;
}

const MAX_SIZE = 25 * 1024 * 1024; // 25MB
const VALID_TYPES = ["image/jpeg", "image/png"];

export function validateFile(file: File): string | null {
  if (!VALID_TYPES.includes(file.type)) {
    return "Please upload a JPG or PNG image.";
  }
  if (file.size > MAX_SIZE) {
    return "File is too large. Maximum size is 25MB.";
  }
  return null;
}

export async function uploadToCloudinary(
  file: File,
  onProgress?: (percent: number) => void,
): Promise<UploadResult> {
  // 1. Get signed params from our server
  const signRes = await fetch("/api/cloudinary/sign", { method: "POST" });
  if (!signRes.ok) throw new Error("Failed to get upload signature");
  const { timestamp, signature, folder, apiKey, cloudName } =
    await signRes.json();

  // 2. Upload directly to Cloudinary
  const formData = new FormData();
  formData.append("file", file);
  formData.append("timestamp", String(timestamp));
  formData.append("signature", signature);
  formData.append("api_key", apiKey);
  formData.append("folder", folder);

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open(
      "POST",
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    );

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        const data = JSON.parse(xhr.responseText);
        resolve({
          url: data.secure_url,
          publicId: data.public_id,
          width: data.width,
          height: data.height,
          bytes: data.bytes,
        });
      } else {
        reject(new Error("Upload failed"));
      }
    };

    xhr.onerror = () => reject(new Error("Upload failed"));
    xhr.send(formData);
  });
}

export async function uploadModelToCloudinary(blob: Blob): Promise<string> {
  const signRes = await fetch("/api/cloudinary/sign", { method: "POST" });
  if (!signRes.ok) throw new Error("Failed to get upload signature");
  const { timestamp, signature, folder, apiKey, cloudName } =
    await signRes.json();

  const formData = new FormData();
  formData.append("file", blob, "frame.glb");
  formData.append("timestamp", String(timestamp));
  formData.append("signature", signature);
  formData.append("api_key", apiKey);
  formData.append("folder", folder);

  // Note: /raw/upload instead of /image/upload — GLB is a non-image file
  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/raw/upload`,
    { method: "POST", body: formData },
  );

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Cloudinary (${res.status}): ${errorText}`);
  }
  const data = await res.json();
  return data.secure_url;
}
