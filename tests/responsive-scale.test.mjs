import test from "node:test";
import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const cssDir = path.join(root, "public/assets/css");

async function readAllCss() {
  const names = (await readdir(cssDir)).filter((name) => name.endsWith(".css")).sort();
  const files = await Promise.all(names.map((name) => readFile(path.join(cssDir, name), "utf8")));
  return names.map((name, i) => [name, files[i]]);
}

/* Thang sáu mốc của docs/breakpoints.md. Chiều max-width dùng đúng con số, chiều
   min-width dùng mốc + 1 để hai dải không bao giờ chồng lên nhau. Trước khi
   thống nhất, 16 tệp dùng 19 con số tự đặt và sửa bố cục tablet ở một chỗ là
   lệch với chỗ khác. */
const MOC_MAX = [430, 620, 760, 900, 1100, 1180];
const MOC_MIN = MOC_MAX.map((n) => n + 1);

test("mọi @media theo bề ngang đều rơi đúng thang breakpoint chuẩn", async () => {
  const lac = [];
  for (const [name, css] of await readAllCss()) {
    for (const [, huong, so] of css.matchAll(/\((max|min)-width:\s*(\d+)px\)/g)) {
      const hopLe = huong === "max" ? MOC_MAX : MOC_MIN;
      if (!hopLe.includes(Number(so))) lac.push(`${name}: ${huong}-width ${so}px`);
    }
  }
  assert.deepEqual(lac, [],
    `mốc lạc khỏi thang docs/breakpoints.md (max: ${MOC_MAX.join(", ")}; min: ${MOC_MIN.join(", ")})`);
});

/* Trên máy cảm ứng :hover dính lại sau khi chạm và không có cách nào bỏ — thẻ
   bài nhấc lên rồi đứng nguyên ở đó tới khi chạm chỗ khác. Mọi trang trí hover
   phải nằm trong @media (hover: hover); :focus-visible thì KHÔNG, vì tablet có
   bàn phím rời vẫn cần viền focus. */
test("không có luật :hover nào nằm ngoài @media (hover: hover)", async () => {
  const ho = [];
  for (const [name, css] of await readAllCss()) {
    const stack = [];
    let depth = 0;
    let i = 0;
    while (i < css.length) {
      if (css.startsWith("/*", i)) { i = css.indexOf("*/", i) + 2 || css.length; continue; }
      if (css.startsWith("@media", i)) {
        const mo = css.indexOf("{", i);
        stack.push({ cond: css.slice(i + 6, mo).trim(), depth });
        i = mo;
        continue;
      }
      const c = css[i];
      if (c === "{") depth++;
      else if (c === "}") {
        depth--;
        while (stack.length && stack.at(-1).depth >= depth) stack.pop();
      } else if (css.startsWith(":hover", i)) {
        const boc = stack.some((m) => /hover:\s*hover/.test(m.cond));
        // Ngoại lệ có chủ ý: các luật vô hiệu hoá trong prefers-reduced-motion
        // đặt transform về none — đúng cả khi hover lỡ dính trên máy cảm ứng.
        const voHieuHoa = stack.some((m) => /prefers-reduced-motion:\s*reduce/.test(m.cond));
        if (!boc && !voHieuHoa) {
          ho.push(`${name}:${css.slice(0, i).split("\n").length}`);
        }
        i += 6;
        continue;
      }
      i++;
    }
  }
  assert.deepEqual(ho, [], "luật :hover chưa bọc @media (hover: hover)");
});

test("sàn chiều cao của Hero trang chủ có đường thoát cho máy nằm ngang", async () => {
  const css = await readFile(path.join(cssDir, "home-standalone.css"), "utf8");
  // clamp(820px, ...) biến Hero thành ~1,9 màn hình trên điện thoại xoay ngang
  // (đo trên 932x430). Khối vá phải còn thì con số đó mới không quay lại.
  assert.match(css, /@media \(min-width: 901px\) and \(max-height: 820px\)/,
    "mất khối vá khung nhìn thấp — Hero sẽ lại cao 820px khi máy nằm ngang");
  assert.match(css, /min-height:\s*100svh/);
});
