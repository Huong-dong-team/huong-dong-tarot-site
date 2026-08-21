import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import { auth, db } from "./firebase.js";

export const login = (email, password) => signInWithEmailAndPassword(auth, email, password);
export const logout = () => signOut(auth);
// Hàm này trả về hàm hủy đăng ký của onAuthStateChanged, không phải Promise,
// nên lỗi phải đi qua onError — nơi gọi không .catch() được. Ném lỗi từ trong
// callback bất đồng bộ cũng vô ích: nó thành unhandled rejection và người dùng
// không thấy lý do vì sao vừa đăng nhập đã bị đẩy ra.
export function observeAdmin(callback, onError = () => {}) {
  return onAuthStateChanged(auth, async (user) => {
    try {
      if (!user) return callback(null);
      const snapshot = await getDoc(doc(db, "admins", user.uid));
      if (!snapshot.exists()) {
        await signOut(auth);
        onError(new Error("Tài khoản đã đăng nhập nhưng chưa được cấp quyền quản trị."));
        return;
      }
      await callback({ user, profile: snapshot.data() });
    } catch (error) {
      onError(error);
    }
  });
}
