/* Cổng mật khẩu cho trang chỉ dành cho thành viên.

   ĐỌC KỸ TRƯỚC KHI TIN: đây KHÔNG phải lớp bảo mật. Trang được dựng tĩnh và
   Firebase Hosting trả toàn bộ HTML cho bất kỳ ai gõ đúng URL, nên nội dung
   phía sau cổng đã nằm sẵn trong máy khách trước khi ai đó nhập mật khẩu. Người
   biết mở Developer Tools luôn xem được. Cổng này chỉ để trang không mở toang
   cho người lạc vào, và để nói rõ đây là khu vực nội bộ.

   Muốn chặn thật thì phải chặn ở phía máy chủ — Firebase Authentication cộng
   một hàm Cloud Function trả nội dung, hoặc đặt trang sau một dịch vụ có xác
   thực. Việc đó lớn hơn hẳn và cần bàn riêng.

   Mật khẩu không nằm thẳng trong mã: build.js đóng SHA-256 của (mật khẩu + muối)
   vào data-gate-hash. Đó chỉ là để mật khẩu không hiện ra khi ai đó đọc lướt mã
   nguồn trang, không làm cổng chắc thêm chút nào. */

const STORAGE_KEY = "hd-member-unlocked";
const SALT = "huong-dong-thanh-vien-v1";

/** Đọc cờ đã mở khoá. Trình duyệt chặn storage (chế độ riêng tư) thì coi như chưa mở. */
function readUnlocked() {
  try {
    return sessionStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

/** Ghi cờ đã mở khoá; im lặng bỏ qua nếu storage bị chặn — trang vẫn dùng được trong phiên. */
function rememberUnlocked() {
  try {
    sessionStorage.setItem(STORAGE_KEY, "1");
  } catch {
    /* không nhớ được thì lần điều hướng sau phải nhập lại, chấp nhận được */
  }
}

/**
 * Băm chuỗi bằng SHA-256 của Web Crypto.
 * @param {string} value
 * @returns {Promise<string>} chuỗi hex thường
 */
async function sha256Hex(value) {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * @returns {() => void} hàm huỷ cho registry
 */
export function init() {
  const gate = document.querySelector("[data-member-gate]");
  const content = document.querySelector("[data-member-content]");
  if (!gate || !content) return () => {};

  const form = gate.querySelector("[data-member-gate-form]");
  const input = gate.querySelector("[data-member-gate-input]");
  const status = gate.querySelector("[data-member-gate-status]");
  const expected = (gate.dataset.gateHash || "").toLowerCase();

  function unlock() {
    gate.hidden = true;
    content.hidden = false;
  }

  // Đã mở khoá trong phiên này thì vào thẳng, không bắt gõ lại sau mỗi lần
  // chuyển trang bằng Swup.
  if (readUnlocked()) unlock();

  /** @param {SubmitEvent} event */
  async function onSubmit(event) {
    event.preventDefault();
    if (!input || !expected) return;
    const value = input.value.trim();
    if (!value) return;

    // crypto.subtle chỉ tồn tại trong ngữ cảnh an toàn (https hoặc localhost).
    // Nếu không có thì báo thẳng thay vì im lặng từ chối mật khẩu đúng.
    if (!globalThis.crypto?.subtle) {
      if (status) status.textContent = "Trình duyệt không mở được cổng ở kết nối này. Hãy dùng địa chỉ https.";
      return;
    }

    let digest = "";
    try {
      digest = await sha256Hex(`${SALT}:${value}`);
    } catch {
      if (status) status.textContent = "Không kiểm tra được mật khẩu. Thử tải lại trang.";
      return;
    }

    if (digest !== expected) {
      if (status) status.textContent = "Mật khẩu chưa đúng. Kiểm tra lại giúp mình nhé.";
      input.select();
      return;
    }

    if (status) status.textContent = "";
    input.value = "";
    rememberUnlocked();
    unlock();
    // Đưa tiêu điểm vào phần vừa mở để người dùng bàn phím và trình đọc màn hình
    // biết trang đã đổi, thay vì đứng lại ở ô mật khẩu vừa biến mất.
    content.querySelector("[data-daily-draw]")?.focus();
  }

  form?.addEventListener("submit", onSubmit);

  return () => {
    form?.removeEventListener("submit", onSubmit);
  };
}
