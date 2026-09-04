import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { pathToFileURL } from 'node:url';

export const revision = 'news-course-2026-09-04';
export const project = 'huong-dong-tarot-729d2';

export function planPublication(posts, existing) {
  if (new Set(posts.map(p => p.slug)).size !== posts.length) throw new Error('Duplicate post slug');
  return posts.map(post => {
    if (!/^[a-z0-9-]+$/.test(post.slug) || post.status !== 'published' || !post.contentHtml || !Number.isFinite(Date.parse(post.publishedAt))) throw new Error('Invalid publication record');
    const prior = existing.get(post.slug);
    // Never replace a post edited in admin. A retry leaves all existing docs intact.
    return {slug: post.slug, action: prior ? 'preserve-existing' : 'create', post};
  });
}

async function main() {
  const posts = JSON.parse(await readFile(new URL('../seed/posts.json', import.meta.url), 'utf8'));
  if (!process.argv.includes('--apply')) {
    planPublication(posts, new Map());
    console.log(`Preview only: ${posts.length} posts; no Firestore writes. Existing posts will be preserved.`);
    return;
  }
  if (process.env.FIREBASE_PROJECT_ID !== project || process.env.NEWS_PUBLISH_CONFIRM !== project || !process.env.GOOGLE_APPLICATION_CREDENTIALS) throw new Error('Explicit production project confirmation and credentials required');
  const { initializeApp, applicationDefault } = await import('firebase-admin/app');
  const { getFirestore, Timestamp } = await import('firebase-admin/firestore');
  initializeApp({credential: applicationDefault(), projectId: project});
  const db = getFirestore();
  const refs = posts.map(p => db.collection('posts').doc(p.slug));
  const results = await db.runTransaction(async tx => {
    const snapshots = await tx.getAll(...refs);
    const existing = new Map(snapshots.filter(s => s.exists).map(s => [s.id, s.data()]));
    const plan = planPublication(posts, existing);
    for (const item of plan) {
      if (item.action !== 'create') continue;
      const post = item.post;
      tx.create(db.collection('posts').doc(item.slug), {
        ...post,
        publishedAt: Timestamp.fromDate(new Date(post.publishedAt)),
        createdAt: Timestamp.fromDate(new Date(post.createdAt || post.publishedAt)),
        updatedAt: Timestamp.now(),
        editorialRevision: revision,
        editorialContentHash: createHash('sha256').update(post.contentHtml).digest('hex'),
      });
    }
    return plan.map(({slug, action}) => ({slug, action}));
  });
  const report = {revision, project, completedAt: new Date().toISOString(), results};
  await writeFile('news-publication-report.json', JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) await main();
