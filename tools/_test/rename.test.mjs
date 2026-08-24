/* Test hồi quy cho codemod. Dựng repo giả, chạy, kiểm từng khẳng định.
 *   node _test/rename.test.mjs
 *
 * Báo cáo của test ghi vào _test/regress, KHÔNG dùng đường mặc định. Trước đây
 * test ghi đè content/rename-report.json, nên bản báo cáo nằm trong repo thật ra
 * là kết quả chạy trên repo giả 4 tệp — mà roadmap và bảng phân công lại hiểu là
 * bản quét 54 chỗ trên mã thật.
 */
import { execFileSync } from "node:child_process";
import { readFileSync, rmSync, mkdirSync, writeFileSync, cpSync } from "node:fs";

const ROOT = "_test/regress";
rmSync(ROOT, { recursive: true, force: true });
mkdirSync(`${ROOT}/src`, { recursive: true });

writeFileSync(`${ROOT}/src/cards.ts`, `export const cards = [
  { slug: "justice", roman: "XI", rws: "Justice", vi: "Lang Liêu" },
  { slug: "temperance", roman: "XIV", rws: "Temperance", vi: "Núi và biển chung nguồn" },
  { slug: "the-hermit", roman: "IX", rws: "The Hermit", vi: "Chử Đồng Tử tìm đạo" },
  { slug: "the-sun", roman: "XIX", rws: "The Sun", vi: "Ngày hội Văn Lang" },
];
`);
writeFileSync(`${ROOT}/src/home.astro`, `<ul class="tu-bat-tu">
  <li>Chử Đồng Tử</li>
  <li>Tản Viên Sơn Thánh</li>
</ul>
<article><span>IX · The Hermit</span><h3>Chử Đồng Tử tìm đạo</h3></article>
`);
writeFileSync(`${ROOT}/src/blog.md`, `Lang Liêu là người dâng bánh chưng cho vua Hùng.\n`);
// Dòng ĐÃ đổi rồi: nhãn cũ "Hùng Vương" là tiền tố của tên mới "Hùng Vương đầu triều".
writeFileSync(`${ROOT}/src/done.html`, `<tr><td>IV · The Emperor</td><td>Hùng Vương đầu triều</td></tr>
<tr><td>IV · The Emperor</td><td>Hùng Vương</td></tr>
`);

execFileSync("node", ["scripts/apply-renames.mjs", "--dir", ROOT, "--write", "--report", `${ROOT}/rename-report.json`], { stdio: "ignore" });

const cards = readFileSync(`${ROOT}/src/cards.ts`, "utf8");
const home = readFileSync(`${ROOT}/src/home.astro`, "utf8");
const blog = readFileSync(`${ROOT}/src/blog.md`, "utf8");

let pass = 0, fail = 0;
const check = (name, cond) => { cond ? pass++ : fail++; console.log(`  ${cond ? "✓" : "✗"} ${name}`); };

console.log("Codemod đổi tên — 12 kiểm tra\n");

check("XI Justice → Tô Lịch Giang Thần / Long Đỗ",
  cards.includes('slug: "justice", roman: "XI", rws: "Justice", vi: "Tô Lịch Giang Thần / Long Đỗ"'));

check("XIV Temperance → Lang Liêu (không bị XI thay tiếp)",
  cards.includes('slug: "temperance", roman: "XIV", rws: "Temperance", vi: "Lang Liêu"'));

check("XIV KHÔNG nhận nhầm tên của XI",
  !cards.includes('roman: "XIV", rws: "Temperance", vi: "Tô Lịch'));

check("IX The Hermit → Dương Không Lộ", cards.includes('vi: "Dương Không Lộ"'));

check("XIX The Sun → Man Nương (không bị luật IX chạm)", cards.includes('rws: "The Sun", vi: "Man Nương"'));

check("Tứ Bất Tử giữ nguyên Chử Đồng Tử", home.includes("<li>Chử Đồng Tử</li>"));

check("Tứ Bất Tử giữ nguyên Tản Viên Sơn Thánh", home.includes("<li>Tản Viên Sơn Thánh</li>"));

check("Nhãn lá IX trên trang chủ vẫn được đổi",
  home.includes("<h3>Dương Không Lộ</h3>") && !home.includes("<h3>Chử Đồng Tử tìm đạo</h3>"));

check("Bài blog nhắc Lang Liêu không bị đụng",
  blog.includes("Lang Liêu là người dâng bánh chưng"));

const done = readFileSync(`${ROOT}/src/done.html`, "utf8");
check("dòng đã đúng không bị nhân đôi hậu tố",
  !done.includes("đầu triều đầu triều"));
check("dòng chưa đổi vẫn được đổi",
  (done.match(/Hùng Vương đầu triều/g) || []).length === 2);

// Chạy lần hai: kết quả phải y hệt (idempotent).
const before = readFileSync(`${ROOT}/src/cards.ts`, "utf8");
execFileSync("node", ["scripts/apply-renames.mjs", "--dir", ROOT, "--write", "--report", `${ROOT}/rename-report.json`], { stdio: "ignore" });
check("chạy lại lần hai không đổi gì thêm",
  readFileSync(`${ROOT}/src/cards.ts`, "utf8") === before
  && !readFileSync(`${ROOT}/src/done.html`, "utf8").includes("đầu triều đầu triều"));

console.log(`\n${pass} đạt · ${fail} lỗi`);
rmSync(ROOT, { recursive: true, force: true });
process.exit(fail ? 1 : 0);
