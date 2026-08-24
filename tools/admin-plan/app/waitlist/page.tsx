"use client";

/* Waitlist Dashboard — collection `subscribers`.
 *
 * Vì sao tải hết một lần rồi lọc/phân trang phía client:
 *   Danh sách chờ ở giai đoạn OpenBeta cỡ vài trăm tới vài nghìn dòng. Ở quy mô
 *   đó, một lượt đọc rồi lọc trong bộ nhớ vừa nhanh hơn vừa rẻ hơn phân trang
 *   bằng cursor — và cho phép Export CSV toàn bộ mà không phải tải lại.
 *   Khi vượt ~5.000 dòng thì đổi sang startAfter() + đếm bằng aggregation query.
 *   Ngưỡng đó được ghi ngay trong code (LIMIT) để không ai phải đoán.
 */
import { useEffect, useMemo, useState } from "react";
import { collection, getDocs, limit, orderBy, query, type Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { COL } from "@/lib/firebase/collections";
import type { Subscriber } from "@/types/subscriber";
import { toCsv, downloadCsv } from "@/lib/export/to-csv";

const LIMIT = 5000;      // vượt ngưỡng này thì chuyển sang phân trang cursor
const PAGE = 25;

const fmtDate = (t: Timestamp | null) =>
  t ? new Intl.DateTimeFormat("vi-VN", { dateStyle: "short", timeStyle: "short" }).format(t.toDate()) : "—";

export default function WaitlistPage() {
  const [rows, setRows] = useState<Subscriber[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [source, setSource] = useState("");
  const [page, setPage] = useState(0);

  useEffect(() => {
    (async () => {
      try {
        const snap = await getDocs(
          query(collection(db, COL.subscribers), orderBy("createdAt", "desc"), limit(LIMIT)),
        );
        setRows(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Subscriber));
      } catch (e) {
        // Lỗi hay gặp nhất ở đây là permission-denied vì token chưa có claim
        // admin — nói thẳng ra thay vì để bảng trống không rõ lý do.
        setError(e instanceof Error ? e.message : String(e));
      }
    })();
  }, []);

  const sources = useMemo(
    () => [...new Set((rows ?? []).map((r) => r.source).filter(Boolean))].sort(),
    [rows],
  );

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return (rows ?? []).filter(
      (r) =>
        (!needle || r.email.toLowerCase().includes(needle) || r.note?.toLowerCase().includes(needle)) &&
        (!source || r.source === source),
    );
  }, [rows, q, source]);

  const pageRows = filtered.slice(page * PAGE, page * PAGE + PAGE);
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE));

  function exportCsv() {
    // Xuất theo bộ lọc đang thấy, không xuất toàn bộ — người dùng gần như luôn
    // muốn đúng cái họ vừa lọc ra.
    const csv = toCsv(
      filtered.map((r) => ({ ...r, createdAt: fmtDate(r.createdAt) })),
      [
        { key: "email", label: "Email" },
        { key: "source", label: "Nguồn" },
        { key: "createdAt", label: "Đăng ký lúc" },
        { key: "note", label: "Ghi chú" },
      ],
    );
    downloadCsv(`danh-sach-cho-${new Date().toISOString().slice(0, 10)}.csv`, csv);
  }

  if (error) {
    return (
      <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-4 text-sm">
        <p className="font-medium">Không đọc được danh sách chờ</p>
        <p className="mt-1 text-muted-foreground">{error}</p>
        <p className="mt-2 text-muted-foreground">
          Thường là do token chưa có claim <code>admin</code>. Đăng xuất rồi đăng nhập lại;
          nếu vẫn lỗi thì tài khoản chưa được cấp quyền.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <header className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Danh sách chờ</h1>
          <p className="text-sm text-muted-foreground">
            {rows === null ? "Đang tải…" : `${filtered.length} / ${rows.length} email`}
            {rows !== null && rows.length >= LIMIT && (
              <span className="ml-2 text-amber-600">
                Đã chạm mốc {LIMIT.toLocaleString("vi-VN")} — nên chuyển sang phân trang cursor.
              </span>
            )}
          </p>
        </div>
        <button
          onClick={exportCsv}
          disabled={!filtered.length}
          className="rounded-md border px-3 py-2 text-sm font-medium hover:bg-accent disabled:opacity-50"
        >
          Xuất CSV ({filtered.length})
        </button>
      </header>

      <div className="flex flex-wrap gap-2">
        <input
          value={q}
          onChange={(e) => { setQ(e.target.value); setPage(0); }}
          placeholder="Tìm theo email hoặc ghi chú"
          className="h-9 min-w-64 flex-1 rounded-md border px-3 text-sm"
        />
        <select
          value={source}
          onChange={(e) => { setSource(e.target.value); setPage(0); }}
          className="h-9 rounded-md border px-3 text-sm"
        >
          <option value="">Mọi nguồn</option>
          {sources.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left">
            <tr>
              <th className="px-3 py-2 font-medium">Email</th>
              <th className="px-3 py-2 font-medium">Nguồn</th>
              <th className="px-3 py-2 font-medium">Đăng ký lúc</th>
              <th className="px-3 py-2 font-medium">Ghi chú</th>
            </tr>
          </thead>
          <tbody>
            {rows === null && (
              <tr><td colSpan={4} className="px-3 py-8 text-center text-muted-foreground">Đang tải…</td></tr>
            )}
            {rows !== null && !filtered.length && (
              <tr><td colSpan={4} className="px-3 py-8 text-center text-muted-foreground">
                {rows.length ? "Không có dòng nào khớp bộ lọc." : "Chưa có ai đăng ký."}
              </td></tr>
            )}
            {pageRows.map((r) => (
              <tr key={r.id} className="border-t">
                <td className="px-3 py-2 font-medium">{r.email}</td>
                <td className="px-3 py-2 text-muted-foreground">{r.source || "—"}</td>
                <td className="px-3 py-2 text-muted-foreground">{fmtDate(r.createdAt)}</td>
                <td className="px-3 py-2 text-muted-foreground">{r.note || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pageCount > 1 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Trang {page + 1} / {pageCount}</span>
          <div className="flex gap-2">
            <button onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0}
              className="rounded-md border px-3 py-1.5 disabled:opacity-50">Trước</button>
            <button onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))} disabled={page >= pageCount - 1}
              className="rounded-md border px-3 py-1.5 disabled:opacity-50">Sau</button>
          </div>
        </div>
      )}
    </div>
  );
}
