/* Bộ bài Trải bài — hiệu ứng lật 3D chuyển thể từ Mystic-Draw.
   Giữ nguyên kỹ thuật gốc: perspective + preserve-3d + rotateY(180deg)
   + backface-visibility, xáo Fisher-Yates, âm thanh lật/xáo.
   Thêm cho Hường Đông: lá ngược, nút tắt đọc ngược, nối dữ liệu LNCQ. */
(function () {
  var root = document.getElementById("hd-deck");
  if (!root || !window.HD_DECK) return;

  var deckEl   = root.querySelector("[data-deck]");
  var drawBtn  = root.querySelector("[data-draw]");
  var soundBtn = root.querySelector("[data-sound]");
  var revBtn   = root.querySelector("[data-reversed]");
  var spreadEl = root.querySelector("[data-spread]");
  var readEl   = root.querySelector("[data-reading]");

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
      el.setAttribute("aria-label", card.roman + " · " + card.en + (reversed ? " (ngược)" : ""));
      renderReading(card, reversed);
    });
    return el;
  }

  function renderReading(card, reversed) {
    var src = card.inLNCQ
      ? "Lĩnh Nam chích quái · Chương " + card.chapter + " · " + card.chapterTitle
      : "Ngoài Lĩnh Nam chích quái";
    var item = document.createElement("article");
    item.className = "hd-reading-item";
    item.innerHTML =
      '<p class="hd-reading-head"><strong>' + card.roman + " · " + card.en + "</strong>" +
      (reversed ? ' <span class="hd-rev">ngược</span>' : "") + "</p>" +
      "<p>" + card.summary + "</p>" +
      '<p class="hd-reading-src">' + src +
      ' · <a class="v2-link" href="/la-bai/' + card.slug + '/">Xem lá đầy đủ →</a></p>';
    readEl.appendChild(item);
  }

  function deal() {
    play(shuffleAudio);
    deckEl.innerHTML = "";
    readEl.innerHTML = "";
    var n = parseInt(spreadEl.value, 10) || 3;
    shuffle(window.HD_DECK).slice(0, n).forEach(function (card, i) {
      var reversed = allowReversed && Math.random() < 0.5;
      deckEl.appendChild(makeCard(card, reversed, i));
    });
    root.querySelector("[data-hint]").hidden = false;
  }

  drawBtn.addEventListener("click", deal);
  spreadEl.addEventListener("change", deal);
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
})();
