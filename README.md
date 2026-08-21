# Hường Đông Tarot — mã nguồn website

Repo này phục vụ **huongdong.id.vn**. Từ 21/08/2026 đây là repo duy nhất; repo cũ
`Huong-Dong-Claude-Handover-2026-08-09-update` không còn dùng để phát hành.

## Bố cục

```
/                     mã nguồn site — build ra dist/ rồi deploy
  templates/          14 template trang
  data/               lncq-22.json, lncq-chapters.json — lớp dẫn nguồn LNCQ
  public/assets/      css, js, ảnh, font tự host
  scripts/            build.js, seed.js, serve.js
  seed/               dữ liệu mẫu, dùng khi USE_SEED_DATA=true
  tests/              chạy bằng npm test

tools/                bộ công cụ dữ liệu 78 lá (KHÔNG chạy khi build site)
archive/              toàn bộ repo cũ, giữ nguyên để tra cứu — không được build
```

## Lệnh

```bash
npm run build:local   # dựng bằng dữ liệu seed, không cần khoá Firebase
npm run build         # dựng từ Firestore thật
npm test              # 22 kiểm thử
npm run deploy        # build + firebase deploy --only hosting
```

## Phát hành

Bấm tay ở tab **Actions → "Xuất bản website (Firebase)"**. Thứ tự cố ý là
build → test → deploy: kiểm thử hỏng thì workflow dừng và **không** triển khai,
nên trang khách giữ bản cũ đang chạy tốt.

### Chốt an toàn trước khi build

Workflow kiểm 11 tệp bắt buộc và dừng ngay nếu thiếu:

`templates/` — `huyen-su`, `healing`, `tarot-la-gi`, `trai-bai`, `cua-hang`,
`card-detail`, `card-list`, `home`, `_layout` · `data/` — `lncq-22.json`,
`lncq-chapters.json`

Lý do có bước này: ngày 16/08/2026 workflow từng phát hành từ một cây thiếu 5
template và thiếu hẳn `data/`. Bản đó lên mạng mà không có `/huyen-su/`,
`/healing/`, `/tarot-la-gi/`, `/trai-bai/`, `/cua-hang/`, và mất toàn bộ lớp dẫn
nguồn Lĩnh Nam chích quái. Site chỉ có lại chúng vì ngày 18/08 có người deploy
tay từ máy mình. Bước kiểm này để lỗi đó không lặp lại.

## `archive/` là gì

Toàn bộ nội dung repo cũ, chép nguyên trạng: nhánh Next.js (`archive/source/app`,
`components`, `content`, `db`, `lib`), tài liệu dự án, ảnh tham chiếu. Không có
gì trong `archive/` được build hay deploy. Giữ lại vì đó là công việc đã làm, và
DOCX Big Update từng nhắm vào `source/app/tarot-rws/*` ở nhánh đó.

## `tools/` là gì

Đường ống dữ liệu 78 lá sinh từ DOCX Art Direction v2.1, cùng các cổng kiểm.
Xem `tools/ROADMAP.md`. Chạy độc lập, không ảnh hưởng lúc build site.
