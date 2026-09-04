import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
const run = promisify(execFile);
const read = p => readFile(new URL('../' + p, import.meta.url), 'utf8');

test('production build stops before touching dist when credentials are absent', async () => {
  const before = await read('dist/index.html');
  await assert.rejects(run(process.execPath, ['scripts/build.js'], {
    // A whitespace value blocks .env fallback while remaining invalid credentials.
    env: {...process.env, USE_SEED_DATA:'false', GOOGLE_APPLICATION_CREDENTIALS:' ', FIREBASE_PROJECT_ID:'test-no-credentials'},
  }), /Thiếu GOOGLE_APPLICATION_CREDENTIALS/);
  assert.equal(await read('dist/index.html'), before);
  const source = await read('scripts/build.js');
  assert.doesNotMatch(source, /Không thể kết nối Firestore, dùng dữ liệu mẫu|!hasValidCreds/);
});

test('current site links go to the five content destinations, not retired experiences', async () => {
  for (const route of ['', 'tarot-la-gi/', 'la-bai/', 'khoa-hoc/', 'tin-tuc/', 'cua-hang/']) {
    const html = await read(`dist/${route}index.html`);
    assert.doesNotMatch(html, /href="\/(?:healing|trai-bai|la-bai-hom-nay|huong-dan-tarot)(?:\/|#|")/, route);
    const nav = html.match(/<nav id="main-nav"[\s\S]*?<\/nav>/)?.[0] || '';
    const topLinks = [...nav.matchAll(/class="nav-group-top" href="([^"]+)"/g)].map(m => m[1]);
    assert.deepEqual(topLinks, ['/tarot-la-gi/','/la-bai/','/khoa-hoc/','/tin-tuc/','/cua-hang/']);
    assert.match(html, /href="\/favicon\.svg"/);
    assert.match(html, /src="\/assets\/img\/logo-huong-dong\.webp"/);
  }
});

test('the two main course calls to action still lead into the course', async () => {
  const home = await read('dist/index.html');
  assert.match(home, /href="\/khoa-hoc\/">Khám phá khóa học/);
  assert.match(home, /href="\/khoa-hoc\/#dang-ky"/);
  const course = await read('dist/khoa-hoc/index.html');
  assert.match(course, /id="dang-ky"/);
  assert.match(course, /data-waitlist/);
});
