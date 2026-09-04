import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import { planPublication } from '../scripts/publish-news-course.mjs';
const read = p => readFile(new URL('../' + p, import.meta.url), 'utf8');
const posts = JSON.parse(await read('seed/posts.json'));

test('publication creates missing posts only and preserves every admin edit', () => {
  const existing = new Map([[posts[0].slug, {title:'Admin edit', status:'draft'}]]);
  const plan = planPublication(posts, existing);
  assert.equal(plan[0].action, 'preserve-existing');
  assert.equal(plan.filter(p => p.action === 'create').length, posts.length - 1);
  assert.ok(planPublication(posts, new Map(posts.map(p => [p.slug, p]))).every(p => p.action === 'preserve-existing'));
  assert.throws(() => planPublication([posts[0], posts[0]], new Map()), /Duplicate/);
});

test('38 seed posts include 12 reflection articles with working course links and images', async () => {
  assert.equal(posts.length, 38);
  assert.equal(posts.filter(p => p.tags.includes('phản tư')).length, 12);
  const course = await read('dist/khoa-hoc/index.html');
  for (const post of posts) {
    assert.ok(post.contentHtml.length > 1000, post.slug);
    assert.ok(post.seo.title && post.seo.description, post.slug);
    assert.doesNotMatch(post.contentHtml, /href="\/(?:healing|huong-dan-tarot|trai-bai)\//);
    await access(new URL('../public' + post.coverImage.url, import.meta.url));
    for (const [,anchor] of post.contentHtml.matchAll(/href="\/khoa-hoc\/#([^"]+)"/g)) assert.ok(course.includes(`id="${anchor}"`), `${post.slug}: ${anchor}`);
  }
});

test('course keeps current modules, adds practice, and has no duplicate IDs or automatic reading', async () => {
  const course = await read('dist/khoa-hoc/index.html');
  const ids = [...course.matchAll(/\bid="([^"]+)"/g)].map(m => m[1]);
  assert.equal(new Set(ids).size, ids.length, 'Duplicate HTML IDs');
  for (const id of ['lo-trinh','nen-tang-rws','doc-la-bai','bo-cuc-trai-bai','huyen-su','phan-tu','nam-phut','bon-nha','du-kien','tinh-huong','phan-tu-doi-thoai','mau-phan-tu','dang-ky']) assert.ok(ids.includes(id), id);
  assert.doesNotMatch(course, /data-draw|data-spread|data-daily/);
  assert.match(course, /không có chức năng nhập hoặc lưu nhật ký/);
  assert.match(course, /data-waitlist/);
});

test('news pagination indexes all actual built posts, including production-only admin posts', async () => {
  const sitemap = await read('dist/sitemap.xml');
  const routes = [...sitemap.matchAll(/<loc>[^<]+?(\/tin-tuc\/(?:trang\/\d+\/)?)<\/loc>/g)].map(m => m[1]);
  assert.ok(routes.includes('/tin-tuc/'));
  const articleRoutes = [...sitemap.matchAll(/<loc>[^<]+?(\/tin-tuc\/(?!trang\/)[a-z0-9-]+\/)<\/loc>/g)].map(m => m[1]);
  const listed = [];
  for (const route of routes) {
    const html = await read('dist' + route + 'index.html');
    const links = [...html.matchAll(/<h2><a href="(\/tin-tuc\/[^\"]+\/)"/g)].map(m => m[1]);
    assert.ok(links.length <= 10);
    listed.push(...links);
  }
  assert.equal(new Set(listed).size, listed.length);
  assert.deepEqual(listed.sort(), articleRoutes.sort());
});
