/* Unit test tất định cho motionGate: stub IntersectionObserver, document và
   matchMedia để điều khiển được cả ba điều kiện, không phụ thuộc lịch trình
   của trình duyệt thật.  node _test/motion-gate.test.mjs  */

let ioCb = null, ioDisconnected = 0, observed = null;
const mediaListeners = [];
const docListeners = {};

globalThis.IntersectionObserver = class {
  constructor(cb) { ioCb = cb; }
  observe(el) { observed = el; }
  disconnect() { ioDisconnected++; ioCb = null; }
};

const state = { hidden: false, reduced: false };
globalThis.document = {
  get hidden() { return state.hidden; },
  addEventListener(t, f) { (docListeners[t] ||= []).push(f); },
  removeEventListener(t, f) { docListeners[t] = (docListeners[t] || []).filter((x) => x !== f); },
};
globalThis.window = {
  matchMedia: () => ({
    get matches() { return state.reduced; },
    addEventListener: (t, f) => mediaListeners.push(f),
    removeEventListener: (t, f) => { const i = mediaListeners.indexOf(f); if (i > -1) mediaListeners.splice(i, 1); },
  }),
};

const { motionGate } = await import("../../public/assets/js/motion-gate.js");

let enters = 0, leaves = 0;
const el = { tag: "canvas" };
const stop = motionGate(el, { onEnter: () => enters++, onLeave: () => leaves++ });

const scroll = (isIntersecting) => ioCb?.([{ isIntersecting }]);
const setHidden = (v) => { state.hidden = v; docListeners.visibilitychange?.forEach((f) => f()); };
const setReduced = (v) => { state.reduced = v; mediaListeners.forEach((f) => f()); };

let pass = 0, fail = 0;
const check = (name, cond, extra = "") => {
  (cond ? pass++ : fail++);
  console.log(`${cond ? "  ✓" : "  ✗"} ${name}${extra ? "  " + extra : ""}`);
};

console.log("motionGate — 12 kiểm tra\n");

check("khởi tạo: observe đúng phần tử", observed === el);
check("chưa vào viewport thì chưa onEnter", enters === 0 && leaves === 0, `(${enters}/${leaves})`);

scroll(true);
check("vào viewport → onEnter 1 lần", enters === 1 && leaves === 0, `(${enters}/${leaves})`);

scroll(true); scroll(true);
check("IO báo lặp → không onEnter thêm", enters === 1, `(${enters})`);

scroll(false);
check("ra viewport → onLeave 1 lần", leaves === 1, `(${leaves})`);

scroll(false);
check("IO báo lặp → không onLeave thêm", leaves === 1, `(${leaves})`);

scroll(true);
check("vào lại → onEnter lần 2", enters === 2, `(${enters})`);

setHidden(true);
check("chuyển tab đi → onLeave", leaves === 2, `(${leaves})`);

setHidden(false);
check("quay lại tab → onEnter", enters === 3, `(${enters})`);

setReduced(true);
check("bật giảm chuyển động → onLeave", leaves === 3, `(${leaves})`);
check("bật giảm chuyển động → ngắt observer", ioDisconnected === 1, `(disconnect=${ioDisconnected})`);

scroll(true);
check("đang giảm chuyển động → cuộn không bật lại", enters === 3, `(${enters})`);

setReduced(false);
const reattached = observed === el && ioCb !== null;
check("tắt giảm chuyển động → dựng lại observer", reattached);

scroll(true);
check("sau khi tắt → onEnter hoạt động lại", enters === 4, `(${enters})`);

stop();
check("stop() → onLeave và dọn listener", leaves === 4 && ioDisconnected === 2, `(${leaves}/${ioDisconnected})`);

console.log(`\n${pass} đạt · ${fail} lỗi`);
process.exit(fail ? 1 : 0);
