/* Bộ bài Trải bài — hiệu ứng lật 3D chuyển thể từ Mystic-Draw.
   Giữ nguyên kỹ thuật gốc: perspective + preserve-3d + rotateY(180deg)
   + backface-visibility, xáo Fisher-Yates, âm thanh lật/xáo.
   Thêm cho Hường Đông: lá ngược, nút tắt đọc ngược, nối dữ liệu LNCQ.

   Hai chế độ, cùng một bộ mã:
     /trai-bai/           có <select data-spread> — người đọc tự chọn cỡ trải
     /trai-bai/<nhu-cầu>/ cỡ trải CỐ ĐỊNH qua data-spread-size, kèm nhãn vị trí
                          qua data-positions (ngăn nhau bằng "|")
   Trang nào không khai hai thuộc tính đó thì chạy đúng như trước.

   Từ khi website chuyển cảnh bằng Swup, file này là một ES module có init() và
   hàm huỷ thay vì IIFE tự chạy: Swup thay DOM chứ không tải lại trang, nên thẻ
   <script> trong nội dung mới sẽ không bao giờ chạy lại, còn timer và <audio>
   của trang cũ thì phải được tắt bằng tay. */

/* 22 Ẩn chính nằm trong deck-data.js — một script cổ điển gán window.HD_DECK.
   Module tự nạp nó khi cần và nhớ lại Promise, nên đi vào ba trang trải bài
   liên tiếp chỉ tải dữ liệu đúng một lần. */
let deckPromise = null;
function loadDeck() {
  if (window.HD_DECK) return Promise.resolve(window.HD_DECK);
  if (deckPromise) return deckPromise;
  deckPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "/assets/js/deck-data.js";
    script.onload = () => resolve(window.HD_DECK);
    script.onerror = () => { deckPromise = null; reject(new Error("deck-data-failed")); };
    document.head.append(script);
  });
  return deckPromise;
}

export function init() {
  const root = document.getElementById("hd-deck");
  if (!root) return () => {};

  let disposed = false;
  let teardown = null;
  loadDeck()
    .then((deck) => {
      if (disposed || !deck) return;
      teardown = mount(root, deck);
    })
    // Không có dữ liệu bài thì phần chữ của trang vẫn đọc được nguyên vẹn.
    .catch(() => {});

  return () => {
    disposed = true;
    teardown?.();
    teardown = null;
  };
}

