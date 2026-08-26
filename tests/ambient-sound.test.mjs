import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const read = (file) => readFile(path.join(root, file), "utf8");

test("footer có điều khiển âm cảnh chủ động và credit đã duyệt", async () => {
  const layout = await read("templates/_layout.html");
  assert.match(layout, /<button[^>]+data-ambient-sound[^>]+aria-pressed="false"/);
  assert.match(layout, /data-ambient-status aria-live="polite"/);
  assert.match(layout, /Chủ biên và thiết kế website · Nguyễn Hồng Khang/);
  assert.doesNotMatch(layout, /<audio[^>]+autoplay|autoplay[^>]*>/i);
});

test("âm cảnh giữ công thức nguồn nhưng chỉ khởi động sau thao tác bấm", async () => {
  const source = await read("public/assets/js/ui/ambient-sound.js");
  assert.match(source, /\[55, 82\.5, 110\.3\]/);
  assert.match(source, /lowPass\.frequency\.value = 380/);
  assert.match(source, /window\.setInterval\(ringBell, 13_000\)/);
  assert.match(source, /button\.addEventListener\("click", onClick\)/);
  assert.ok(
    source.indexOf("new AudioContextClass()") > source.indexOf("async function startSound"),
    "AudioContext chỉ được tạo bên trong startSound sau thao tác người dùng",
  );
});

test("âm cảnh có fade, dọn timer và tạm ngưng khi tab ẩn", async () => {
  const source = await read("public/assets/js/ui/ambient-sound.js");
  assert.match(source, /linearRampToValueAtTime\(0\.13/);
  assert.match(source, /exponentialRampToValueAtTime\(0\.0001, end\)/);
  assert.match(source, /window\.clearTimeout\(firstBellTimer\)/);
  assert.match(source, /window\.clearInterval\(bellTimer\)/);
  assert.match(source, /document\.hidden\) context\.suspend\(\)/);
  assert.match(source, /return \(\) => \{/);
});

test("bootstrap khởi tạo điều khiển footer đúng một lần ngoài vòng đời Swup", async () => {
  const bootstrap = await read("public/assets/js/page-transition/bootstrap.js");
  assert.match(bootstrap, /import \{ init as initAmbientSound \} from "\.\.\/ui\/ambient-sound\.js"/);
  assert.equal([...bootstrap.matchAll(/initAmbientSound\(\)/g)].length, 1);
});
