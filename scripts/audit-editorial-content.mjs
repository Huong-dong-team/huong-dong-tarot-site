import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  BANNED_EDITORIAL_PHRASES,
  PILOT_CARD_SLUGS,
  auditPilotCards,
  exactShingleOverlaps,
} from "./lib/editorial-audit.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const cards = JSON.parse(await readFile(path.join(root, "seed/cards.json"), "utf8"));
const posts = JSON.parse(await readFile(path.join(root, "seed/posts.json"), "utf8"));
const templateNames = [
  "about.html",
  "card-list.html",
  "cua-hang.html",
  "healing.html",
  "huong-dan-dat-cau-hoi.html",
  "huong-dan-doc-la-bai.html",
  "huong-dan-tarot.html",
  "huong-dan-xao-bai.html",
  "tarot-la-gi.html",
  "trai-bai.html",
];
const referenceTopicSlugs = [
  "bai-tarot-la-gi",
  "tong-quan-bai-tarot-danh-cho-nguoi-moi-bat-dau",
  "y-nghia-78-la-bai-tarot",
  "major-arcana",
  "minor-arcana",
  "wands",
  "cups",
  "swords",
  "pentacles",
  "mot-la",
  "ba-la",
  "nam-la",
  "nguoc",
  "cau-hoi",
  "xao-bai",
  "chon-bo-bai",
];

const authoredFiles = await Promise.all(templateNames.map(async (name) => ({
  name: `templates/${name}`,
  text: await readFile(path.join(root, "templates", name), "utf8"),
})));
for (const card of cards.filter((item) => PILOT_CARD_SLUGS.includes(item.slug))) {
  authoredFiles.push({ name: `seed/cards.json#${card.slug}`, text: JSON.stringify(card) });
}
for (const post of posts) authoredFiles.push({ name: `seed/posts.json#${post.slug}`, text: post.contentHtml });

const issues = auditPilotCards(cards);
const authoredText = authoredFiles.map((file) => file.text).join("\n").toLocaleLowerCase("vi");
for (const phrase of BANNED_EDITORIAL_PHRASES.slice(0, 4)) {
  if (authoredText.includes(phrase)) issues.push(`Nội dung chứa câu sáo rỗng “${phrase}”`);
}

async function htmlFiles(directory) {
  const output = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) output.push(...await htmlFiles(fullPath));
    else if (entry.isFile() && entry.name.endsWith(".html")) output.push(fullPath);
  }
  return output;
}

const archive = process.env.MYSTIC_HOUSE_ARCHIVE?.trim();
if (archive) {
  const allSourceFiles = await htmlFiles(path.resolve(archive));
  const sourceFiles = allSourceFiles.filter((file) => {
    const normalizedPath = file.normalize("NFC").toLocaleLowerCase("vi");
    return referenceTopicSlugs.some((slug) => normalizedPath.includes(slug));
  });
  if (!sourceFiles.length) throw new Error("Không tìm thấy trang kiến thức Tarot trong MYSTIC_HOUSE_ARCHIVE.");
  for (const sourcePath of sourceFiles) {
    const sourceText = await readFile(sourcePath, "utf8");
    for (const authored of authoredFiles) {
      const overlaps = exactShingleOverlaps(sourceText, authored.text, 14, 1);
      if (!overlaps.length) continue;
      issues.push(`${authored.name}: trùng chuỗi 14 từ với ${path.relative(archive, sourcePath)}: “${overlaps[0]}”`);
    }
  }
  console.log(`Đã đối chiếu ${authoredFiles.length} phần Hường Đông với ${sourceFiles.length} tệp HTML tham khảo.`);
} else {
  console.log("Chưa đặt MYSTIC_HOUSE_ARCHIVE; lượt này chỉ kiểm tra chuẩn biên tập nội bộ.");
}

if (issues.length) {
  console.error(issues.map((issue) => `- ${issue}`).join("\n"));
  process.exitCode = 1;
} else {
  console.log(`Kiểm tra đạt: ${PILOT_CARD_SLUGS.length} lá mẫu và ${authoredFiles.length} phần nội dung.`);
}
