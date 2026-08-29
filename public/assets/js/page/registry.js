/* Sổ đăng ký module theo trang.

   Đây là mảnh giữ cho Swup không làm hỏng website. Trước đây mọi tăng cường
   được gắn bằng side-effect lúc script chạy: nạp file là listener bám vào
   document, không có đường gỡ. Swup thay DOM chứ không tải lại trang, nên sau
   mười lần điều hướng sẽ có mười bản sao của cùng một listener.

   Ở đây mỗi module chỉ có một hình dạng duy nhất: init() trả về một hàm huỷ.
   Registry giữ danh sách hàm huỷ đang mở và gọi hết chúng TRƯỚC khi Swup thay
   nội dung. Không có đường nào để một module bị khởi tạo hai lần.

   Việc nạp dùng import() động: trình duyệt cache module theo URL, nên đi qua
   /la-bai/ lần thứ hai không tải lại byte nào — chỉ gọi lại init(). */

/** @typedef {() => (void | (() => void))} ModuleInit */

/* Mỗi trang khai một danh sách "tính năng". Tên trang do build.js đóng vào
   <main data-page="…">. Trang lạ hoặc thiếu thuộc tính thì chỉ nhận nhóm
   dùng chung — không ném lỗi, không chặn điều hướng. */
const PAGES = {
  home: ["landing-drag", "relief-hero"],
  library: ["card-filters", "card-tilt"],
  card: ["symbol-tooltips", "card-tilt"],
  daily: ["daily-card"],
  spread: ["spread-deck", "card-tilt"],
  "huyen-su": ["huyen-su-reveal"],
};

/* Có mặt ở gần như mọi trang; rẻ và tự thoát ngay nếu không tìm thấy phần tử. */
const SHARED = ["share", "waitlist"];

const LOADERS = {
  "card-filters": () => import("../ui/card-filters.js"),
  "card-tilt": () => import("../ui/card-tilt.js"),
  "symbol-tooltips": () => import("../ui/symbol-tooltips.js"),
  share: () => import("../ui/share.js"),
  waitlist: () => import("../ui/waitlist.js"),
  "landing-drag": () => import("../landing-drag/init.js"),
  "relief-hero": () => import("../ui/relief-hero.js"),
  "daily-card": () => import("../daily-card/page.js"),
  "spread-deck": () => import("../trai-bai.js"),
  "huyen-su-reveal": () => import("../ui/huyen-su-reveal.js"),
};

let teardowns = [];
let generation = 0;

/**
 * Khởi tạo mọi module mà trang hiện tại cần.
 * @returns {Promise<void>} hoàn tất khi tất cả module đã init xong
 */
export async function startPage() {
  // Chốt an toàn: vòng đời Swup luôn gọi stopPage() ở visit:start trước khi tới
  // đây, nhưng nếu một đường gọi nào đó bỏ sót thì danh sách hàm huỷ cũ sẽ bị
  // ghi đè và rò vĩnh viễn. Dọn trước rẻ hơn nhiều so với đi tìm chỗ rò sau này.
  if (teardowns.length) stopPage();

  const main = document.querySelector("#noi-dung-chinh");
  const page = main?.dataset.page || "";
  const features = [...new Set([...(PAGES[page] || []), ...SHARED])];

  // Mỗi lần start mang một số thế hệ. Nếu người dùng bấm sang trang khác trong
  // lúc import() còn đang bay, kết quả về trễ sẽ bị bỏ đi thay vì gắn nhầm vào
  // trang mới.
  generation += 1;
  const mine = generation;

  const results = await Promise.all(features.map(async (name) => {
    try {
      const module = await LOADERS[name]();
      if (mine !== generation) return null;
      return module.init?.() ?? null;
    } catch (error) {
      // Một module hỏng không được kéo theo cả trang. Nội dung tĩnh vẫn đọc
      // được, các module khác vẫn chạy, và điều hướng vẫn hoạt động.
      console.error(`[huong-dong] không khởi tạo được module "${name}":`, error);
      return null;
    }
  }));

  if (mine !== generation) return;
  teardowns = results.filter((value) => typeof value === "function");
}

/** Gọi hết hàm huỷ đang mở. Gọi nhiều lần liên tiếp là an toàn. */
export function stopPage() {
  // Tăng thế hệ trước khi dọn: mọi import() còn đang bay sẽ tự thấy mình lỗi
  // thời và không gắn thêm gì.
  generation += 1;
  const pending = teardowns;
  teardowns = [];
  for (const teardown of pending) {
    try {
      teardown();
    } catch (error) {
      console.error("[huong-dong] lỗi khi dọn module:", error);
    }
  }
}
