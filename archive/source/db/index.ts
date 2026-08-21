import { drizzle } from "drizzle-orm/d1";

export async function getD1(): Promise<D1Database> {
  const { env } = await import("cloudflare:workers");
  if (!env.DB) {
    throw new Error(
      "Cloudflare D1 binding `DB` is unavailable. Configure the logical D1 binding before using commerce persistence.",
    );
  }

  return env.DB;
}

export function getDb() {
  return getD1().then((database) => drizzle(database));
}
