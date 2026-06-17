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
  file: File | Blob,
  options?: {
    onProgress?: (percent: number) => void;
    signEndpoint?: string;
  },
): Promise<UploadResult> {
  const signEndpoint = options?.signEndpoint ?? "/api/cloudinary/sign";
  const onProgress = options?.onProgress;

  // 1. Get signed params from our server
  const signRes = await fetch(signEndpoint, { method: "POST" });
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
        // Surface Cloudinary's actual reason instead of a generic failure —
        // e.g. "File size too large. Got 13107200. Maximum is 10485760."
        let message = "Upload failed. Please try again.";
        try {
          const body = JSON.parse(xhr.responseText);
          if (body?.error?.message) message = body.error.message;
        } catch {
          const hdr = xhr.getResponseHeader("X-Cld-Error");
          if (hdr) message = hdr;
        }
        reject(new Error(message));
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

export async function uploadUSDZToCloudinary(blob: Blob): Promise<string> {
  const signRes = await fetch("/api/cloudinary/sign", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ext: "usdz" }),
  });
  if (!signRes.ok) throw new Error("Failed to get upload signature");

  const { timestamp, signature, folder, publicId, apiKey, cloudName } =
    await signRes.json();

  const formData = new FormData();
  formData.append("file", blob, "frame.usdz");
  formData.append("timestamp", String(timestamp));
  formData.append("signature", signature);
  formData.append("api_key", apiKey);
  formData.append("folder", folder);
  formData.append("public_id", publicId);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/raw/upload`,
    { method: "POST", body: formData },
  );

  if (!res.ok) {
    throw new Error(`Cloudinary (${res.status}): ${await res.text()}`);
  }
  const data = await res.json();
  return data.secure_url as string; // ...folder/frame-...usdz
}
