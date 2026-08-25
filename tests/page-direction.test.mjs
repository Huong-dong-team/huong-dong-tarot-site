import test from "node:test";
import assert from "node:assert/strict";

class FakeElement {
  constructor({ closest = {}, rect = {} } = {}) {
    this.closestMatches = closest;
    this.rect = { left: 0, top: 0, width: 20, height: 20, ...rect };
  }

  closest(selector) {
    return this.closestMatches[selector] || null;
  }

  getBoundingClientRect() {
    return this.rect;
  }
}

globalThis.Element = FakeElement;
globalThis.window = {
  innerWidth: 1200,
  innerHeight: 800,
  matchMedia: () => ({ matches: false }),
};

const groups = Array.from({ length: 7 }, () => new FakeElement());
globalThis.document = {
  querySelectorAll: (selector) => selector === "#main-nav > .nav-group" ? groups : [],
};

const { attachDirection, directionFor } = await import("../public/assets/js/page-transition/direction.js");

test("bảy nhóm menu ánh xạ đúng bốn hướng", () => {
  const expected = ["left", "left", "top", "bottom", "top", "right", "right"];
  groups.forEach((group, index) => {
    const link = new FakeElement({ closest: { ".nav-group": group } });
    assert.equal(directionFor(link), expected[index]);
  });

  const cta = new FakeElement({ closest: { ".nav-cta": new FakeElement() } });
  assert.equal(directionFor(cta), "right");
});

test("link trong nội dung lấy hướng từ vị trí thật", () => {
  assert.equal(directionFor(new FakeElement({ rect: { left: 40, top: 300 } })), "left");
  assert.equal(directionFor(new FakeElement({ rect: { left: 1100, top: 300 } })), "right");
  assert.equal(directionFor(new FakeElement({ rect: { left: 590, top: 80 } })), "top");
  assert.equal(directionFor(new FakeElement({ rect: { left: 590, top: 700 } })), "bottom");
});

test("visit click nhận animation name còn Back/Forward giữ cơ chế cũ", () => {
  let handler;
  const swup = {
    hooks: {
      on: (name, callback, options) => {
        assert.equal(name, "visit:start");
        assert.deepEqual(options, { priority: -20 });
        handler = callback;
      },
      off: () => {},
    },
  };

  attachDirection(swup);
  const groupLink = new FakeElement({ closest: { ".nav-group": groups[3] } });
  const clickVisit = { history: {}, trigger: { el: groupLink }, animation: {} };
  handler(clickVisit);
  assert.equal(clickVisit.animation.name, "from-bottom");

  const historyVisit = { history: { popstate: true }, trigger: { el: groupLink }, animation: {} };
  handler(historyVisit);
  assert.equal(historyVisit.animation.name, undefined);
});
