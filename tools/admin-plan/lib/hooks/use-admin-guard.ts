"use client";

/* Cổng chặn route ở client.
 *
 * ĐỌC KỸ: đây là TRẢI NGHIỆM, không phải bảo mật. Ai cũng bỏ qua được nó bằng
 * DevTools. Lớp bảo mật thật là Firestore Rules — hook này chỉ để người dùng
 * không lạc vào màn hình trống rồi tưởng hỏng.
 *
 * Dùng onIdTokenChanged chứ không onAuthStateChanged: claim nằm trong token, và
 * khi quyền bị thu hồi thì token đổi chứ trạng thái đăng nhập không đổi.
 */
import { useEffect, useState } from "react";
import { onIdTokenChanged, signOut, type User } from "firebase/auth";
import { auth } from "@/lib/firebase/client";

export type AdminRole = "owner" | "editor";
export type GuardState =
  | { status: "loading" }
  | { status: "anonymous" }
  | { status: "denied"; email: string | null }
  | { status: "allowed"; user: User; role: AdminRole };

export function useAdminGuard(): GuardState {
  const [state, setState] = useState<GuardState>({ status: "loading" });

  useEffect(() => {
    return onIdTokenChanged(auth, async (user) => {
      if (!user) return setState({ status: "anonymous" });

      // force refresh: nếu vừa được cấp quyền, token cũ chưa có claim.
      const token = await user.getIdTokenResult(true);

      if (token.claims.admin !== true) {
        // Đăng xuất ngay. Đừng để tài khoản không quyền ở trạng thái đã đăng
        // nhập — đó là bề mặt tấn công thừa, không đem lại gì.
        const email = user.email;
        await signOut(auth);
        return setState({ status: "denied", email });
      }

      const role = (token.claims.role as AdminRole) ?? "editor";
      setState({ status: "allowed", user, role });
    });
  }, []);

  return state;
}
