/* Xuất CSV.
 *
 * Hai chỗ dễ sai mà thư viện nhỏ thường bỏ qua:
 *
 * 1. CSV injection. Ô bắt đầu bằng = + - @ sẽ được Excel hiểu là công thức. Một
 *    email dạng "=cmd|..." có thể chạy lệnh trên máy người mở file. Chèn dấu
 *    nháy đơn ở đầu để Excel coi là chữ.
 *
 * 2. Dấu tiếng Việt. Excel trên Windows đọc CSV theo bảng mã hệ thống, không
 *    mặc định UTF-8 — thiếu BOM là "Nguyễn" thành "Nguyá»…n". Phải thêm ﻿.
 */
const RISKY = /^[=+\-@\t\r]/;

function cell(value: unknown): string {
  if (value === null || value === undefined) return "";
  let s = String(value);
  if (RISKY.test(s)) s = "'" + s;
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function toCsv<T extends Record<string, unknown>>(
  rows: T[],
  columns: { key: keyof T & string; label: string }[],
): string {
  const head = columns.map((c) => cell(c.label)).join(",");
  const body = rows.map((r) => columns.map((c) => cell(r[c.key])).join(",")).join("\r\n");
  return "﻿" + head + "\r\n" + body + "\r\n";
}

export function downloadCsv(filename: string, csv: string): void {
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
