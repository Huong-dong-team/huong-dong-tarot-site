import { addDoc, collection, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import { ref, uploadBytesResumable, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-storage.js";
import { db, storage } from "../firebase.js";

function canvasBlob(file, maxSize, quality = .85) {
  return new Promise((resolve, reject) => {
    const image = new Image(); image.onload = () => {
      const scale = Math.min(1, maxSize / Math.max(image.naturalWidth, image.naturalHeight)); const width = Math.round(image.naturalWidth * scale); const height = Math.round(image.naturalHeight * scale);
      const canvas = document.createElement("canvas"); canvas.width = width; canvas.height = height; canvas.getContext("2d").drawImage(image, 0, 0, width, height);
      canvas.toBlob((blob) => blob ? resolve({ blob, width, height }) : reject(new Error("Không chuyển được ảnh")), "image/webp", quality);
      URL.revokeObjectURL(image.src);
    }; image.onerror = reject; image.src = URL.createObjectURL(file);
  });
}
function put(path, blob, progress) { return new Promise((resolve, reject) => { const task = uploadBytesResumable(ref(storage, path), blob, { contentType: "image/webp" }); task.on("state_changed", (snapshot) => progress(snapshot.bytesTransferred / snapshot.totalBytes), reject, async () => resolve(await getDownloadURL(task.snapshot.ref))); }); }
export async function uploadMedia(file, alt, progress = () => {}, cardMode = false) {
  if (!alt.trim()) throw new Error("Phải nhập alt text tiếng Việt.");
  if (file.size > 10 * 1024 * 1024) throw new Error("Ảnh vượt quá 10 MB.");
  if (!/^image\/(jpeg|png|webp)$/.test(file.type)) throw new Error("Chỉ nhận JPG, PNG hoặc WebP.");
  const now = new Date(); const id = crypto.randomUUID(); const dir = `images/${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, "0")}`;
  const full = await canvasBlob(file, cardMode ? 2000 : 1600); const thumb = await canvasBlob(file, 400); const fullPath = `${dir}/${id}.webp`; const thumbPath = `${dir}/${id}-thumb.webp`;
  const url = await put(fullPath, full.blob, (value) => progress(value * .75)); const thumbnailUrl = await put(thumbPath, thumb.blob, (value) => progress(.75 + value * .25));
  const record = { storagePath: fullPath, thumbnailPath: thumbPath, url, thumbnailUrl, alt: alt.trim(), fileName: file.name, mimeType: "image/webp", width: full.width, height: full.height, sizeBytes: full.blob.size, createdAt: serverTimestamp() };
  const snapshot = await addDoc(collection(db, "media"), record); return { id: snapshot.id, ...record };
}
