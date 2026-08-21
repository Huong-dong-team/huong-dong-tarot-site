import test from "node:test";
import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
async function files(directory) { const output = []; for (const entry of await readdir(directory, { withFileTypes: true })) { if (["node_modules", "dist"].includes(entry.name)) continue; const full = path.join(directory, entry.name); if (entry.isDirectory()) output.push(...await files(full)); else output.push(full); } return output; }
test("không có TODO, FIXME hoặc code rút gọn", async () => {
  for (const file of await files(root)) {
    if (!/\.(js|mjs|html|css|md|json|rules)$/.test(file)) continue;
    if (file.endsWith("source-integrity.test.mjs")) continue;
    const text = await readFile(file, "utf8");
    assert.doesNotMatch(text, /\b(?:TODO|FIXME)\b|phần còn lại giữ nguyên|implement here/i, file);
  }
});