function mount(root, deck) {
  var deckEl   = root.querySelector("[data-deck]");
  var drawBtn  = root.querySelector("[data-draw]");
  var soundBtn = root.querySelector("[data-sound]");
  var revBtn   = root.querySelector("[data-reversed]");
  var spreadEl = root.querySelector("[data-spread]");
  var readEl   = root.querySelector("[data-reading]");

  var fixedSize = parseInt(root.getAttribute("data-spread-size"), 10) || 0;
  var positions = (root.getAttribute("data-positions") || "")
    .split("|").map(function (s) { return s.trim(); }).filter(Boolean);
  var posOf = function (i) { return positions[i] || ""; };

  var soundOn = true, allowReversed = true;
  var flipAudio = new Audio("/assets/audio/card-flip.mp3");
  var shuffleAudio = new Audio("/assets/audio/shuffle.mp3");

  function play(a) {
    if (!soundOn) return;
    try { a.currentTime = 0; a.volume = 0.7; a.play(); } catch (e) {}
  }

  /* Fisher-Yates — xáo đều, không thiên vị. */
  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function makeCard(card, reversed, index) {
    var el = document.createElement("button");
    el.className = "hd-card";
    el.type = "button";
    el.style.setProperty("--i", index);
    el.setAttribute("aria-label", "Lá úp thứ " + (index + 1) + ". Bấm để lật.");
    el.innerHTML =
      '<span class="hd-card-inner">' +
        '<span class="hd-card-back"></span>' +
        '<span class="hd-card-front' + (reversed ? " reversed" : "") + '">' +
          '<img src="' + card.img + '" alt="" loading="lazy">' +
        "</span>" +
      "</span>";
    el.addEventListener("click", function () {
      if (el.classList.contains("flipped")) return;
      play(flipAudio);
      el.classList.add("flipped");
      var pos = posOf(index);
      el.setAttribute("aria-label", (pos ? pos + ": " : "") + card.roman + " · " + card.en + (reversed ? " (ngược)" : ""));
      renderReading(card, reversed, index);
    });
    return el;
  }

  function renderReading(card, reversed, index) {
    var src = card.inLNCQ
      ? "Lĩnh Nam chích quái · Chương " + card.chapter + " · " + card.chapterTitle
      : "Ngoài Lĩnh Nam chích quái";
    var pos = posOf(index);
    var item = document.createElement("article");
    item.className = "hd-reading-item";
    item.innerHTML =
      (pos ? '<p class="hd-pos">' + pos + "</p>" : "") +
      '<p class="hd-reading-head"><strong>' + card.roman + " · " + card.en + "</strong>" +
      (reversed ? ' <span class="hd-rev">ngược</span>' : "") + "</p>" +
      "<p>" + card.summary + "</p>" +
      '<p class="hd-reading-src">' + src +
      ' · <a class="v2-link" href="/la-bai/' + card.slug + '/">Xem lá đầy đủ →</a></p>';
    readEl.appendChild(item);
  }

  /* Nhãn vị trí phải nằm cạnh lá úp, trước khi lật — đó là thứ cho biết lá này
     đang trả lời câu hỏi nào. Bọc thêm một lớp .hd-slot chứ không nhét vào
     trong nút, để nhãn không bị lật theo mặt bài. */
  function makeSlot(card, reversed, index) {
    var btn = makeCard(card, reversed, index);
    var pos = posOf(index);
    if (!pos) return btn;
    var slot = document.createElement("div");
    slot.className = "hd-slot";
    var label = document.createElement("p");
    label.className = "hd-pos";
    label.textContent = pos;
    slot.appendChild(label);
    slot.appendChild(btn);
    btn.setAttribute("aria-label", pos + ". Lá úp thứ " + (index + 1) + ". Bấm để lật.");
    return slot;
  }

  function spreadSize() {
    if (fixedSize) return fixedSize;
    return (spreadEl && parseInt(spreadEl.value, 10)) || 3;
  }

  function deal() {
    play(shuffleAudio);
    deckEl.innerHTML = "";
    readEl.innerHTML = "";
    shuffle(deck).slice(0, spreadSize()).forEach(function (card, i) {
      var reversed = allowReversed && Math.random() < 0.5;
      deckEl.appendChild(makeSlot(card, reversed, i));
    });
    root.querySelector("[data-hint]").hidden = false;
  }

  drawBtn.addEventListener("click", deal);
  if (spreadEl) spreadEl.addEventListener("change", deal);
  soundBtn.addEventListener("click", function () {
    soundOn = !soundOn;
    soundBtn.textContent = soundOn ? "🔊 Âm thanh: bật" : "🔇 Âm thanh: tắt";
    soundBtn.setAttribute("aria-pressed", String(soundOn));
  });
  revBtn.addEventListener("click", function () {
    allowReversed = !allowReversed;
    revBtn.textContent = allowReversed ? "Đọc ngược: bật" : "Đọc ngược: tắt";
    revBtn.setAttribute("aria-pressed", String(allowReversed));
    deal();
  });

  deal();

  return function destroy() {
    // Hai thẻ <audio> được tạo bằng JS nên chúng không nằm trong cây DOM mà
    // Swup gỡ đi. Không dừng ở đây thì tiếng xáo bài còn chạy tiếp trên trang
    // kế, và trình duyệt vẫn giữ bộ giải mã âm thanh cho một trang đã đóng.
    flipAudio.pause();
    shuffleAudio.pause();
    flipAudio.src = "";
    shuffleAudio.src = "";
  };
}
