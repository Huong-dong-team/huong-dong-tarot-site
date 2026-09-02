import test from "node:test";
import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

test("lệnh xuất bản PR1 mặc định chỉ xem trước đúng 8 lá và 2 bài", async () => {
  const { stdout } = await execFileAsync(process.execPath, ["scripts/publish-editorial-pr1.mjs"]);
  assert.match(stdout, /Firestore chưa được ghi/);
  assert.equal([...stdout.matchAll(/^- cards\//gm)].length, 8);
  assert.equal([...stdout.matchAll(/^- posts\//gm)].length, 2);
  assert.doesNotMatch(stdout, /createdAt|culturalReviewStatus|image/);
});

test("chế độ ghi từ chối chạy khi chưa có thông tin xác nhận dự án", async () => {
  await assert.rejects(
    execFileAsync(process.execPath, ["scripts/publish-editorial-pr1.mjs", "--apply"], {
      env: {
        PATH: process.env.PATH,
        FIREBASE_PROJECT_ID: "du-an-thu-nghiem",
      },
    }),
    /Thiếu GOOGLE_APPLICATION_CREDENTIALS/,
  );
});

