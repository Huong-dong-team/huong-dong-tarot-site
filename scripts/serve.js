import http from "node:http";
import { readFile, stat } from "node:fs/promises";
import { existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
import path from "node:path";

const root = path.resolve("dist");

if (!existsSync(path.join(root, "index.html"))) {
  console.log("dist chưa có sẵn; dựng bản xem thử bằng dữ liệu mẫu, không ghi Firestore.");
  execFileSync(process.execPath, ["scripts/build.js", "--seed"], { stdio: "inherit" });
}

const portFlag = process.argv.indexOf("--port");
const port = Number(portFlag >= 0 ? process.argv[portFlag + 1] : process.env.PORT || 3000);
const types = { ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".mjs": "text/javascript; charset=utf-8", ".json": "application/json", ".xml": "application/xml", ".webp": "image/webp", ".png": "image/png", ".svg": "image/svg+xml" };
http.createServer(async (request, response) => {
  try {
    const urlPath = decodeURIComponent(new URL(request.url, `http://${request.headers.host}`).pathname);
    let target = path.join(root, urlPath);
    if (!target.startsWith(root)) throw new Error("Đường dẫn không hợp lệ");
    const info = await stat(target).catch(() => null);
    if (info?.isDirectory()) target = path.join(target, "index.html");
    if (!info && !path.extname(target)) target = path.join(target, "index.html");
    const body = await readFile(target);
    response.writeHead(200, { "Content-Type": types[path.extname(target)] || "application/octet-stream" });
    response.end(body);
  } catch {
    response.writeHead(404, { "Content-Type": "text/html; charset=utf-8" });
    response.end(await readFile(path.join(root, "404.html")));
  }
}).listen(port, "0.0.0.0", () => console.log(`Hường Đông đang chạy tại http://localhost:${port}`));

