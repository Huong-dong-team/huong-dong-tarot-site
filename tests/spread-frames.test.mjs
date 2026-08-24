/* Cổng nghiệm thu Lớp 2 của 1.2 · 1.3 · 1.4 — theo §7 của
 * tools/KE-HOACH-1.2-1.4-khung-trai-bai.md.
 *
 * Điều quan trọng nhất ở đây không phải "khung có chạy không", mà là khung
 * KHÔNG lấn sang Lớp 3: không trang nào được tự ý bỏ noindex, vào sitemap, hay
 * in ra chữ "Có"/"Không" thật khi quy tắc phân cực chưa ai chốt.
 */
import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const read = (route) => readFile(path.join(root, "dist", route.replace(/^\//, ""), "index.html"), "utf8");

const frames = [
  { route: "/trai-bai/co-khong/", size: 1, positions: "", verdict: true },
  { route: "/trai-bai/ba-la/", size: 3, positions: "Quá khứ|Hiện tại|Hướng đi", verdict: false },
  { route: "/trai-bai/tinh-yeu/", size: 3, positions: "Vị trí 1|Vị trí 2|Vị trí 3", verdict: false },
];

test("ba trang có bộ rút bài với cỡ trải cố định", async () => {
  for (const frame of frames) {
    const html = await read(frame.route);
    assert.match(html, /id="hd-deck"/, frame.route);
    assert.match(html, new RegExp(`data-spread-size="${frame.size}"`), frame.route);
    assert.match(html, /<button type="button" data-draw>/, frame.route);
    // Cỡ trải do trang quyết định, không cho người đọc đổi — đó là khác biệt
    // giữa trang theo nhu cầu và trang /trai-bai/ tổng hợp.
    assert.doesNotMatch(html, /data-spread=/, `${frame.route} không được có dropdown chọn cỡ trải`);
  }
});

test("mỗi lá của trải ba lá đều có nhãn vị trí", async () => {
  for (const frame of frames.filter((f) => f.size === 3)) {
    const html = await read(frame.route);
    const found = html.match(/data-positions="([^"]*)"/)?.[1];
    assert.equal(found, frame.positions, frame.route);
    assert.equal(found.split("|").filter(Boolean).length, 3, `${frame.route}: thiếu nhãn vị trí`);
  }
});

test("trang Có hoặc Không có khối kết luận nhưng CHƯA kết luận", async () => {
  const html = await read("/trai-bai/co-khong/");
  assert.match(html, /class="hd-verdict"/);
  assert.match(html, /<span class="v2-pending">Đang phát triển thêm<\/span>/);
  // §4: quy tắc phân cực chưa được chốt. Khung không được tự chế ra một câu
  // trả lời — đặt sai rồi sửa ngược tốn hơn là để trống có nhãn.
  const verdict = html.match(/<div class="hd-verdict"[\s\S]*?<\/div>/)?.[0] || "";
  assert.doesNotMatch(verdict, /\b(CÓ|KHÔNG)\b/, "khối kết luận không được in ra phán quyết thật");
});

test("khung không tự mở index và không tự vào sitemap", async () => {
  const sitemap = await readFile(path.join(root, "dist/sitemap.xml"), "utf8");
  for (const frame of frames) {
    const html = await read(frame.route);
    assert.match(html, /<meta name="robots" content="noindex,follow">/, frame.route);
    assert.ok(!sitemap.includes(frame.route), `${frame.route} chưa được vào sitemap khi Lớp 3 còn dở`);
  }
});

test("khung không tải ảnh mới ngoài tranh lá đã có", async () => {
  for (const frame of frames) {
    const html = await read(frame.route);
    for (const [, src] of html.matchAll(/<img[^>]+src="([^"]+)"/g)) {
      assert.match(src, /^\/assets\/img\//, `${frame.route}: ảnh lạ ${src}`);
    }
  }
});

test("trang /trai-bai/ tổng hợp vẫn giữ dropdown chọn cỡ trải", async () => {
  // Khung mới không được làm hỏng trang cũ: ở đó người đọc vẫn tự chọn cỡ trải.
  const html = await read("/trai-bai/");
  assert.match(html, /data-spread/);
  assert.doesNotMatch(html, /data-spread-size=/);
});
